import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Container } from 'typedi'
import { AuthService } from '../../services/AuthService'
import { UserCategoryService } from '../../services/UserCategoryService'
import { RedisService } from '../../infrastructure/cache/RedisService'
import { CategoryType, CategoryStatus } from '../../core/entities/Category'

export default async function userCategoryRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Get services from container
  const userRepository = Container.get('IUserRepository') as any
  const userCategoryRepository = Container.get('IUserCategoryRepository') as any
  const accountRepository = Container.get('IAccountRepository') as any
  const redisService = Container.get(RedisService)
  const userCategoryService = Container.get(UserCategoryService)
  const authService = new AuthService(userRepository, userCategoryRepository, accountRepository, redisService)
  const prefix = '/api/user-categories'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // GET /api/user-categories - List user's categories
  fastify.get(`${prefix}`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const filters = {
        type: query.type as CategoryType,
        status: query.status as CategoryStatus,
        isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
        isDefault: query.isDefault === 'true' ? true : query.isDefault === 'false' ? false : undefined,
        isCustom: query.isCustom === 'true' ? true : query.isCustom === 'false' ? false : undefined,
        parentCategoryId: query.parentCategoryId,
        searchTerm: query.search,
        sortBy: query.sortBy as 'name' | 'createdAt' | 'sortOrder',
        sortOrder: query.sortOrder as 'ASC' | 'DESC',
        limit: query.limit ? parseInt(query.limit) : undefined,
        offset: query.offset ? parseInt(query.offset) : undefined
      }

      const result = await userCategoryService.getUserCategories(user.id, filters)

      return {
        success: true,
        data: {
          categories: result.categories,
          total: result.total,
          pagination: {
            limit: filters.limit || result.total,
            offset: filters.offset || 0,
            hasMore: result.total > (filters.offset || 0) + (filters.limit || result.total)
          },
          summary: {
            total: result.total,
            active: result.categories.filter(c => c.isActive).length,
            custom: result.categories.filter(c => c.isCustom).length,
            templateBased: result.categories.filter(c => c.categoryTemplateId).length,
            byType: {
              INCOME: result.categories.filter(c => c.type === CategoryType.INCOME).length,
              EXPENSE: result.categories.filter(c => c.type === CategoryType.EXPENSE).length,
              TRANSFER: result.categories.filter(c => c.type === CategoryType.TRANSFER).length
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/user-categories/active - Get only active categories
  fastify.get(`${prefix}/active`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const type = query.type as CategoryType

      const categories = await userCategoryService.getActiveUserCategories(user.id, type)

      return {
        success: true,
        data: {
          categories,
          total: categories.length,
          type: type || 'ALL'
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/user-categories/type/:type - Get categories by type
  fastify.get(`${prefix}/type/:type`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { type } = request.params as { type: CategoryType }
      const query = request.query as any

      if (!['INCOME', 'EXPENSE', 'TRANSFER'].includes(type)) {
        return reply.status(400).send({
          success: false,
          message: 'Tipo inválido. Use: INCOME, EXPENSE ou TRANSFER'
        })
      }

      const options = {
        isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
        isDefault: query.isDefault === 'true' ? true : query.isDefault === 'false' ? false : undefined,
        sortBy: query.sortBy as 'name' | 'sortOrder',
        sortOrder: query.sortOrder as 'ASC' | 'DESC'
      }

      const categories = await userCategoryService.getUserCategoriesByType(user.id, type, options)

      return {
        success: true,
        data: {
          type,
          categories,
          total: categories.length
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/user-categories/:id - Get specific user category
  fastify.get(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const category = await userCategoryService.getUserCategoryById(id, user.id)

      if (!category) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      return {
        success: true,
        data: category
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // POST /api/user-categories - Create custom user category
  fastify.post(`${prefix}`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const body = request.body as any

      // Validations
      if (!body.name || !body.type) {
        return reply.status(400).send({
          success: false,
          message: 'Nome e tipo são obrigatórios',
          errors: ['name e type são campos obrigatórios']
        })
      }

      if (!['INCOME', 'EXPENSE', 'TRANSFER'].includes(body.type)) {
        return reply.status(400).send({
          success: false,
          message: 'Tipo deve ser INCOME, EXPENSE ou TRANSFER',
          errors: ['Tipo inválido']
        })
      }

      const categoryData = {
        userId: user.id,
        name: body.name,
        description: body.description,
        type: body.type as CategoryType,
        color: body.color || '#3B82F6',
        icon: body.icon || '📂',
        parentCategoryId: body.parentCategoryId,
        isDefault: body.isDefault || false,
        sortOrder: body.sortOrder,
        tags: body.tags || [],
        metadata: body.metadata
      }

      const category = await userCategoryService.createUserCategory(categoryData)

      return reply.status(201).send({
        success: true,
        data: category,
        message: 'Categoria criada com sucesso'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('already exists') || errorMessage.includes('já existe')) {
        return reply.status(409).send({
          success: false,
          message: 'Categoria com este nome já existe',
          errors: ['Categoria duplicada']
        })
      }

      if (errorMessage.includes('Parent category')) {
        return reply.status(400).send({
          success: false,
          message: 'Categoria pai inválida',
          errors: ['Categoria pai não encontrada ou não pertence ao usuário']
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // POST /api/user-categories/from-template/:templateId - Create category from template
  fastify.post(`${prefix}/from-template/:templateId`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { templateId } = request.params as { templateId: string }
      const body = request.body as any

      const customizations = {
        name: body.name,
        description: body.description,
        color: body.color,
        icon: body.icon,
        sortOrder: body.sortOrder,
        isDefault: body.isDefault
      }

      const category = await userCategoryService.createFromTemplate(user.id, templateId, customizations)

      return reply.status(201).send({
        success: true,
        data: category,
        message: 'Categoria criada a partir do template com sucesso'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('template not found') || errorMessage.includes('não encontrado')) {
        return reply.status(404).send({
          success: false,
          message: 'Template de categoria não encontrado'
        })
      }

      if (errorMessage.includes('already exists') || errorMessage.includes('já existe')) {
        return reply.status(409).send({
          success: false,
          message: 'Categoria com este nome já existe',
          errors: ['Categoria duplicada']
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // PUT /api/user-categories/:id - Update user category
  fastify.put(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const body = request.body as any

      const updateData = {
        name: body.name,
        description: body.description,
        color: body.color,
        icon: body.icon,
        sortOrder: body.sortOrder,
        isDefault: body.isDefault,
        tags: body.tags,
        metadata: body.metadata
      }

      const category = await userCategoryService.updateUserCategory(id, user.id, updateData)

      return {
        success: true,
        data: category,
        message: 'Categoria atualizada com sucesso'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('not found') || errorMessage.includes('não encontrada')) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      if (errorMessage.includes('already exists') || errorMessage.includes('já existe')) {
        return reply.status(409).send({
          success: false,
          message: 'Categoria com este nome já existe',
          errors: ['Nome duplicado']
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // PATCH /api/user-categories/:id/archive - Archive category
  fastify.patch(`${prefix}/:id/archive`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      const category = await userCategoryService.archiveUserCategory(id, user.id)

      return {
        success: true,
        data: category,
        message: 'Categoria arquivada com sucesso'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('not found') || errorMessage.includes('não encontrada')) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // PATCH /api/user-categories/:id/activate - Activate category
  fastify.patch(`${prefix}/:id/activate`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      const category = await userCategoryService.activateUserCategory(id, user.id)

      return {
        success: true,
        data: category,
        message: 'Categoria ativada com sucesso'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('not found') || errorMessage.includes('não encontrada')) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // DELETE /api/user-categories/:id - Delete category
  fastify.delete(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      await userCategoryService.deleteUserCategory(id, user.id)

      return {
        success: true,
        message: 'Categoria deletada com sucesso'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('not found') || errorMessage.includes('não encontrada')) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      if (errorMessage.includes('being used') || errorMessage.includes('sendo usada')) {
        return reply.status(409).send({
          success: false,
          message: 'Categoria não pode ser deletada pois está sendo usada em transações ou orçamentos. Arquive-a ao invés disso.',
          errors: ['Categoria em uso']
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // POST /api/user-categories/setup-defaults - Setup default categories for user
  fastify.post(`${prefix}/setup-defaults`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const categories = await userCategoryService.setupDefaultCategoriesForUser(user.id)

      return {
        success: true,
        data: {
          categories,
          total: categories.length
        },
        message: 'Categorias padrão configuradas com sucesso'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('No default') || errorMessage.includes('templates found')) {
        return reply.status(404).send({
          success: false,
          message: 'Nenhum template padrão encontrado'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/user-categories/:id/usage - Get category usage statistics
  fastify.get(`${prefix}/:id/usage`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      const stats = await userCategoryService.getCategoryUsageStats(id, user.id)

      return {
        success: true,
        data: {
          categoryId: id,
          usage: stats
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('not found') || errorMessage.includes('não encontrada')) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/user-categories/analytics - Get user category analytics
  fastify.get(`${prefix}/analytics`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const analytics = await userCategoryService.getUserCategoryAnalytics(user.id)

      return {
        success: true,
        data: analytics
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // Test route
  fastify.get(`${prefix}/test`, async (request, reply) => {
    return {
      success: true,
      message: 'API de categorias de usuário funcionando!',
      timestamp: new Date().toISOString()
    }
  })
}
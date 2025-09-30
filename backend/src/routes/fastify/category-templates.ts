import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Container } from 'typedi'
import { AuthService } from '../../services/AuthService'
import { CategoryTemplateService } from '../../services/CategoryTemplateService'
import { RedisService } from '../../infrastructure/cache/RedisService'
import { CategoryType } from '../../core/entities/Category'

export default async function categoryTemplateRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Get services from container
  const userRepository = Container.get('IUserRepository') as any
  const redisService = Container.get(RedisService)
  const categoryTemplateService = Container.get(CategoryTemplateService)
  const authService = new AuthService(userRepository, redisService)
  const prefix = '/api/category-templates'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // Helper to check admin privileges (for now, just validate user exists)
  const requireAuth = async (authHeader?: string) => {
    const user = await getUserFromToken(authHeader)
    if (!user) {
      throw new Error('Usuário não autenticado')
    }
    return user
  }

  // GET /api/category-templates - List all category templates
  fastify.get(`${prefix}`, async (request, reply) => {
    try {
      const query = request.query as any
      const filters = {
        type: query.type as CategoryType,
        isDefault: query.isDefault === 'true' ? true : query.isDefault === 'false' ? false : undefined,
        isSystem: query.isSystem === 'true' ? true : query.isSystem === 'false' ? false : undefined,
        sortOrder: query.sortOrder as 'ASC' | 'DESC',
        limit: query.limit ? parseInt(query.limit) : undefined,
        offset: query.offset ? parseInt(query.offset) : undefined
      }

      const result = await categoryTemplateService.getAllTemplates(filters)

      return {
        success: true,
        data: {
          templates: result.templates,
          total: result.total,
          pagination: {
            limit: filters.limit || result.total,
            offset: filters.offset || 0,
            hasMore: result.total > (filters.offset || 0) + (filters.limit || result.total)
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/category-templates/:id - Get specific template
  fastify.get(`${prefix}/:id`, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const template = await categoryTemplateService.getTemplateById(id)

      if (!template) {
        return reply.status(404).send({
          success: false,
          message: 'Template de categoria não encontrado'
        })
      }

      return {
        success: true,
        data: template
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/category-templates/type/:type - Get templates by type
  fastify.get(`${prefix}/type/:type`, async (request, reply) => {
    try {
      const { type } = request.params as { type: CategoryType }
      const query = request.query as any

      if (!['INCOME', 'EXPENSE', 'TRANSFER'].includes(type)) {
        return reply.status(400).send({
          success: false,
          message: 'Tipo inválido. Use: INCOME, EXPENSE ou TRANSFER'
        })
      }

      const options = {
        isDefault: query.isDefault === 'true' ? true : query.isDefault === 'false' ? false : undefined,
        isSystem: query.isSystem === 'true' ? true : query.isSystem === 'false' ? false : undefined,
        sortOrder: query.sortOrder as 'ASC' | 'DESC',
        limit: query.limit ? parseInt(query.limit) : undefined
      }

      const templates = await categoryTemplateService.getTemplatesByType(type, options)

      return {
        success: true,
        data: {
          type,
          templates,
          total: templates.length
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/category-templates/default - Get default templates only
  fastify.get(`${prefix}/default`, async (request, reply) => {
    try {
      const query = request.query as any
      const options = {
        type: query.type as CategoryType,
        sortOrder: query.sortOrder as 'ASC' | 'DESC'
      }

      const templates = await categoryTemplateService.getDefaultTemplates(options)

      return {
        success: true,
        data: {
          templates,
          total: templates.length,
          groupedByType: {
            INCOME: templates.filter(t => t.type === CategoryType.INCOME),
            EXPENSE: templates.filter(t => t.type === CategoryType.EXPENSE),
            TRANSFER: templates.filter(t => t.type === CategoryType.TRANSFER)
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // POST /api/category-templates - Create new template (Admin only)
  fastify.post(`${prefix}`, async (request, reply) => {
    try {
      await requireAuth(request.headers.authorization)

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

      const templateData = {
        name: body.name,
        description: body.description,
        type: body.type as CategoryType,
        color: body.color || '#3B82F6',
        icon: body.icon || '📂',
        isDefault: body.isDefault || false,
        isSystem: body.isSystem !== undefined ? body.isSystem : true,
        sortOrder: body.sortOrder,
        tags: body.tags || [],
        metadata: body.metadata
      }

      const template = await categoryTemplateService.createTemplate(templateData)

      return reply.status(201).send({
        success: true,
        data: template,
        message: 'Template de categoria criado com sucesso'
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
          message: 'Template com este nome e tipo já existe',
          errors: ['Template duplicado']
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // PUT /api/category-templates/:id - Update template (Admin only)
  fastify.put(`${prefix}/:id`, async (request, reply) => {
    try {
      await requireAuth(request.headers.authorization)

      const { id } = request.params as { id: string }
      const body = request.body as any

      const updateData = {
        description: body.description,
        color: body.color,
        icon: body.icon,
        isDefault: body.isDefault,
        sortOrder: body.sortOrder,
        tags: body.tags,
        metadata: body.metadata
      }

      const template = await categoryTemplateService.updateTemplate(id, updateData)

      return {
        success: true,
        data: template,
        message: 'Template atualizado com sucesso'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('not found') || errorMessage.includes('não encontrado')) {
        return reply.status(404).send({
          success: false,
          message: 'Template não encontrado'
        })
      }

      if (errorMessage.includes('cannot be modified') || errorMessage.includes('System')) {
        return reply.status(403).send({
          success: false,
          message: 'Templates do sistema não podem ser modificados'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // DELETE /api/category-templates/:id - Delete template (Admin only)
  fastify.delete(`${prefix}/:id`, async (request, reply) => {
    try {
      await requireAuth(request.headers.authorization)

      const { id } = request.params as { id: string }

      await categoryTemplateService.deleteTemplate(id)

      return {
        success: true,
        message: 'Template deletado com sucesso'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('not found') || errorMessage.includes('não encontrado')) {
        return reply.status(404).send({
          success: false,
          message: 'Template não encontrado'
        })
      }

      if (errorMessage.includes('cannot be deleted') || errorMessage.includes('System')) {
        return reply.status(403).send({
          success: false,
          message: 'Templates do sistema não podem ser deletados'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/category-templates/:id/usage - Get template usage statistics
  fastify.get(`${prefix}/:id/usage`, async (request, reply) => {
    try {
      await requireAuth(request.headers.authorization)

      const { id } = request.params as { id: string }

      const stats = await categoryTemplateService.getUsageStats(id)

      return {
        success: true,
        data: {
          templateId: id,
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

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/category-templates/search - Search templates
  fastify.get(`${prefix}/search`, async (request, reply) => {
    try {
      const query = request.query as any

      if (!query.q) {
        return reply.status(400).send({
          success: false,
          message: 'Parâmetro de busca "q" é obrigatório'
        })
      }

      const filters = {
        type: query.type as CategoryType,
        isDefault: query.isDefault === 'true' ? true : query.isDefault === 'false' ? false : undefined,
        isSystem: query.isSystem === 'true' ? true : query.isSystem === 'false' ? false : undefined,
        limit: query.limit ? parseInt(query.limit) : 20
      }

      const templates = await categoryTemplateService.searchTemplates(query.q, filters)

      return {
        success: true,
        data: {
          query: query.q,
          filters,
          templates,
          total: templates.length
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

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
      message: 'API de templates de categoria funcionando!',
      timestamp: new Date().toISOString()
    }
  })
}
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Container } from 'typedi'
import { AuthService } from '../../services/AuthService'
import { RedisService } from '../../infrastructure/cache/RedisService'

export default async function categoryRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Temporary fix for DI issues
  const categoryRepository = Container.get('ICategoryRepository') as any
  const userRepository = Container.get('IUserRepository') as any
  const redisService = Container.get(RedisService)
  const authService = new AuthService(userRepository, redisService)
  const prefix = '/api/categories'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // GET /api/categories - Listar categorias (sistema + usuário)
  fastify.get(`${prefix}`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const type = query.type // 'INCOME', 'EXPENSE', ou undefined para todas

      // Buscar categorias do sistema (padrão) e do usuário
      const systemCategories = await categoryRepository.findSystemCategories(type)
      const userCategories = await categoryRepository.findByUserId(user.id, type)

      const categories = [
        ...(systemCategories || []),
        ...(userCategories || [])
      ]

      return {
        success: true,
        data: {
          categories,
          summary: {
            total: categories.length,
            system: systemCategories?.length || 0,
            user: userCategories?.length || 0,
            byType: {
              income: categories.filter((c: any) => c.type === 'INCOME').length,
              expense: categories.filter((c: any) => c.type === 'EXPENSE').length
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

  // GET /api/categories/:id - Buscar categoria específica
  fastify.get(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const category = await categoryRepository.findById(id)

      if (!category) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      // Verificar se é categoria do sistema ou do usuário
      if (category.userId && category.userId !== user.id) {
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

  // POST /api/categories - Criar categoria personalizada
  fastify.post(`${prefix}`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const body = request.body as any

      // Validações básicas
      if (!body.name || !body.type) {
        return reply.status(400).send({
          success: false,
          message: 'Nome e tipo da categoria são obrigatórios',
          errors: ['name e type são campos obrigatórios']
        })
      }

      if (!['INCOME', 'EXPENSE'].includes(body.type)) {
        return reply.status(400).send({
          success: false,
          message: 'Tipo deve ser INCOME ou EXPENSE',
          errors: ['Tipo inválido']
        })
      }

      const categoryData = {
        ...body,
        userId: user.id,
        isSystem: false,
        color: body.color || '#3B82F6',
        icon: body.icon || '📂'
      }

      const category = await categoryRepository.create(categoryData)

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

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // PUT /api/categories/:id - Atualizar categoria personalizada
  fastify.put(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const body = request.body as any

      // Verificar se a categoria existe e pertence ao usuário
      const existingCategory = await categoryRepository.findById(id)
      if (!existingCategory) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      // Não permitir edição de categorias do sistema
      if (existingCategory.isSystem || !existingCategory.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Não é possível editar categorias do sistema'
        })
      }

      if (existingCategory.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      const category = await categoryRepository.update(id, body)

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

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // DELETE /api/categories/:id - Deletar categoria personalizada
  fastify.delete(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      // Verificar se a categoria existe e pertence ao usuário
      const existingCategory = await categoryRepository.findById(id)
      if (!existingCategory) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      // Não permitir deletar categorias do sistema
      if (existingCategory.isSystem || !existingCategory.userId) {
        return reply.status(403).send({
          success: false,
          message: 'Não é possível deletar categorias do sistema'
        })
      }

      if (existingCategory.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Categoria não encontrada'
        })
      }

      await categoryRepository.delete(id)

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

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/categories/system - Listar apenas categorias do sistema
  fastify.get(`${prefix}/system`, async (request, reply) => {
    try {
      const query = request.query as any
      const type = query.type

      const categories = await categoryRepository.findSystemCategories(type)

      return {
        success: true,
        data: categories || []
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

  // GET /api/categories/usage - Estatísticas de uso das categorias
  fastify.get(`${prefix}/usage`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const startDate = query.startDate || new Date(new Date().getFullYear(), 0, 1).toISOString()
      const endDate = query.endDate || new Date().toISOString()

      const usage = await categoryRepository.getCategoryUsage(user.id, startDate, endDate)

      return {
        success: true,
        data: {
          period: { startDate, endDate },
          usage: usage || []
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

  // Rota de teste
  fastify.get(`${prefix}/test`, async (request, reply) => {
    return {
      success: true,
      message: 'API de categorias funcionando!',
      timestamp: new Date().toISOString()
    }
  })
}
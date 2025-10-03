import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Container } from 'typedi'
import { AlertService } from '../../services/AlertService'
import { AuthService } from '../../services/AuthService'
import { TransactionService } from '../../services/TransactionService'
import { RedisService } from '../../infrastructure/cache/RedisService'

export default async function alertRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Manual DI setup like other routes
  const alertRepository = Container.get('IAlertRepository') as any
  const transactionRepository = Container.get('ITransactionRepository') as any
  const accountRepository = Container.get('IAccountRepository') as any
  const categoryRepository = Container.get('ICategoryRepository') as any
  const budgetRepository = Container.get('IBudgetRepository') as any
  const goalRepository = Container.get('IGoalRepository') as any
  const redisService = Container.get(RedisService)
  const userRepository = Container.get('IUserRepository') as any
  const userCategoryRepository = Container.get('IUserCategoryRepository') as any

  // Create services manually
  const authService = new AuthService(userRepository, userCategoryRepository, accountRepository, redisService)
  const transactionService = new TransactionService(
    transactionRepository,
    accountRepository,
    categoryRepository,
    userCategoryRepository,
    redisService
  )
  const alertService = new AlertService(
    alertRepository,
    transactionRepository,
    accountRepository,
    categoryRepository,
    budgetRepository,
    goalRepository,
    redisService,
    transactionService
  )
  const prefix = '/api/alerts'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // GET /api/alerts - Listar alertas
  fastify.get(`${prefix}`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const result = await alertService.getAlertsByUser(user.id, {
        type: query.type,
        severity: query.severity,
        status: query.status,
        limit: query.limit || 50,
        offset: query.offset || 0,
        includeExpired: query.includeExpired
      })

      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('Erro ao obter alertas:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // GET /api/alerts/:id - Obter alerta específico
  fastify.get(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const alert = await alertService.getAlertById(id, user.id)

      if (!alert) {
        return reply.status(404).send({ success: false, message: 'Alerta não encontrado' })
      }

      return {
        success: true,
        data: alert
      }
    } catch (error) {
      console.error('Erro ao obter alerta:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // GET /api/alerts/unread - Alertas não lidos
  fastify.get(`${prefix}/unread`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const alerts = await alertService.getUnreadAlerts(user.id)

      return {
        success: true,
        data: alerts
      }
    } catch (error) {
      console.error('Erro ao obter alertas não lidos:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // GET /api/alerts/unread/count - Contagem de alertas não lidos
  fastify.get(`${prefix}/unread/count`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const count = await alertService.getUnreadCount(user.id)

      return {
        success: true,
        data: { count }
      }
    } catch (error) {
      console.error('Erro ao obter contagem de alertas:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // PATCH /api/alerts/:id/read - Marcar como lido
  fastify.patch(`${prefix}/:id/read`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const alert = await alertService.markAsRead(id, user.id)

      return {
        success: true,
        data: alert
      }
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // PATCH /api/alerts/:id/dismiss - Marcar como dispensado
  fastify.patch(`${prefix}/:id/dismiss`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const alert = await alertService.markAsDismissed(id, user.id)

      return {
        success: true,
        data: alert
      }
    } catch (error) {
      console.error('Erro ao dispensar alerta:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // POST /api/alerts/smart-generate - Gerar alertas inteligentes
  fastify.post(`${prefix}/smart-generate`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const config = request.body as any
      const alerts = await alertService.generateSmartAlerts(user.id, config)

      return {
        success: true,
        data: alerts
      }
    } catch (error) {
      console.error('Erro ao gerar alertas inteligentes:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // Rota de teste
  fastify.get(`${prefix}/test`, async (request, reply) => {
    return {
      success: true,
      message: 'API de alertas funcionando!',
      timestamp: new Date().toISOString()
    }
  })
}
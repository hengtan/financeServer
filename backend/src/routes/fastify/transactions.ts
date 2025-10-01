import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Container } from 'typedi'
import { TransactionService } from '../../services/TransactionService'
import { AuthService } from '../../services/AuthService'
import { RedisService } from '../../infrastructure/cache/RedisService'

export default async function transactionRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Temporary fix for DI issues
  const transactionRepository = Container.get('ITransactionRepository') as any
  const accountRepository = Container.get('IAccountRepository') as any
  const categoryRepository = Container.get('ICategoryRepository') as any // 🔄 Legacy support
  const userCategoryRepository = Container.get('IUserCategoryRepository') as any // 🚀 New architecture
  const redisService = Container.get(RedisService)
  const transactionService = new TransactionService(transactionRepository, accountRepository, categoryRepository, userCategoryRepository, redisService)

  const userRepository = Container.get('IUserRepository') as any
  const authService = new AuthService(userRepository, userCategoryRepository, accountRepository, redisService)
  const prefix = '/api'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // GET /api/transactions - Listar transações com paginação
  fastify.get(`${prefix}/transactions`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const page = parseInt(query.page) || 1
      const limit = parseInt(query.limit) || 10

      const transactions = await transactionService.getTransactionsByUser(
        user.id,
        { page, limit }
      )

      return {
        success: true,
        data: transactions,
        pagination: {
          page: transactions.page,
          limit: transactions.limit,
          total: transactions.total,
          totalPages: Math.ceil(transactions.total / transactions.limit),
          hasNext: (transactions.page * transactions.limit) < transactions.total,
          hasPrev: transactions.page > 1
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

  // GET /api/transactions/:id - Buscar transação específica
  fastify.get(`${prefix}/transactions/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      const transaction = await transactionService.getTransactionById(id, user.id)

      return {
        success: true,
        data: transaction
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('não encontrada') || errorMessage.includes('not found')) {
        return reply.status(404).send({
          success: false,
          message: 'Transação não encontrada'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // POST /api/transactions - Criar nova transação
  fastify.post(`${prefix}/transactions`, async (request, reply) => {
    try {
      console.log('🔄 Backend: POST /api/transactions received')
      console.log('🔍 Backend: Headers keys:', Object.keys(request.headers))
      console.log('🔍 Backend: Raw body:', request.body)

      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        console.log('❌ Backend: User not authenticated')
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      console.log('✅ Backend: User authenticated:', user.id, user.email)

      const body = request.body as any
      console.log('📥 Backend: Parsed body:', body)

      const transactionData = {
        ...body,
        userId: user.id
      }

      console.log('📤 Backend: Transaction data prepared for service:', transactionData)

      const transaction = await transactionService.createTransaction(transactionData)

      return reply.status(201).send({
        success: true,
        data: transaction,
        message: 'Transação criada com sucesso'
      })
    } catch (error) {
      console.log('❌ Backend: Error in POST /api/transactions:', error)
      console.log('❌ Backend: Error stack:', error instanceof Error ? error.stack : 'No stack trace')

      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        console.log('❌ Backend: Authentication error')
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('required') || errorMessage.includes('obrigatório')) {
        console.log('❌ Backend: Validation error')
        return reply.status(400).send({
          success: false,
          message: 'Dados inválidos',
          errors: [errorMessage]
        })
      }

      console.log('❌ Backend: Internal server error')
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // PUT /api/transactions/:id - Atualizar transação
  fastify.put(`${prefix}/transactions/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const body = request.body as any

      const transaction = await transactionService.updateTransaction(id, body)

      return {
        success: true,
        data: transaction,
        message: 'Transação atualizada com sucesso'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('não encontrada') || errorMessage.includes('not found')) {
        return reply.status(404).send({
          success: false,
          message: 'Transação não encontrada'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // DELETE /api/transactions/:id - Deletar transação
  fastify.delete(`${prefix}/transactions/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      await transactionService.deleteTransaction(id)

      return {
        success: true,
        message: 'Transação deletada com sucesso'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      if (errorMessage.includes('não encontrada') || errorMessage.includes('not found')) {
        return reply.status(404).send({
          success: false,
          message: 'Transação não encontrada'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/transactions/summary - Resumo financeiro
  fastify.get(`${prefix}/transactions/summary`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any

      const summary = await transactionService.getMonthlyStats(user.id,
        new Date().getFullYear(),
        new Date().getMonth() + 1
      )

      return {
        success: true,
        data: summary
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

  // GET /api/transactions/monthly-trend - Tendência mensal
  fastify.get(`${prefix}/transactions/monthly-trend`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      const query = request.query as any

      // This would be implemented based on your requirements
      // For now, return a simple response
      return {
        success: true,
        data: [],
        message: 'Monthly trend endpoint - to be implemented'
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

  // GET /api/transactions/analytics/detailed - Detalhamento Avançado
  fastify.get(`${prefix}/transactions/analytics/detailed`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const year = parseInt(query.year) || new Date().getFullYear()
      const month = query.month ? parseInt(query.month) : undefined

      // Análise por categoria
      const categoryAnalysis = await transactionService.getCategoryAnalysis(user.id, year, month)

      // Análise de tendências mensais (últimos 12 meses)
      const trendAnalysis = await transactionService.getTrendAnalysis(user.id)

      // Comparação com período anterior
      const comparisonAnalysis = await transactionService.getComparisonAnalysis(user.id, year, month)

      return {
        success: true,
        data: {
          period: {
            year,
            month: month || 'Ano completo'
          },
          categoryAnalysis,
          trendAnalysis,
          comparisonAnalysis
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
      return reply.status(500).send({
        success: false,
        message: 'Erro ao buscar detalhamento avançado',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/transactions/analytics/insights - Insights Avançados
  fastify.get(`${prefix}/transactions/analytics/insights`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      // Análises preditivas e recomendações
      const insights = await transactionService.getAdvancedInsights(user.id)

      return {
        success: true,
        data: insights
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
      return reply.status(500).send({
        success: false,
        message: 'Erro ao buscar insights avançados',
        errors: [errorMessage]
      })
    }
  })

  // Rota de teste
  fastify.get(`${prefix}/transactions/test`, async (request, reply) => {
    return {
      success: true,
      message: 'API de transações funcionando!',
      realImplementation: true,
      timestamp: new Date().toISOString()
    }
  })
}
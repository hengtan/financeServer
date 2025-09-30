import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Container } from 'typedi'
import { AuthService } from '../../services/AuthService'
import { RedisService } from '../../infrastructure/cache/RedisService'

export default async function budgetRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Temporary fix for DI issues
  const budgetRepository = Container.get('IBudgetRepository') as any
  const categoryRepository = Container.get('ICategoryRepository') as any
  const transactionRepository = Container.get('ITransactionRepository') as any
  const userRepository = Container.get('IUserRepository') as any
  const redisService = Container.get(RedisService)
  const authService = new AuthService(userRepository, redisService)
  const prefix = '/api/budgets'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // GET /api/budgets - Listar orçamentos do usuário
  fastify.get(`${prefix}`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const period = query.period // 'MONTHLY', 'WEEKLY', 'YEARLY' ou undefined para todos
      const status = query.status // 'ACTIVE', 'EXCEEDED', 'COMPLETED' ou undefined para todos

      const budgets = await budgetRepository.findByUserId(user.id, { period, status })

      // Calcular progresso e status para cada orçamento
      const budgetsWithProgress = await Promise.all(
        (budgets || []).map(async (budget: any) => {
          const startDate = new Date(budget.startDate)
          const endDate = new Date(budget.endDate)

          // Buscar gastos do período
          const transactions = await transactionRepository.findByUserIdAndPeriod(
            user.id,
            startDate.toISOString(),
            endDate.toISOString(),
            { categoryId: budget.categoryId, type: 'EXPENSE' }
          )

          const spent = transactions?.reduce((sum: number, t: any) => sum + Math.abs(parseFloat(t.amount)), 0) || 0
          const remaining = Math.max(0, budget.amount - spent)
          const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

          // Determinar status
          let currentStatus = budget.status
          if (spent >= budget.amount) {
            currentStatus = 'EXCEEDED'
          } else if (new Date() > endDate) {
            currentStatus = 'COMPLETED'
          }

          return {
            ...budget,
            spent,
            remaining,
            progress: Math.min(100, progress),
            status: currentStatus,
            daysRemaining: Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
          }
        })
      )

      return {
        success: true,
        data: {
          budgets: budgetsWithProgress,
          summary: {
            total: budgetsWithProgress.length,
            active: budgetsWithProgress.filter((b: any) => b.status === 'ACTIVE').length,
            exceeded: budgetsWithProgress.filter((b: any) => b.status === 'EXCEEDED').length,
            totalBudget: budgetsWithProgress.reduce((sum: number, b: any) => sum + b.amount, 0),
            totalSpent: budgetsWithProgress.reduce((sum: number, b: any) => sum + b.spent, 0)
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

  // GET /api/budgets/:id - Buscar orçamento específico
  fastify.get(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const budget = await budgetRepository.findById(id)

      if (!budget || budget.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Orçamento não encontrado'
        })
      }

      // Calcular progresso e gastos
      const startDate = new Date(budget.startDate)
      const endDate = new Date(budget.endDate)

      const transactions = await transactionRepository.findByUserIdAndPeriod(
        user.id,
        startDate.toISOString(),
        endDate.toISOString(),
        { categoryId: budget.categoryId, type: 'EXPENSE' }
      )

      const spent = transactions?.reduce((sum: number, t: any) => sum + Math.abs(parseFloat(t.amount)), 0) || 0
      const remaining = Math.max(0, budget.amount - spent)
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

      const budgetWithDetails = {
        ...budget,
        spent,
        remaining,
        progress: Math.min(100, progress),
        daysRemaining: Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
        transactions: transactions || []
      }

      return {
        success: true,
        data: budgetWithDetails
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

  // POST /api/budgets - Criar novo orçamento
  fastify.post(`${prefix}`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const body = request.body as any

      // Validações básicas
      if (!body.name || !body.amount || !body.period || !body.startDate || !body.endDate) {
        return reply.status(400).send({
          success: false,
          message: 'Nome, valor, período, data início e data fim são obrigatórios',
          errors: ['Campos obrigatórios faltando']
        })
      }

      if (body.amount <= 0) {
        return reply.status(400).send({
          success: false,
          message: 'Valor do orçamento deve ser maior que zero',
          errors: ['amount inválido']
        })
      }

      if (!['MONTHLY', 'WEEKLY', 'YEARLY'].includes(body.period)) {
        return reply.status(400).send({
          success: false,
          message: 'Período deve ser MONTHLY, WEEKLY ou YEARLY',
          errors: ['period inválido']
        })
      }

      const startDate = new Date(body.startDate)
      const endDate = new Date(body.endDate)

      if (endDate <= startDate) {
        return reply.status(400).send({
          success: false,
          message: 'Data fim deve ser posterior à data início',
          errors: ['Datas inválidas']
        })
      }

      const budgetData = {
        ...body,
        userId: user.id,
        status: body.status || 'ACTIVE',
        color: body.color || '#3B82F6'
      }

      const budget = await budgetRepository.create(budgetData)

      return reply.status(201).send({
        success: true,
        data: budget,
        message: 'Orçamento criado com sucesso'
      })
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

  // PUT /api/budgets/:id - Atualizar orçamento
  fastify.put(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const body = request.body as any

      // Verificar se o orçamento existe e pertence ao usuário
      const existingBudget = await budgetRepository.findById(id)
      if (!existingBudget || existingBudget.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Orçamento não encontrado'
        })
      }

      const budget = await budgetRepository.update(id, body)

      return {
        success: true,
        data: budget,
        message: 'Orçamento atualizado com sucesso'
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

  // DELETE /api/budgets/:id - Deletar orçamento
  fastify.delete(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      // Verificar se o orçamento existe e pertence ao usuário
      const existingBudget = await budgetRepository.findById(id)
      if (!existingBudget || existingBudget.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Orçamento não encontrado'
        })
      }

      await budgetRepository.delete(id)

      return {
        success: true,
        message: 'Orçamento deletado com sucesso'
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

  // GET /api/budgets/:id/alerts - Obter alertas do orçamento
  fastify.get(`${prefix}/:id/alerts`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const budget = await budgetRepository.findById(id)

      if (!budget || budget.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Orçamento não encontrado'
        })
      }

      // Calcular gastos atuais
      const startDate = new Date(budget.startDate)
      const endDate = new Date(budget.endDate)

      const transactions = await transactionRepository.findByUserIdAndPeriod(
        user.id,
        startDate.toISOString(),
        endDate.toISOString(),
        { categoryId: budget.categoryId, type: 'EXPENSE' }
      )

      const spent = transactions?.reduce((sum: number, t: any) => sum + Math.abs(parseFloat(t.amount)), 0) || 0
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

      const alerts = []

      if (progress >= 100) {
        alerts.push({
          type: 'EXCEEDED',
          severity: 'high',
          message: 'Orçamento excedido!',
          details: `Você gastou ${spent.toFixed(2)} de um orçamento de ${budget.amount.toFixed(2)}`
        })
      } else if (progress >= 90) {
        alerts.push({
          type: 'WARNING',
          severity: 'medium',
          message: 'Atenção: 90% do orçamento atingido',
          details: `Restam apenas ${(budget.amount - spent).toFixed(2)} do seu orçamento`
        })
      } else if (progress >= 75) {
        alerts.push({
          type: 'INFO',
          severity: 'low',
          message: '75% do orçamento utilizado',
          details: `Você já gastou ${progress.toFixed(1)}% do orçamento`
        })
      }

      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      if (daysRemaining <= 3 && daysRemaining > 0) {
        alerts.push({
          type: 'TIME_WARNING',
          severity: 'medium',
          message: `Orçamento expira em ${daysRemaining} dia(s)`,
          details: 'Considere ajustar seus gastos para os próximos dias'
        })
      }

      return {
        success: true,
        data: {
          budgetId: budget.id,
          alerts,
          currentStatus: {
            spent,
            budget: budget.amount,
            progress,
            daysRemaining
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

  // GET /api/budgets/analytics - Análise de orçamentos
  fastify.get(`${prefix}/analytics`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const startDate = query.startDate || new Date(new Date().getFullYear(), 0, 1).toISOString()
      const endDate = query.endDate || new Date().toISOString()

      const budgets = await budgetRepository.findByUserIdAndPeriod(user.id, startDate, endDate)

      const analytics = await Promise.all(
        (budgets || []).map(async (budget: any) => {
          const transactions = await transactionRepository.findByUserIdAndPeriod(
            user.id,
            budget.startDate,
            budget.endDate,
            { categoryId: budget.categoryId, type: 'EXPENSE' }
          )

          const spent = transactions?.reduce((sum: number, t: any) => sum + Math.abs(parseFloat(t.amount)), 0) || 0

          return {
            budgetId: budget.id,
            name: budget.name,
            planned: budget.amount,
            spent,
            variance: spent - budget.amount,
            efficiency: budget.amount > 0 ? (budget.amount - spent) / budget.amount * 100 : 0
          }
        })
      )

      const summary = {
        totalBudgets: analytics.length,
        totalPlanned: analytics.reduce((sum: number, a: any) => sum + a.planned, 0),
        totalSpent: analytics.reduce((sum: number, a: any) => sum + a.spent, 0),
        averageEfficiency: analytics.length > 0 ? analytics.reduce((sum: number, a: any) => sum + a.efficiency, 0) / analytics.length : 0,
        budgetsExceeded: analytics.filter((a: any) => a.variance > 0).length
      }

      return {
        success: true,
        data: {
          period: { startDate, endDate },
          summary,
          budgets: analytics
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
      message: 'API de orçamentos funcionando!',
      timestamp: new Date().toISOString()
    }
  })
}
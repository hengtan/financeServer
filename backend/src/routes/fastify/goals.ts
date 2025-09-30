import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Container } from 'typedi'
import { AuthService } from '../../services/AuthService'
import { RedisService } from '../../infrastructure/cache/RedisService'

export default async function goalRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Temporary fix for DI issues
  const goalRepository = Container.get('IGoalRepository') as any
  const userRepository = Container.get('IUserRepository') as any
  const redisService = Container.get(RedisService)
  const authService = new AuthService(userRepository, redisService)
  const prefix = '/api/goals'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // GET /api/goals - Listar metas do usuário
  fastify.get(`${prefix}`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const status = query.status // 'ACTIVE', 'COMPLETED', 'PAUSED' ou undefined para todas

      const goals = await goalRepository.findByUserId(user.id, status)

      // Calcular progresso para cada meta
      const goalsWithProgress = goals?.map((goal: any) => ({
        ...goal,
        progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
        remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
        daysRemaining: goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
      })) || []

      return {
        success: true,
        data: {
          goals: goalsWithProgress,
          summary: {
            total: goalsWithProgress.length,
            active: goalsWithProgress.filter((g: any) => g.status === 'ACTIVE').length,
            completed: goalsWithProgress.filter((g: any) => g.status === 'COMPLETED').length,
            totalTarget: goalsWithProgress.reduce((sum: number, g: any) => sum + g.targetAmount, 0),
            totalCurrent: goalsWithProgress.reduce((sum: number, g: any) => sum + g.currentAmount, 0)
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

  // GET /api/goals/:id - Buscar meta específica
  fastify.get(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const goal = await goalRepository.findById(id)

      if (!goal || goal.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Meta não encontrada'
        })
      }

      // Adicionar cálculos de progresso
      const goalWithProgress = {
        ...goal,
        progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
        remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
        daysRemaining: goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
      }

      return {
        success: true,
        data: goalWithProgress
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

  // POST /api/goals - Criar nova meta
  fastify.post(`${prefix}`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const body = request.body as any

      // Validações básicas
      if (!body.title || !body.targetAmount) {
        return reply.status(400).send({
          success: false,
          message: 'Título e valor alvo são obrigatórios',
          errors: ['title e targetAmount são campos obrigatórios']
        })
      }

      if (body.targetAmount <= 0) {
        return reply.status(400).send({
          success: false,
          message: 'Valor alvo deve ser maior que zero',
          errors: ['targetAmount inválido']
        })
      }

      const goalData = {
        ...body,
        userId: user.id,
        currentAmount: body.currentAmount || 0,
        status: body.status || 'ACTIVE',
        category: body.category || 'Geral',
        color: body.color || '#3B82F6'
      }

      const goal = await goalRepository.create(goalData)

      return reply.status(201).send({
        success: true,
        data: goal,
        message: 'Meta criada com sucesso'
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

  // PUT /api/goals/:id - Atualizar meta
  fastify.put(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const body = request.body as any

      // Verificar se a meta existe e pertence ao usuário
      const existingGoal = await goalRepository.findById(id)
      if (!existingGoal || existingGoal.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Meta não encontrada'
        })
      }

      const goal = await goalRepository.update(id, body)

      return {
        success: true,
        data: goal,
        message: 'Meta atualizada com sucesso'
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

  // DELETE /api/goals/:id - Deletar meta
  fastify.delete(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      // Verificar se a meta existe e pertence ao usuário
      const existingGoal = await goalRepository.findById(id)
      if (!existingGoal || existingGoal.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Meta não encontrada'
        })
      }

      await goalRepository.delete(id)

      return {
        success: true,
        message: 'Meta deletada com sucesso'
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

  // POST /api/goals/:id/contribute - Adicionar valor à meta
  fastify.post(`${prefix}/:id/contribute`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const body = request.body as any

      if (!body.amount || body.amount <= 0) {
        return reply.status(400).send({
          success: false,
          message: 'Valor deve ser maior que zero',
          errors: ['amount inválido']
        })
      }

      // Verificar se a meta existe e pertence ao usuário
      const existingGoal = await goalRepository.findById(id)
      if (!existingGoal || existingGoal.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Meta não encontrada'
        })
      }

      const newCurrentAmount = existingGoal.currentAmount + body.amount
      const goal = await goalRepository.update(id, {
        currentAmount: newCurrentAmount,
        status: newCurrentAmount >= existingGoal.targetAmount ? 'COMPLETED' : existingGoal.status
      })

      return {
        success: true,
        data: goal,
        message: `Valor de ${body.amount} adicionado à meta com sucesso`
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

  // GET /api/goals/:id/progress - Obter progresso detalhado da meta
  fastify.get(`${prefix}/:id/progress`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const goal = await goalRepository.findById(id)

      if (!goal || goal.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Meta não encontrada'
        })
      }

      const now = new Date()
      const createdAt = new Date(goal.createdAt)
      const deadline = goal.deadline ? new Date(goal.deadline) : null

      const totalDays = deadline ? Math.ceil((deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) : null
      const daysPassed = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null

      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
      const timeProgress = totalDays ? (daysPassed / totalDays) * 100 : null

      const progressData = {
        goalId: goal.id,
        title: goal.title,
        financial: {
          current: goal.currentAmount,
          target: goal.targetAmount,
          remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
          percentage: Math.min(100, progress),
          isCompleted: goal.currentAmount >= goal.targetAmount
        },
        time: deadline ? {
          totalDays,
          daysPassed,
          daysRemaining: Math.max(0, daysRemaining!),
          timePercentage: Math.min(100, timeProgress!),
          isOverdue: daysRemaining! < 0
        } : null,
        recommendations: {
          dailyTarget: deadline && daysRemaining! > 0 ? (goal.targetAmount - goal.currentAmount) / daysRemaining! : null,
          onTrack: timeProgress ? progress >= timeProgress : null
        }
      }

      return {
        success: true,
        data: progressData
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
      message: 'API de metas funcionando!',
      timestamp: new Date().toISOString()
    }
  })
}
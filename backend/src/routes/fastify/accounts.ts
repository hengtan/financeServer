import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Container } from 'typedi'
import { AuthService } from '../../services/AuthService'
import { RedisService } from '../../infrastructure/cache/RedisService'

export default async function accountRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Temporary fix for DI issues
  const accountRepository = Container.get('IAccountRepository') as any
  const userRepository = Container.get('IUserRepository') as any
  const userCategoryRepository = Container.get('IUserCategoryRepository') as any
  const redisService = Container.get(RedisService)
  const authService = new AuthService(userRepository, userCategoryRepository, accountRepository, redisService)
  const prefix = '/api/accounts'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // GET /api/accounts - Listar contas do usuário
  fastify.get(`${prefix}`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      console.log('📋 Fetching accounts for user:', user.id)
      const result = await accountRepository.findByUserId(user.id)
      console.log('📋 Found accounts:', result?.accounts?.length || 0)

      return {
        success: true,
        data: result.accounts || []
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

  // GET /api/accounts/:id - Buscar conta específica
  fastify.get(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const account = await accountRepository.findById(id)

      if (!account || account.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Conta não encontrada'
        })
      }

      return {
        success: true,
        data: account
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

  // POST /api/accounts - Criar nova conta
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
          message: 'Nome e tipo da conta são obrigatórios',
          errors: ['name e type são campos obrigatórios']
        })
      }

      const accountData = {
        ...body,
        userId: user.id,
        balance: body.balance || '0.00',
        currency: body.currency || 'BRL',
        status: body.status || 'ACTIVE'
      }

      console.log('📝 Creating account with data:', JSON.stringify(accountData, null, 2))

      const account = await accountRepository.create(accountData)

      console.log('✅ Account created:', account)

      return reply.status(201).send({
        success: true,
        data: account,
        message: 'Conta criada com sucesso'
      })
    } catch (error: any) {
      console.error('❌ Error creating account:', error)
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

  // PUT /api/accounts/:id - Atualizar conta
  fastify.put(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const body = request.body as any

      // Verificar se a conta existe e pertence ao usuário
      const existingAccount = await accountRepository.findById(id)
      if (!existingAccount || existingAccount.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Conta não encontrada'
        })
      }

      const account = await accountRepository.update(id, body)

      return {
        success: true,
        data: account,
        message: 'Conta atualizada com sucesso'
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

  // DELETE /api/accounts/:id - Deletar conta
  fastify.delete(`${prefix}/:id`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      // Verificar se a conta existe e pertence ao usuário
      const existingAccount = await accountRepository.findById(id)
      if (!existingAccount || existingAccount.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Conta não encontrada'
        })
      }

      await accountRepository.delete(id)

      return {
        success: true,
        message: 'Conta deletada com sucesso'
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

  // GET /api/accounts/:id/balance - Obter saldo atual da conta
  fastify.get(`${prefix}/:id/balance`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }
      const account = await accountRepository.findById(id)

      if (!account || account.userId !== user.id) {
        return reply.status(404).send({
          success: false,
          message: 'Conta não encontrada'
        })
      }

      return {
        success: true,
        data: {
          accountId: account.id,
          accountName: account.name,
          balance: account.balance,
          currency: account.currency,
          lastUpdated: account.updatedAt
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

  // GET /api/accounts/summary - Resumo de todas as contas
  fastify.get(`${prefix}/summary`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const accounts = await accountRepository.findByUserId(user.id)

      const summary = {
        totalAccounts: accounts?.length || 0,
        totalBalance: accounts?.reduce((sum: number, acc: any) => sum + parseFloat(acc.balance || '0'), 0) || 0,
        activeAccounts: accounts?.filter((acc: any) => acc.status === 'ACTIVE').length || 0,
        accountsByType: accounts?.reduce((acc: any, account: any) => {
          acc[account.type] = (acc[account.type] || 0) + 1
          return acc
        }, {}) || {}
      }

      return {
        success: true,
        data: {
          summary,
          accounts: accounts || []
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
      message: 'API de contas funcionando!',
      timestamp: new Date().toISOString()
    }
  })
}
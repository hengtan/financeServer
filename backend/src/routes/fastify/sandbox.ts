import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { SandboxService } from '../../services/SandboxService'
import { Container } from 'typedi'
import { AuthService } from '../../services/AuthService'
import { RedisService } from '../../infrastructure/cache/RedisService'

export default async function sandboxRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  const sandboxService = new SandboxService()

  // Temporary fix for DI issues
  const userRepository = Container.get('IUserRepository') as any
  const userCategoryRepository = Container.get('IUserCategoryRepository') as any
  const accountRepository = Container.get('IAccountRepository') as any
  const redisService = Container.get(RedisService)
  const authService = new AuthService(userRepository, userCategoryRepository, accountRepository, redisService)

  const prefix = '/api/sandbox'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // POST /api/sandbox/reset - Limpa e recria dados do usuário sandbox
  fastify.post(`${prefix}/reset`, async (request, reply) => {
    try {
      console.log('🔄 Sandbox reset request received')

      const user = await getUserFromToken(request.headers.authorization)

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Usuário não autenticado'
        })
      }

      // Verificar se é usuário sandbox
      if (!sandboxService.isSandboxUser(user.email)) {
        return reply.status(403).send({
          success: false,
          message: 'Esta operação é permitida apenas para o usuário sandbox'
        })
      }

      // Reset completo
      await sandboxService.resetAndSeed()

      return reply.status(200).send({
        success: true,
        message: 'Dados do sandbox resetados com sucesso'
      })
    } catch (error) {
      console.error('❌ Sandbox reset error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      return reply.status(500).send({
        success: false,
        message: 'Erro ao resetar sandbox',
        errors: [errorMessage]
      })
    }
  })

  // POST /api/sandbox/seed - Popula dados do sandbox ao logar
  fastify.post(`${prefix}/seed`, async (request, reply) => {
    try {
      console.log('🌱 Sandbox seed request received')

      const user = await getUserFromToken(request.headers.authorization)

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Usuário não autenticado'
        })
      }

      // Verificar se é usuário sandbox
      if (!sandboxService.isSandboxUser(user.email)) {
        return reply.status(403).send({
          success: false,
          message: 'Esta operação é permitida apenas para o usuário sandbox'
        })
      }

      // Seed dos dados
      await sandboxService.seedSandboxUser()

      return reply.status(200).send({
        success: true,
        message: 'Dados do sandbox populados com sucesso'
      })
    } catch (error) {
      console.error('❌ Sandbox seed error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      return reply.status(500).send({
        success: false,
        message: 'Erro ao popular sandbox',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/sandbox/status - Verifica se o usuário é sandbox
  fastify.get(`${prefix}/status`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Usuário não autenticado'
        })
      }

      return reply.status(200).send({
        success: true,
        data: {
          isSandbox: sandboxService.isSandboxUser(user.email),
          email: user.email
        }
      })
    } catch (error) {
      console.error('❌ Sandbox status error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Erro ao verificar status do sandbox'
      })
    }
  })
}

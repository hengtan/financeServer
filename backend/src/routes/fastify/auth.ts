import { FastifyInstance, FastifyPluginOptions } from 'fastify'

// Usuário sandbox para desenvolvimento
const sandboxUser = {
  id: 1,
  email: 'sandbox@financeserver.dev',
  name: 'Usuário Sandbox',
  avatar: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T12:00:00Z'
}

// Token mock simples (em produção seria JWT real)
const mockToken = 'sandbox_token_12345'
const mockRefreshToken = 'sandbox_refresh_token_67890'

export default async function authRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  const prefix = '/api/auth'

  // POST /api/auth/login - Login do usuário
  fastify.post(`${prefix}/login`, async (request, reply) => {
    const body = request.body as { email: string; password: string }

    // Para sandbox, aceitar qualquer credencial que contenha "sandbox"
    if (body.email.includes('sandbox') || body.password === 'sandbox') {
      return {
        success: true,
        data: {
          user: sandboxUser,
          token: mockToken,
          refreshToken: mockRefreshToken,
          expiresIn: 3600 // 1 hora
        },
        message: 'Login realizado com sucesso'
      }
    }

    return reply.status(401).send({
      success: false,
      message: 'Credenciais inválidas',
      errors: ['Email ou senha incorretos']
    })
  })

  // POST /api/auth/register - Registro de usuário
  fastify.post(`${prefix}/register`, async (request, reply) => {
    const body = request.body as { email: string; password: string; name: string }

    // No sandbox, sempre permitir registro
    const newUser = {
      ...sandboxUser,
      email: body.email,
      name: body.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return reply.status(201).send({
      success: true,
      data: {
        user: newUser,
        token: mockToken,
        refreshToken: mockRefreshToken,
        expiresIn: 3600
      },
      message: 'Usuário criado com sucesso'
    })
  })

  // POST /api/auth/logout - Logout do usuário
  fastify.post(`${prefix}/logout`, async (request, reply) => {
    // No sandbox, sempre retornar sucesso
    return {
      success: true,
      message: 'Logout realizado com sucesso'
    }
  })

  // POST /api/auth/refresh - Renovar token
  fastify.post(`${prefix}/refresh`, async (request, reply) => {
    const body = request.body as { refreshToken: string }

    if (body.refreshToken === mockRefreshToken) {
      return {
        success: true,
        data: {
          user: sandboxUser,
          token: mockToken,
          refreshToken: mockRefreshToken,
          expiresIn: 3600
        }
      }
    }

    return reply.status(401).send({
      success: false,
      message: 'Refresh token inválido'
    })
  })

  // GET /api/auth/me - Informações do usuário atual
  fastify.get(`${prefix}/me`, async (request, reply) => {
    // No sandbox, sempre retornar o usuário sandbox
    const authHeader = request.headers.authorization

    if (authHeader && authHeader.includes(mockToken)) {
      return {
        success: true,
        data: sandboxUser
      }
    }

    return reply.status(401).send({
      success: false,
      message: 'Token não fornecido ou inválido'
    })
  })

  // PUT /api/auth/profile - Atualizar perfil
  fastify.put(`${prefix}/profile`, async (request, reply) => {
    const body = request.body as { name?: string; email?: string }

    const updatedUser = {
      ...sandboxUser,
      ...body,
      updatedAt: new Date().toISOString()
    }

    return {
      success: true,
      data: updatedUser,
      message: 'Perfil atualizado com sucesso'
    }
  })

  // Rota de teste para verificar autenticação
  fastify.get(`${prefix}/test`, async (request, reply) => {
    return {
      success: true,
      message: 'API de autenticação funcionando!',
      sandbox: true,
      user: sandboxUser,
      timestamp: new Date().toISOString()
    }
  })
}
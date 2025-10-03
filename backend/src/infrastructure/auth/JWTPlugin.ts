import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'

// Custom JWT Payload type
export interface FastifyJWTCustomPayload {
  userId: string
  email: string
  role: string
}

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }

  interface FastifyRequest {
    user?: FastifyJWTCustomPayload
  }
}

// JWT Plugin
async function jwtPlugin(fastify: FastifyInstance) {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this'

  // Create authenticate decorator
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header'
        })
      }

      const token = authHeader.substring(7)

      try {
        const decoded = jwt.verify(token, secret) as FastifyJWTCustomPayload
        request.user = decoded
      } catch (err) {
        return reply.code(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        })
      }
    } catch (err) {
      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to authenticate'
      })
    }
  })
}

// Export as Fastify plugin
export default fp(jwtPlugin, {
  name: 'jwt-plugin'
})

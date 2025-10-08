/**
 * Analytics Proxy for Fastify - Routes to Python FastAPI service
 *
 * Transparently forwards /api/analytics/* requests to Python backend
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import axios from 'axios'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

export default async function analyticsProxyRoutes(fastify: FastifyInstance) {
  /**
   * Proxy all /api/analytics/* requests to Python service
   */
  fastify.all('/api/analytics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const url = `${PYTHON_SERVICE_URL}/analytics`

      fastify.log.info(`🐍 Proxying to Python: ${request.method} ${url}`)

      const response = await axios({
        method: request.method,
        url: url,
        data: request.body,
        params: request.query,
        headers: {
          'Authorization': request.headers.authorization || '',
          'Content-Type': request.headers['content-type'] || 'application/json',
          'User-Agent': 'FinanceServer-Fastify/1.0'
        },
        timeout: 30000,
        validateStatus: () => true
      })

      reply.status(response.status).send(response.data)
    } catch (error: any) {
      fastify.log.error(`Analytics proxy error: ${error.message}`)

      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Analytics service is temporarily unavailable',
          code: 'ANALYTICS_SERVICE_DOWN'
        })
      }

      return reply.status(500).send({
        error: 'Proxy Error',
        message: error.message,
        code: 'ANALYTICS_PROXY_ERROR'
      })
    }
  })

  fastify.all('/api/analytics/*', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Remove /api prefix for Python service
      const path = request.url.replace('/api/analytics', '/analytics')
      const url = `${PYTHON_SERVICE_URL}${path}`

      fastify.log.info(`🐍 Proxying to Python: ${request.method} ${url}`)

      const response = await axios({
        method: request.method,
        url: url,
        data: request.body,
        params: request.query,
        headers: {
          // Forward auth headers
          'Authorization': request.headers.authorization || '',
          'Content-Type': request.headers['content-type'] || 'application/json',
          'User-Agent': 'FinanceServer-Fastify/1.0'
        },
        timeout: 30000,
        validateStatus: () => true // Accept all status codes
      })

      // Forward response from Python
      reply
        .status(response.status)
        .send(response.data)

    } catch (error: any) {
      fastify.log.error(`Analytics proxy error: ${error.message}`)

      // Python service down
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Analytics service is temporarily unavailable',
          code: 'ANALYTICS_SERVICE_DOWN'
        })
      }

      // Other errors
      return reply.status(500).send({
        error: 'Proxy Error',
        message: error.message,
        code: 'ANALYTICS_PROXY_ERROR'
      })
    }
  })
}

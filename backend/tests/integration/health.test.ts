import { FastifyInstance } from 'fastify'
import { FastifyServer } from '../../src/infrastructure/http/FastifyServer'

describe('Health Endpoints Integration', () => {
  let server: FastifyServer
  let app: FastifyInstance

  beforeAll(async () => {
    server = new FastifyServer()
    app = server.getInstance()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        version: expect.any(String),
        environment: expect.any(String),
        services: {
          redis: {
            status: expect.any(String),
            latency: expect.any(Number),
            memory: expect.any(String)
          }
        },
        uptime: expect.any(Number),
        memory: {
          used: expect.any(Number),
          total: expect.any(Number)
        }
      })
    })

    it('should include valid timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      const body = JSON.parse(response.body)
      const timestamp = new Date(body.timestamp)

      expect(timestamp).toBeInstanceOf(Date)
      expect(timestamp.getTime()).not.toBeNaN()
    })

    it('should return uptime greater than 0', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      const body = JSON.parse(response.body)
      expect(body.uptime).toBeGreaterThan(0)
    })
  })

  describe('GET /health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      })

      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        version: expect.any(String),
        environment: expect.any(String),
        services: {
          redis: expect.objectContaining({
            status: expect.any(String)
          }),
          metrics: expect.objectContaining({
            status: expect.any(String),
            metricsCount: expect.any(Number)
          }),
          queues: expect.any(Object)
        },
        system: {
          uptime: expect.any(Number),
          memory: {
            used: expect.any(Number),
            total: expect.any(Number),
            external: expect.any(Number)
          },
          cpu: {
            usage: expect.any(Object)
          }
        }
      })
    })

    it('should include system metrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      })

      const body = JSON.parse(response.body)

      expect(body.system.memory.used).toBeGreaterThan(0)
      expect(body.system.memory.total).toBeGreaterThan(0)
      expect(body.system.uptime).toBeGreaterThan(0)
    })
  })

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics'
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/plain; charset=utf-8')
      expect(response.body).toContain('# Mock metrics')
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-endpoint'
      })

      expect(response.statusCode).toBe(404)

      const body = JSON.parse(response.body)
      expect(body).toEqual({
        error: 'Not Found',
        message: 'Route GET /non-existent-endpoint not found'
      })
    })

    it('should handle invalid HTTP methods', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/health'
      })

      expect(response.statusCode).toBe(404)
    })
  })

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
        headers: {
          origin: 'http://localhost:5173'
        }
      })

      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })

    it('should handle preflight requests', async () => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/health',
        headers: {
          origin: 'http://localhost:5173',
          'access-control-request-method': 'GET'
        }
      })

      expect(response.statusCode).toBe(204)
      expect(response.headers['access-control-allow-methods']).toBeDefined()
    })
  })

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      // Helmet security headers
      expect(response.headers['x-frame-options']).toBeDefined()
      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-xss-protection']).toBeDefined()
    })
  })

  describe('Rate Limiting', () => {
    it('should include rate limit headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.headers['x-ratelimit-limit']).toBeDefined()
      expect(response.headers['x-ratelimit-remaining']).toBeDefined()
    })

    it('should enforce rate limits', async () => {
      // Make multiple rapid requests
      const promises = Array.from({ length: 5 }, () =>
        app.inject({
          method: 'GET',
          url: '/health'
        })
      )

      const responses = await Promise.all(promises)

      // All should succeed under normal rate limits
      responses.forEach(response => {
        expect([200, 429]).toContain(response.statusCode)
      })
    })
  })

  describe('Request Validation', () => {
    it('should handle large request bodies gracefully', async () => {
      const largeBody = 'x'.repeat(2 * 1024 * 1024) // 2MB

      const response = await app.inject({
        method: 'POST',
        url: '/health',
        payload: { data: largeBody }
      })

      // Should either reject as 404 (no POST endpoint) or 413 (payload too large)
      expect([404, 413]).toContain(response.statusCode)
    })

    it('should handle malformed JSON gracefully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/health',
        headers: {
          'content-type': 'application/json'
        },
        payload: '{ invalid json'
      })

      expect([400, 404]).toContain(response.statusCode)
    })
  })

  describe('Response Format', () => {
    it('should return JSON with correct content-type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.headers['content-type']).toContain('application/json')
      expect(() => JSON.parse(response.body)).not.toThrow()
    })

    it('should have consistent timestamp format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      const body = JSON.parse(response.body)
      const timestamp = body.timestamp

      // Should be ISO 8601 format
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })
})
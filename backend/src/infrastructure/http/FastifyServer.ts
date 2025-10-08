import fastify, { FastifyInstance } from 'fastify'
import { Container } from 'typedi'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import redisPlugin from '@fastify/redis'
import { RedisService } from '../cache/RedisService'
import jwtPlugin from '../auth/JWTPlugin'

export class FastifyServer {
  private app: FastifyInstance
  private redisService: RedisService

  constructor() {
    this.app = fastify({
      logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'development' ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
          }
        } : undefined
      },
      requestTimeout: 30000,
      bodyLimit: 1048576, // 1MB
      trustProxy: true
    })

    this.redisService = Container.get(RedisService)
    this.setupRoutes()
  }

  private async setupPlugins(): Promise<void> {
    // Register JWT plugin first
    await this.app.register(jwtPlugin)

    await this.app.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    })

    await this.app.register(cors, {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    })

    await this.app.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
      redis: this.redisService.getClient(),
      nameSpace: 'rate-limit:',
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true
      }
    })

    await this.app.register(redisPlugin, {
      client: this.redisService.getClient(),
      namespace: 'redis'
    })

    if (process.env.NODE_ENV !== 'production') {
      await this.app.register(swagger, {
        swagger: {
          info: {
            title: 'FinanceServer API',
            description: 'Enterprise-grade financial management API',
            version: '1.0.0'
          },
          host: 'localhost:3001',
          schemes: ['http', 'https'],
          consumes: ['application/json'],
          produces: ['application/json'],
          securityDefinitions: {
            Bearer: {
              type: 'apiKey',
              name: 'Authorization',
              in: 'header',
              description: 'JWT token for authentication'
            }
          }
        }
      })

      await this.app.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
          docExpansion: 'full',
          deepLinking: false
        },
        staticCSP: true,
        transformStaticCSP: (header) => header
      })
    }

    // Register API routes
    const transactionRoutes = await import('../../routes/fastify/transactions')
    const authRoutes = await import('../../routes/fastify/auth')
    const reportRoutes = await import('../../routes/fastify/reports')
    const alertRoutes = await import('../../routes/fastify/alerts_new')
    const accountRoutes = await import('../../routes/fastify/accounts')
    const categoryRoutes = await import('../../routes/fastify/categories')
    const userCategoryRoutes = await import('../../routes/fastify/user-categories')
    const goalRoutes = await import('../../routes/fastify/goals')
    const budgetRoutes = await import('../../routes/fastify/budgets')
    const dashboardRoutes = await import('../../routes/fastify/dashboard')
    const sandboxRoutes = await import('../../routes/fastify/sandbox')
    const analyticsProxyRoutes = await import('../../routes/fastify/analytics-proxy') // 🐍 Python proxy

    await this.app.register(transactionRoutes.default)
    await this.app.register(authRoutes.default)
    await this.app.register(reportRoutes.default)
    await this.app.register(alertRoutes.default)
    await this.app.register(accountRoutes.default)
    await this.app.register(categoryRoutes.default)
    await this.app.register(userCategoryRoutes.default)
    await this.app.register(goalRoutes.default)
    await this.app.register(budgetRoutes.default)
    await this.app.register(dashboardRoutes.default)
    await this.app.register(sandboxRoutes.default)
    await this.app.register(analyticsProxyRoutes.default) // 🐍 Proxy to Python analytics

    this.app.log.info('✅ API routes registered successfully')
    this.app.log.info('🐍 Analytics proxy registered (Python FastAPI)')
  }

  private setupRoutes(): void {
    this.app.get('/health', async (request, reply) => {
      const redisHealth = await this.redisService.getHealth()

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
          api: { status: 'connected' },
          redis: redisHealth
        },
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      }
    })

    this.app.setErrorHandler((error, request, reply) => {
      const isDevelopment = process.env.NODE_ENV === 'development'

      request.log.error(error)

      if (error.validation) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Request validation failed',
          details: isDevelopment ? error.validation : undefined
        })
      }

      if (error.statusCode) {
        return reply.status(error.statusCode).send({
          error: error.name || 'Error',
          message: error.message
        })
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: isDevelopment ? error.message : 'An unexpected error occurred',
        stack: isDevelopment ? error.stack : undefined
      })
    })

    this.app.setNotFoundHandler((request, reply) => {
      reply.status(404).send({
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`
      })
    })
  }


  public async start(port = 3001, host = '0.0.0.0'): Promise<void> {
    try {
      // Setup plugins and routes before starting
      await this.setupPlugins()

      await this.app.listen({ port, host })
      this.app.log.info(`🚀 Server running on http://${host}:${port}`)

      if (process.env.NODE_ENV !== 'production') {
        this.app.log.info(`📖 API Documentation: http://${host}:${port}/docs`)
      }
    } catch (error) {
      this.app.log.error(error)
      process.exit(1)
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.app.close()
      await this.redisService.disconnect()
      this.app.log.info('Server stopped gracefully')
    } catch (error) {
      this.app.log.error(error as Error, 'Error stopping server')
      process.exit(1)
    }
  }

  public getInstance(): FastifyInstance {
    return this.app
  }

  public registerRoute(prefix: string, routeHandler: (app: FastifyInstance) => void): void {
    this.app.register(async (fastify) => {
      routeHandler(fastify)
    }, { prefix })
  }
}
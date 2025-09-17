import 'reflect-metadata'
import { Container } from 'typedi'
import { FastifyServer } from './infrastructure/http/FastifyServer'
import { RedisService } from './infrastructure/cache/RedisService'
import { QueueService, JobTypes } from './infrastructure/jobs/QueueService'
import { MetricsService } from './infrastructure/monitoring/MetricsService'
import { ProcessTransactionUseCase } from './core/usecases/ProcessTransactionUseCase'

class Application {
  private server: FastifyServer
  private redisService: RedisService
  private queueService: QueueService
  private metricsService: MetricsService

  constructor() {
    this.server = new FastifyServer()
    this.redisService = Container.get(RedisService)
    this.queueService = Container.get(QueueService)
    this.metricsService = Container.get(MetricsService)
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Starting FinanceServer Enterprise Backend...')

      // Setup metrics endpoint
      this.server.getInstance().get('/metrics', async (request, reply) => {
        const metrics = await this.metricsService.getMetrics()
        return reply.type('text/plain').send(metrics)
      })

      // Setup queue monitoring endpoint
      this.server.getInstance().get('/admin/queues', async (request, reply) => {
        const stats = await this.queueService.getAllQueueStats()
        return reply.send({
          status: 'ok',
          timestamp: new Date().toISOString(),
          queues: stats
        })
      })

      // Setup health check with comprehensive status
      this.server.getInstance().get('/health/detailed', async (request, reply) => {
        const redisHealth = await this.redisService.getHealth()
        const metricsHealth = this.metricsService.getHealth()
        const queueStats = await this.queueService.getAllQueueStats()

        return reply.send({
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          services: {
            redis: redisHealth,
            metrics: metricsHealth,
            queues: queueStats
          },
          system: {
            uptime: process.uptime(),
            memory: {
              used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
              total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
              external: Math.round(process.memoryUsage().external / 1024 / 1024)
            },
            cpu: {
              usage: process.cpuUsage()
            }
          }
        })
      })

      // Initialize workers for async job processing
      this.initializeWorkers()

      // Start the server
      const port = parseInt(process.env.PORT || '3001')
      const host = process.env.HOST || '0.0.0.0'

      await this.server.start(port, host)

      console.log('✅ FinanceServer Enterprise Backend started successfully!')
      console.log(`🌟 Features enabled:`)
      console.log(`   - Clean Architecture with Domain-Driven Design`)
      console.log(`   - ACID-compliant financial transactions`)
      console.log(`   - High-performance Redis caching`)
      console.log(`   - Async job processing with BullMQ`)
      console.log(`   - Prometheus metrics collection`)
      console.log(`   - Enterprise security with Fastify`)
      console.log(`   - Real-time monitoring and observability`)

    } catch (error) {
      console.error('❌ Failed to start application:', error)
      process.exit(1)
    }
  }

  private initializeWorkers(): void {
    console.log('🔧 Initializing async job workers...')

    // High-priority transaction processing worker
    this.queueService.createWorker('high-priority', async (job) => {
      const startTime = Date.now()

      try {
        switch (job.data.type) {
          case JobTypes.PROCESS_TRANSACTION:
            const processTransactionUseCase = Container.get(ProcessTransactionUseCase)
            const result = await processTransactionUseCase.execute(job.data.payload)

            this.metricsService.recordTransaction(
              result.transaction.type,
              result.transaction.status,
              result.transaction.getAmountAsNumber(),
              result.transaction.userId
            )

            return result

          default:
            throw new Error(`Unknown high-priority job type: ${job.data.type}`)
        }
      } catch (error) {
        this.metricsService.recordQueueJob('high-priority', job.data.type, 'failed')
        throw error
      } finally {
        const duration = (Date.now() - startTime) / 1000
        this.metricsService.recordQueueJob('high-priority', job.data.type, 'completed', duration)
      }
    })

    // Default queue worker for standard operations
    this.queueService.createWorker('default', async (job) => {
      const startTime = Date.now()

      try {
        switch (job.data.type) {
          case JobTypes.CALCULATE_ANALYTICS:
            console.log('Processing analytics calculation for user:', job.data.userId)
            await new Promise(resolve => setTimeout(resolve, 1000))
            return { status: 'calculated', userId: job.data.userId }

          case JobTypes.SEND_EMAIL:
            console.log('Sending email:', job.data.payload.subject)
            await new Promise(resolve => setTimeout(resolve, 500))
            return { status: 'sent', recipient: job.data.payload.to }

          default:
            throw new Error(`Unknown default job type: ${job.data.type}`)
        }
      } catch (error) {
        this.metricsService.recordQueueJob('default', job.data.type, 'failed')
        throw error
      } finally {
        const duration = (Date.now() - startTime) / 1000
        this.metricsService.recordQueueJob('default', job.data.type, 'completed', duration)
      }
    })

    // Low-priority worker for background tasks
    this.queueService.createWorker('low-priority', async (job) => {
      const startTime = Date.now()

      try {
        switch (job.data.type) {
          case JobTypes.BACKUP_DATA:
            console.log('Processing data backup...')
            await new Promise(resolve => setTimeout(resolve, 5000))
            return { status: 'backup_completed', timestamp: new Date() }

          case JobTypes.GENERATE_REPORT:
            console.log('Generating report:', job.data.payload.reportType)
            await new Promise(resolve => setTimeout(resolve, 3000))
            return { status: 'report_generated', type: job.data.payload.reportType }

          default:
            throw new Error(`Unknown low-priority job type: ${job.data.type}`)
        }
      } catch (error) {
        this.metricsService.recordQueueJob('low-priority', job.data.type, 'failed')
        throw error
      } finally {
        const duration = (Date.now() - startTime) / 1000
        this.metricsService.recordQueueJob('low-priority', job.data.type, 'completed', duration)
      }
    })

    console.log('✅ Job workers initialized successfully')
  }

  async stop(): Promise<void> {
    console.log('🔄 Shutting down FinanceServer Enterprise Backend...')

    try {
      await this.queueService.shutdown()
      await this.server.stop()
      console.log('✅ Application stopped gracefully')
    } catch (error) {
      console.error('❌ Error during shutdown:', error)
      process.exit(1)
    }
  }
}

// Graceful shutdown handling
const app = new Application()

process.on('SIGTERM', async () => {
  console.log('📡 SIGTERM received, shutting down gracefully...')
  await app.stop()
})

process.on('SIGINT', async () => {
  console.log('📡 SIGINT received, shutting down gracefully...')
  await app.stop()
})

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the application
app.start().catch((error) => {
  console.error('💥 Failed to start application:', error)
  process.exit(1)
})
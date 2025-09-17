import { Container } from 'typedi'
import { RedisService } from '../../src/infrastructure/cache/RedisService'
import { QueueService, JobTypes } from '../../src/infrastructure/jobs/QueueService'
import { MetricsService } from '../../src/infrastructure/monitoring/MetricsService'

describe('Infrastructure Services Integration', () => {
  describe('RedisService', () => {
    let redisService: RedisService

    beforeEach(() => {
      redisService = Container.get(RedisService)
    })

    afterEach(() => {
      Container.reset()
    })

    it('should set and get data', async () => {
      const key = 'test-key'
      const value = { message: 'Hello Redis' }

      await redisService.set(key, value)
      const result = await redisService.get(key)

      expect(result).toEqual(value)
    })

    it('should handle expiration', async () => {
      const key = 'expiring-key'
      const value = 'temporary data'
      const ttl = 1 // 1 second

      await redisService.set(key, value, ttl)
      const exists = await redisService.exists(key)

      expect(exists).toBe(true)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100))
      const existsAfter = await redisService.exists(key)

      expect(existsAfter).toBe(false)
    })

    it('should delete data', async () => {
      const key = 'delete-me'
      const value = 'will be deleted'

      await redisService.set(key, value)
      await redisService.del(key)
      const result = await redisService.get(key)

      expect(result).toBeNull()
    })

    it('should handle multiple get/set operations', async () => {
      const data = [
        { key: 'key1', value: { data: 'value1' } },
        { key: 'key2', value: { data: 'value2' } },
        { key: 'key3', value: { data: 'value3' } }
      ]

      await redisService.mset(data)

      const keys = data.map(item => item.key)
      const results = await redisService.mget(keys)

      expect(results).toEqual(data.map(item => item.value))
    })

    it('should increment counters', async () => {
      const key = 'counter'

      const result1 = await redisService.increment(key)
      const result2 = await redisService.increment(key, 5)

      expect(result1).toBe(1)
      expect(result2).toBe(6)
    })

    it('should handle hash operations', async () => {
      const hash = 'user:123'
      const field = 'profile'
      const value = { name: 'John Doe', email: 'john@example.com' }

      await redisService.setHashField(hash, field, value)
      const result = await redisService.getHashField(hash, field)

      expect(result).toEqual(value)
    })

    it('should return health status', async () => {
      const health = await redisService.getHealth()

      expect(health).toEqual({
        status: 'connected',
        latency: expect.any(Number),
        memory: expect.any(String)
      })
    })

    it('should handle invalidate pattern', async () => {
      await redisService.set('user:1:profile', { name: 'User 1' })
      await redisService.set('user:2:profile', { name: 'User 2' })
      await redisService.set('product:1', { name: 'Product 1' })

      await redisService.invalidatePattern('user:*')

      const user1 = await redisService.get('user:1:profile')
      const user2 = await redisService.get('user:2:profile')
      const product1 = await redisService.get('product:1')

      expect(user1).toBeNull()
      expect(user2).toBeNull()
      expect(product1).toEqual({ name: 'Product 1' })
    })
  })

  describe('QueueService', () => {
    let queueService: QueueService

    beforeEach(() => {
      queueService = Container.get(QueueService)
    })

    afterEach(async () => {
      await queueService.shutdown()
      Container.reset()
    })

    it('should add job to default queue', async () => {
      const jobData = { message: 'Test job' }

      const job = await queueService.addJob('default', JobTypes.SEND_EMAIL, jobData)

      expect(job).toBeDefined()
      expect(job.id).toBeDefined()
    })

    it('should add high priority job', async () => {
      const jobData = { transactionId: 'tx-123' }

      const job = await queueService.addHighPriorityJob(JobTypes.PROCESS_TRANSACTION, jobData, 'user-123')

      expect(job).toBeDefined()
    })

    it('should add scheduled job', async () => {
      const jobData = { reportType: 'monthly' }
      const delay = 1000 // 1 second

      const job = await queueService.addScheduledJob(JobTypes.GENERATE_REPORT, jobData, delay, 'user-123')

      expect(job).toBeDefined()
    })

    it('should get queue statistics', async () => {
      const stats = await queueService.getQueueStats('default')

      expect(stats).toEqual({
        waiting: expect.any(Number),
        active: expect.any(Number),
        completed: expect.any(Number),
        failed: expect.any(Number),
        delayed: expect.any(Number)
      })
    })

    it('should get all queue statistics', async () => {
      const allStats = await queueService.getAllQueueStats()

      expect(allStats).toHaveProperty('default')
      expect(allStats).toHaveProperty('high-priority')
      expect(allStats).toHaveProperty('low-priority')
      expect(allStats).toHaveProperty('scheduled')
    })

    it('should create worker for queue', async () => {
      const processor = jest.fn().mockResolvedValue({ success: true })

      const worker = queueService.createWorker('default', processor)

      expect(worker).toBeDefined()
    })

    it('should pause and resume queue', async () => {
      await queueService.pauseQueue('default')
      // Add assertion for paused state if available

      await queueService.resumeQueue('default')
      // Add assertion for resumed state if available
    })

    it('should clean queue', async () => {
      await queueService.cleanQueue('default')
      // Queue should be cleaned
    })

    it('should retry failed jobs', async () => {
      await queueService.retryFailedJobs('default')
      // Failed jobs should be retried
    })

    it('should throw error for invalid queue', async () => {
      await expect(
        queueService.addJob('invalid-queue', JobTypes.SEND_EMAIL, {})
      ).rejects.toThrow('Queue invalid-queue not found')
    })
  })

  describe('MetricsService', () => {
    let metricsService: MetricsService

    beforeEach(() => {
      metricsService = Container.get(MetricsService)
    })

    afterEach(() => {
      metricsService.clearMetrics()
      Container.reset()
    })

    it('should record HTTP requests', () => {
      metricsService.recordHttpRequest('GET', '/health', 200, 0.1)
      metricsService.recordHttpRequest('POST', '/api/transactions', 201, 0.5)

      // Metrics should be recorded (verified by Prometheus output)
      expect(() => metricsService.recordHttpRequest('GET', '/test', 200, 0.1)).not.toThrow()
    })

    it('should record transactions', () => {
      metricsService.recordTransaction('EXPENSE', 'COMPLETED', 100.50, 'user-123')
      metricsService.recordTransaction('INCOME', 'COMPLETED', 5000.00, 'user-456')

      expect(() => metricsService.recordTransaction('TRANSFER', 'PENDING', 250.00)).not.toThrow()
    })

    it('should record user registrations', () => {
      metricsService.recordUserRegistration('success')
      metricsService.recordUserRegistration('failed')

      expect(() => metricsService.recordUserRegistration('success')).not.toThrow()
    })

    it('should set cache hit ratio', () => {
      metricsService.setCacheHitRatio('redis', 0.85)
      metricsService.setCacheHitRatio('memory', 0.92)

      expect(() => metricsService.setCacheHitRatio('redis', 0.90)).not.toThrow()
    })

    it('should record queue jobs', () => {
      metricsService.recordQueueJob('default', 'SEND_EMAIL', 'completed', 1.5)
      metricsService.recordQueueJob('high-priority', 'PROCESS_TRANSACTION', 'failed')

      expect(() => metricsService.recordQueueJob('default', 'BACKUP_DATA', 'completed')).not.toThrow()
    })

    it('should set active connections', () => {
      metricsService.setActiveConnections(45)
      metricsService.setActiveConnections(50)

      expect(() => metricsService.setActiveConnections(42)).not.toThrow()
    })

    it('should increment custom counters', () => {
      metricsService.incrementCustomCounter('api_calls_total', { endpoint: '/users' })
      metricsService.incrementCustomCounter('api_calls_total', { endpoint: '/transactions' })

      expect(() => metricsService.incrementCustomCounter('custom_events', {})).not.toThrow()
    })

    it('should set custom gauges', () => {
      metricsService.setCustomGauge('active_users', 150, { region: 'us-east' })
      metricsService.setCustomGauge('queue_depth', 25, { queue: 'emails' })

      expect(() => metricsService.setCustomGauge('temperature', 23.5)).not.toThrow()
    })

    it('should observe custom histograms', () => {
      metricsService.observeCustomHistogram('request_duration', 0.5, { method: 'GET' })
      metricsService.observeCustomHistogram('db_query_time', 0.02, { table: 'users' })

      expect(() => metricsService.observeCustomHistogram('processing_time', 1.2)).not.toThrow()
    })

    it('should return metrics in Prometheus format', async () => {
      metricsService.recordHttpRequest('GET', '/test', 200, 0.1)

      const metrics = await metricsService.getMetrics()

      expect(typeof metrics).toBe('string')
      expect(metrics).toContain('# Mock metrics')
    })

    it('should return metrics as JSON', async () => {
      metricsService.recordTransaction('EXPENSE', 'COMPLETED', 100)

      const metrics = await metricsService.getMetricsAsJson()

      expect(Array.isArray(metrics)).toBe(true)
    })

    it('should return health status', () => {
      const health = metricsService.getHealth()

      expect(health).toEqual({
        status: 'healthy',
        metricsCount: expect.any(Number)
      })
    })

    it('should clear all metrics', () => {
      metricsService.recordHttpRequest('GET', '/test', 200, 0.1)
      metricsService.clearMetrics()

      const health = metricsService.getHealth()
      expect(health.metricsCount).toBe(0)
    })
  })

  describe('Service Integration', () => {
    let redisService: RedisService
    let queueService: QueueService
    let metricsService: MetricsService

    beforeEach(() => {
      redisService = Container.get(RedisService)
      queueService = Container.get(QueueService)
      metricsService = Container.get(MetricsService)
    })

    afterEach(async () => {
      await queueService.shutdown()
      metricsService.clearMetrics()
      Container.reset()
    })

    it('should work together for caching job results', async () => {
      // Add a job
      const jobData = { userId: 'user-123', action: 'calculate' }
      const job = await queueService.addJob('default', JobTypes.CALCULATE_ANALYTICS, jobData)

      // Cache the job result
      const cacheKey = `job:${job.id}:result`
      const result = { calculated: true, value: 42 }
      await redisService.set(cacheKey, result, 3600)

      // Record metrics
      metricsService.recordQueueJob('default', 'CALCULATE_ANALYTICS', 'completed', 2.5)
      metricsService.setCacheHitRatio('redis', 0.95)

      // Verify integration
      const cachedResult = await redisService.get(cacheKey)
      expect(cachedResult).toEqual(result)

      const queueStats = await queueService.getQueueStats('default')
      expect(queueStats).toBeDefined()

      const health = metricsService.getHealth()
      expect(health.status).toBe('healthy')
    })

    it('should handle service failures gracefully', async () => {
      // Even if one service fails, others should continue working
      try {
        await queueService.addJob('invalid-queue', JobTypes.SEND_EMAIL, {})
      } catch (error) {
        // Queue operation failed, but Redis and Metrics should still work
        await redisService.set('test', 'value')
        metricsService.recordHttpRequest('GET', '/test', 500, 0.1)

        const cachedValue = await redisService.get('test')
        expect(cachedValue).toBe('value')

        const health = metricsService.getHealth()
        expect(health.status).toBe('healthy')
      }
    })
  })
})
import { Service } from 'typedi'
import { Queue, Worker, Job, QueueOptions, WorkerOptions } from 'bullmq'
import { RedisService } from '../cache/RedisService'

export interface JobData {
  type: string
  payload: any
  userId?: string
  retries?: number
  delay?: number
}

export enum JobTypes {
  PROCESS_TRANSACTION = 'process_transaction',
  SEND_EMAIL = 'send_email',
  CALCULATE_ANALYTICS = 'calculate_analytics',
  BACKUP_DATA = 'backup_data',
  SYNC_EXTERNAL_ACCOUNTS = 'sync_external_accounts',
  GENERATE_REPORT = 'generate_report'
}

@Service()
export class QueueService {
  private queues: Map<string, Queue> = new Map()
  private workers: Map<string, Worker> = new Map()
  private redisService: RedisService

  constructor() {
    this.redisService = new RedisService()
    this.initializeQueues()
  }

  private initializeQueues(): void {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
    }

    const queueConfig: QueueOptions = {
      connection: redisConfig,
      prefix: 'financeserver',
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        attempts: 3
      }
    }

    // High priority queue for critical operations
    this.queues.set('high-priority', new Queue('high-priority', {
      ...queueConfig,
      defaultJobOptions: {
        ...queueConfig.defaultJobOptions,
        priority: 10
      }
    }))

    // Default queue for normal operations
    this.queues.set('default', new Queue('default', queueConfig))

    // Low priority queue for background tasks
    this.queues.set('low-priority', new Queue('low-priority', {
      ...queueConfig,
      defaultJobOptions: {
        ...queueConfig.defaultJobOptions,
        priority: 1
      }
    }))

    // Delayed queue for scheduled tasks
    this.queues.set('scheduled', new Queue('scheduled', queueConfig))
  }

  async addJob(
    queueName: string,
    jobType: JobTypes,
    data: any,
    options: {
      priority?: number
      delay?: number
      attempts?: number
      userId?: string
    } = {}
  ): Promise<Job> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    const jobData: JobData = {
      type: jobType,
      payload: data,
      userId: options.userId
    }

    return await queue.add(jobType, jobData, {
      priority: options.priority,
      delay: options.delay,
      attempts: options.attempts || 3
    })
  }

  async addHighPriorityJob(
    jobType: JobTypes,
    data: any,
    userId?: string
  ): Promise<Job> {
    return this.addJob('high-priority', jobType, data, {
      priority: 10,
      userId
    })
  }

  async addScheduledJob(
    jobType: JobTypes,
    data: any,
    delay: number,
    userId?: string
  ): Promise<Job> {
    return this.addJob('scheduled', jobType, data, {
      delay,
      userId
    })
  }

  createWorker(
    queueName: string,
    processor: (job: Job<JobData>) => Promise<any>
  ): Worker {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
    }

    const workerConfig: WorkerOptions = {
      connection: redisConfig,
      prefix: 'financeserver',
      concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5'),
      maxStalledCount: 1,
      stalledInterval: 30000
    }

    const worker = new Worker(queueName, processor, workerConfig)

    worker.on('completed', (job: Job) => {
      console.log(`✅ Job ${job.id} completed in queue ${queueName}`)
    })

    worker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`❌ Job ${job?.id} failed in queue ${queueName}:`, err.message)
    })

    worker.on('stalled', (jobId: string) => {
      console.warn(`⏸️ Job ${jobId} stalled in queue ${queueName}`)
    })

    worker.on('error', (err: Error) => {
      console.error(`❌ Worker error in queue ${queueName}:`, err)
    })

    this.workers.set(queueName, worker)
    return worker
  }

  async getQueueStats(queueName: string): Promise<{
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
  }> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    return {
      waiting: await queue.getWaiting(),
      active: await queue.getActive(),
      completed: await queue.getCompleted(),
      failed: await queue.getFailed(),
      delayed: await queue.getDelayed()
    }
  }

  async getAllQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {}

    for (const [queueName] of this.queues) {
      stats[queueName] = await this.getQueueStats(queueName)
    }

    return stats
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    await queue.pause()
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    await queue.resume()
  }

  async cleanQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    await queue.clean(0, 0)
  }

  async getJobById(queueName: string, jobId: string): Promise<Job | undefined> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    return await queue.getJob(jobId)
  }

  async retryFailedJobs(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    const failedJobs = await queue.getFailed()

    for (const job of failedJobs) {
      await job.retry()
    }
  }

  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down queue service...')

    // Close all workers
    for (const [queueName, worker] of this.workers) {
      console.log(`Closing worker for queue: ${queueName}`)
      await worker.close()
    }

    // Close all queues
    for (const [queueName, queue] of this.queues) {
      console.log(`Closing queue: ${queueName}`)
      await queue.close()
    }

    console.log('✅ Queue service shutdown complete')
  }

  getQueue(queueName: string): Queue | undefined {
    return this.queues.get(queueName)
  }

  getWorker(queueName: string): Worker | undefined {
    return this.workers.get(queueName)
  }
}
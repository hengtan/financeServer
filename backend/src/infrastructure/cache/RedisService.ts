import { Service } from 'typedi'
import Redis from 'ioredis'

@Service()
export class RedisService {
  private readonly client: Redis
  private readonly defaultTTL = 3600 // 1 hour

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keyPrefix: 'financeserver:',
      connectTimeout: 10000,
      commandTimeout: 5000
    })

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    this.client.on('error', (error) => {
      console.error('❌ Redis connection error:', error)
    })

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...')
    })
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value)
    if (ttl) {
      await this.client.setex(key, ttl, serializedValue)
    } else {
      await this.client.setex(key, this.defaultTTL, serializedValue)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key)
    if (!value) return null

    try {
      return JSON.parse(value) as T
    } catch (error) {
      console.error('Error parsing cached value:', error)
      return null
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key)
    return result === 1
  }

  async mget(keys: string[]): Promise<(any | null)[]> {
    const values = await this.client.mget(...keys)
    return values.map(value => {
      if (!value) return null
      try {
        return JSON.parse(value)
      } catch (error) {
        console.error('Error parsing cached value:', error)
        return null
      }
    })
  }

  async mset(keyValuePairs: Array<{key: string, value: any, ttl?: number}>): Promise<void> {
    const pipeline = this.client.pipeline()

    keyValuePairs.forEach(({ key, value, ttl }) => {
      const serializedValue = JSON.stringify(value)
      if (ttl) {
        pipeline.setex(key, ttl, serializedValue)
      } else {
        pipeline.setex(key, this.defaultTTL, serializedValue)
      }
    })

    await pipeline.exec()
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern)
    if (keys.length > 0) {
      await this.client.del(...keys)
    }
  }

  async increment(key: string, amount = 1): Promise<number> {
    return await this.client.incrby(key, amount)
  }

  async setWithNX(key: string, value: any, ttl?: number): Promise<boolean> {
    const serializedValue = JSON.stringify(value)
    const result = ttl
      ? await this.client.set(key, serializedValue, 'EX', ttl, 'NX')
      : await this.client.set(key, serializedValue, 'EX', this.defaultTTL, 'NX')

    return result === 'OK'
  }

  async getHashField(hash: string, field: string): Promise<any | null> {
    const value = await this.client.hget(hash, field)
    if (!value) return null

    try {
      return JSON.parse(value)
    } catch (error) {
      console.error('Error parsing cached hash value:', error)
      return null
    }
  }

  async setHashField(hash: string, field: string, value: any): Promise<void> {
    const serializedValue = JSON.stringify(value)
    await this.client.hset(hash, field, serializedValue)
    await this.client.expire(hash, this.defaultTTL)
  }

  async getHealth(): Promise<{
    status: 'connected' | 'disconnected'
    latency?: number
    memory?: string
  }> {
    try {
      const start = Date.now()
      await this.client.ping()
      const latency = Date.now() - start

      const info = await this.client.memory('usage', 'temp')

      return {
        status: 'connected',
        latency,
        memory: info ? `${Math.round(parseInt(info.toString()) / 1024 / 1024)}MB` : 'unknown'
      }
    } catch (error) {
      return {
        status: 'disconnected'
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit()
  }

  getClient(): Redis {
    return this.client
  }
}
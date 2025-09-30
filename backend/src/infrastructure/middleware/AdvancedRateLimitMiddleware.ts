import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { Container } from 'typedi'
import { RedisService } from '../cache/RedisService'

// Interface para configuração de rate limiting por endpoint
export interface RateLimitConfig {
  windowMs: number      // Janela de tempo em ms
  maxRequests: number   // Máximo de requests por janela
  skipSuccessfulRequests?: boolean  // Pular requests bem-sucedidos
  skipFailedRequests?: boolean      // Pular requests que falharam
  keyGenerator?: (request: FastifyRequest) => string  // Gerador de chave customizado
  onLimitReached?: (request: FastifyRequest, reply: FastifyReply) => void  // Callback quando limite é atingido
}

// Configurações padrão por tipo de endpoint
export const RateLimitPresets = {
  // Auth endpoints - mais restritivo
  AUTH: {
    LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 },        // 5 tentativas por 15 min
    REGISTER: { windowMs: 60 * 60 * 1000, maxRequests: 3 },     // 3 registros por hora
    FORGOT_PASSWORD: { windowMs: 60 * 60 * 1000, maxRequests: 3 } // 3 tentativas por hora
  },

  // CRUD operations - moderado
  CRUD: {
    CREATE: { windowMs: 60 * 1000, maxRequests: 10 },    // 10 criações por minuto
    UPDATE: { windowMs: 60 * 1000, maxRequests: 20 },    // 20 updates por minuto
    DELETE: { windowMs: 60 * 1000, maxRequests: 5 },     // 5 deleções por minuto
    READ: { windowMs: 60 * 1000, maxRequests: 100 }      // 100 leituras por minuto
  },

  // Financial operations - muito restritivo
  FINANCIAL: {
    TRANSACTION: { windowMs: 60 * 1000, maxRequests: 5 },     // 5 transações por minuto
    TRANSFER: { windowMs: 60 * 1000, maxRequests: 3 },        // 3 transferências por minuto
    PAYMENT: { windowMs: 60 * 1000, maxRequests: 2 }          // 2 pagamentos por minuto
  },

  // Reports and analytics - menos restritivo
  REPORTS: {
    GENERATE: { windowMs: 60 * 1000, maxRequests: 5 },        // 5 relatórios por minuto
    EXPORT: { windowMs: 60 * 1000, maxRequests: 3 }           // 3 exports por minuto
  },

  // API geral
  GENERAL: { windowMs: 60 * 1000, maxRequests: 60 }           // 60 requests por minuto
}

class AdvancedRateLimitMiddleware {
  private redisService: RedisService
  private readonly keyPrefix = 'rate_limit:'

  constructor() {
    this.redisService = Container.get(RedisService)
  }

  // Middleware principal para rate limiting
  createRateLimitMiddleware(config: RateLimitConfig) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const key = this.generateKey(request, config.keyGenerator)
        const isAllowed = await this.checkRateLimit(key, config)

        if (!isAllowed) {
          // Executar callback se fornecido
          if (config.onLimitReached) {
            config.onLimitReached(request, reply)
          }

          // Obter informações para headers
          const remainingTime = await this.getRemainingTime(key, config.windowMs)

          // Headers informativos
          reply.headers({
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + remainingTime).toString(),
            'Retry-After': Math.ceil(remainingTime).toString()
          })

          return reply.status(429).send({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: remainingTime
          })
        }

        // Adicionar headers informativos
        const remaining = await this.getRemainingRequests(key, config)
        reply.headers({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + config.windowMs / 1000).toString()
        })

        // Continuar com a requisição
      } catch (error) {
        request.log.error({ error }, 'Rate limit middleware error')
        // Em caso de erro, permitir a requisição continuar
      }
    }
  }

  // Verificar se a requisição está dentro do limite
  private async checkRateLimit(key: string, config: RateLimitConfig): Promise<boolean> {
    const redis = this.redisService.getClient()
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Usar sliding window log algorithm
    const pipeline = redis.multi()

    // Remover entradas antigas
    pipeline.zremrangebyscore(key, 0, windowStart)

    // Contar requisições na janela atual
    pipeline.zcard(key)

    // Adicionar a requisição atual
    pipeline.zadd(key, now, `${now}-${Math.random()}`)

    // Definir expiração
    pipeline.expire(key, Math.ceil(config.windowMs / 1000))

    const results = await pipeline.exec()
    const requestCount = results?.[1]?.[1] as number || 0

    return requestCount < config.maxRequests
  }

  // Obter número de requisições restantes
  private async getRemainingRequests(key: string, config: RateLimitConfig): Promise<number> {
    const redis = this.redisService.getClient()
    const now = Date.now()
    const windowStart = now - config.windowMs

    await redis.zremrangebyscore(key, 0, windowStart)
    const count = await redis.zcard(key)

    return Math.max(0, config.maxRequests - count)
  }

  // Obter tempo restante para reset
  private async getRemainingTime(key: string, windowMs: number): Promise<number> {
    const redis = this.redisService.getClient()
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES')

    if (oldest.length === 0) {
      return 0
    }

    const oldestTime = parseInt(oldest[1] as string)
    const resetTime = oldestTime + windowMs

    return Math.max(0, (resetTime - Date.now()) / 1000)
  }

  // Gerar chave para o rate limit
  private generateKey(request: FastifyRequest, keyGenerator?: (request: FastifyRequest) => string): string {
    if (keyGenerator) {
      return `${this.keyPrefix}${keyGenerator(request)}`
    }

    // Chave padrão: IP + rota + método
    const ip = this.getClientIP(request)
    const route = request.routerPath || request.url
    const method = request.method

    return `${this.keyPrefix}${ip}:${method}:${route}`
  }

  // Obter IP do cliente (considerando proxies)
  private getClientIP(request: FastifyRequest): string {
    const forwarded = request.headers['x-forwarded-for'] as string
    const realIP = request.headers['x-real-ip'] as string

    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }

    if (realIP) {
      return realIP
    }

    return request.ip || request.socket.remoteAddress || 'unknown'
  }

  // Middleware para endpoints de autenticação
  authRateLimit(type: keyof typeof RateLimitPresets.AUTH = 'LOGIN') {
    const config = RateLimitPresets.AUTH[type]

    return this.createRateLimitMiddleware({
      ...config,
      keyGenerator: (request) => {
        const ip = this.getClientIP(request)
        const email = (request.body as any)?.email || 'unknown'
        return `auth:${type.toLowerCase()}:${ip}:${email}`
      },
      onLimitReached: (request, reply) => {
        request.log.warn({
          ip: this.getClientIP(request),
          email: (request.body as any)?.email,
          type
        }, 'Auth rate limit exceeded')
      }
    })
  }

  // Middleware para operações financeiras
  financialRateLimit(type: keyof typeof RateLimitPresets.FINANCIAL = 'TRANSACTION') {
    const config = RateLimitPresets.FINANCIAL[type]

    return this.createRateLimitMiddleware({
      ...config,
      keyGenerator: (request) => {
        const userId = (request as any).user?.id || 'anonymous'
        return `financial:${type.toLowerCase()}:${userId}`
      },
      onLimitReached: (request, reply) => {
        request.log.warn({
          userId: (request as any).user?.id,
          type
        }, 'Financial operation rate limit exceeded')
      }
    })
  }

  // Middleware para operações CRUD
  crudRateLimit(type: keyof typeof RateLimitPresets.CRUD = 'READ') {
    const config = RateLimitPresets.CRUD[type]

    return this.createRateLimitMiddleware({
      ...config,
      keyGenerator: (request) => {
        const ip = this.getClientIP(request)
        const userId = (request as any).user?.id || 'anonymous'
        return `crud:${type.toLowerCase()}:${userId}:${ip}`
      }
    })
  }

  // Middleware para relatórios
  reportsRateLimit(type: keyof typeof RateLimitPresets.REPORTS = 'GENERATE') {
    const config = RateLimitPresets.REPORTS[type]

    return this.createRateLimitMiddleware({
      ...config,
      keyGenerator: (request) => {
        const userId = (request as any).user?.id || 'anonymous'
        return `reports:${type.toLowerCase()}:${userId}`
      },
      onLimitReached: (request, reply) => {
        request.log.warn({
          userId: (request as any).user?.id,
          type
        }, 'Reports rate limit exceeded')
      }
    })
  }

  // Middleware geral
  generalRateLimit() {
    return this.createRateLimitMiddleware({
      ...RateLimitPresets.GENERAL,
      keyGenerator: (request) => {
        const ip = this.getClientIP(request)
        return `general:${ip}`
      }
    })
  }

  // Registrar middleware no Fastify
  async register(fastify: FastifyInstance) {
    // Rate limit geral para todas as rotas
    fastify.addHook('preHandler', this.generalRateLimit())

    // Rate limits específicos podem ser aplicados em rotas individuais
    fastify.decorate('rateLimits', {
      auth: this.authRateLimit.bind(this),
      financial: this.financialRateLimit.bind(this),
      crud: this.crudRateLimit.bind(this),
      reports: this.reportsRateLimit.bind(this),
      custom: this.createRateLimitMiddleware.bind(this)
    })
  }

  // Limpar rate limit para um usuário específico (útil para admins)
  async clearRateLimit(identifier: string, type?: string): Promise<void> {
    const redis = this.redisService.getClient()
    const pattern = type
      ? `${this.keyPrefix}${type}:*${identifier}*`
      : `${this.keyPrefix}*${identifier}*`

    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  // Obter estatísticas de rate limiting
  async getRateLimitStats(identifier: string): Promise<{
    totalRequests: number
    remainingRequests: number
    resetTime: number
  }> {
    const redis = this.redisService.getClient()
    const keys = await redis.keys(`${this.keyPrefix}*${identifier}*`)

    let totalRequests = 0
    let oldestRequest = Date.now()

    for (const key of keys) {
      const count = await redis.zcard(key)
      totalRequests += count

      const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES')
      if (oldest.length > 0) {
        const time = parseInt(oldest[1] as string)
        oldestRequest = Math.min(oldestRequest, time)
      }
    }

    return {
      totalRequests,
      remainingRequests: Math.max(0, RateLimitPresets.GENERAL.maxRequests - totalRequests),
      resetTime: oldestRequest + RateLimitPresets.GENERAL.windowMs
    }
  }
}

// Instância singleton
export const advancedRateLimitMiddleware = new AdvancedRateLimitMiddleware()

// Tipos para TypeScript
declare module 'fastify' {
  interface FastifyInstance {
    rateLimits: {
      auth: (type?: keyof typeof RateLimitPresets.AUTH) => any
      financial: (type?: keyof typeof RateLimitPresets.FINANCIAL) => any
      crud: (type?: keyof typeof RateLimitPresets.CRUD) => any
      reports: (type?: keyof typeof RateLimitPresets.REPORTS) => any
      custom: (config: RateLimitConfig) => any
    }
  }
}

export { AdvancedRateLimitMiddleware }
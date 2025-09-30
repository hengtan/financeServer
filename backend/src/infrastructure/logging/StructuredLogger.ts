import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { Service } from 'typedi'

// Níveis de log customizados
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  trace: 5
}

// Cores para os níveis de log
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
  trace: 'gray'
}

// Interface para contexto de logging
export interface LogContext {
  userId?: string
  requestId?: string
  sessionId?: string
  operation?: string
  resource?: string
  action?: string
  duration?: number
  [key: string]: any
}

// Interface para logs de auditoria
export interface AuditLog extends LogContext {
  event: string
  actor: string
  target?: string
  outcome: 'success' | 'failure'
  details?: Record<string, any>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

// Interface para logs de performance
export interface PerformanceLog extends LogContext {
  operation: string
  duration: number
  memory?: {
    heapUsed: number
    heapTotal: number
    external: number
  }
  cpu?: number
  dbQueries?: number
  cacheHits?: number
  cacheMisses?: number
}

// Interface para logs de erro
export interface ErrorLog extends LogContext {
  error: Error
  stack?: string
  fingerprint?: string
  tags?: string[]
  extra?: Record<string, any>
}

@Service()
export class StructuredLogger {
  private logger: winston.Logger
  private auditLogger: winston.Logger
  private performanceLogger: winston.Logger
  private errorLogger: winston.Logger

  constructor() {
    winston.addColors(logColors)

    this.setupMainLogger()
    this.setupAuditLogger()
    this.setupPerformanceLogger()
    this.setupErrorLogger()
  }

  private setupMainLogger() {
    // Transporte para console (desenvolvimento)
    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          return `${timestamp} [${level}]: ${message} ${metaStr}`
        })
      )
    })

    // Transporte para arquivo (produção)
    const fileTransport = new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })

    // Transporte para erros
    const errorTransport = new DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      levels: logLevels,
      defaultMeta: {
        service: 'financeserver',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        consoleTransport,
        fileTransport,
        errorTransport
      ]
    })

    // Capturar exceções não tratadas
    this.logger.exceptions.handle(
      new DailyRotateFile({
        filename: 'logs/exceptions-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d'
      })
    )

    // Capturar rejections de promises não tratadas
    this.logger.rejections.handle(
      new DailyRotateFile({
        filename: 'logs/rejections-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d'
      })
    )
  }

  private setupAuditLogger() {
    this.auditLogger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: 'logs/audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '365d', // Manter por 1 ano
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    })
  }

  private setupPerformanceLogger() {
    this.performanceLogger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: 'logs/performance-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    })
  }

  private setupErrorLogger() {
    this.errorLogger = winston.createLogger({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: 'logs/errors-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '90d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        })
      ]
    })
  }

  // Métodos de logging básico
  trace(message: string, context?: LogContext) {
    this.logger.log('trace', message, context)
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, context)
  }

  info(message: string, context?: LogContext) {
    this.logger.info(message, context)
  }

  http(message: string, context?: LogContext) {
    this.logger.log('http', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, context)
  }

  error(message: string, error?: Error | ErrorLog, context?: LogContext) {
    if (error instanceof Error) {
      const errorLog: ErrorLog = {
        error,
        stack: error.stack,
        fingerprint: this.generateErrorFingerprint(error),
        ...context
      }
      this.logger.error(message, errorLog)
      this.errorLogger.error(message, errorLog)
    } else if (error && typeof error === 'object') {
      this.logger.error(message, { ...error, ...context })
      this.errorLogger.error(message, { ...error, ...context })
    } else {
      this.logger.error(message, context)
      this.errorLogger.error(message, context)
    }
  }

  // Logging de auditoria
  audit(auditLog: Omit<AuditLog, 'timestamp'>) {
    const completeAuditLog: AuditLog = {
      ...auditLog,
      timestamp: new Date()
    }

    this.auditLogger.info('AUDIT_LOG', completeAuditLog)
    this.info(`AUDIT: ${auditLog.event}`, completeAuditLog)
  }

  // Logging de performance
  performance(perfLog: PerformanceLog) {
    this.performanceLogger.info('PERFORMANCE_LOG', perfLog)

    // Log de warning se performance estiver ruim
    if (perfLog.duration > 1000) {
      this.warn(`Slow operation detected: ${perfLog.operation}`, perfLog)
    }
  }

  // Logging de transações financeiras
  financialTransaction(operation: string, details: {
    userId: string
    accountId?: string
    amount?: number
    fromAccount?: string
    toAccount?: string
    transactionId?: string
    status: 'success' | 'failure' | 'pending'
    reason?: string
  }, context?: LogContext) {
    const auditLog: Omit<AuditLog, 'timestamp'> = {
      event: `financial.${operation}`,
      actor: details.userId,
      target: details.accountId || details.transactionId,
      outcome: details.status === 'success' ? 'success' : 'failure',
      details,
      ...context
    }

    this.audit(auditLog)
  }

  // Logging de autenticação
  authentication(event: 'login' | 'logout' | 'register' | 'password_reset', details: {
    userId?: string
    email?: string
    status: 'success' | 'failure'
    reason?: string
    ipAddress?: string
    userAgent?: string
  }, context?: LogContext) {
    const auditLog: Omit<AuditLog, 'timestamp'> = {
      event: `auth.${event}`,
      actor: details.userId || details.email || 'unknown',
      outcome: details.status,
      details,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      ...context
    }

    this.audit(auditLog)
  }

  // Logging de segurança
  security(event: string, details: {
    severity: 'low' | 'medium' | 'high' | 'critical'
    userId?: string
    ipAddress?: string
    userAgent?: string
    details?: Record<string, any>
  }, context?: LogContext) {
    const logLevel = details.severity === 'critical' || details.severity === 'high' ? 'error' : 'warn'

    this.logger.log(logLevel, `SECURITY: ${event}`, {
      ...details,
      ...context,
      timestamp: new Date().toISOString()
    })

    // Também registrar como auditoria
    const auditLog: Omit<AuditLog, 'timestamp'> = {
      event: `security.${event}`,
      actor: details.userId || 'unknown',
      outcome: 'failure', // Eventos de segurança são tipicamente problemas
      details,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      ...context
    }

    this.audit(auditLog)
  }

  // Métricas de aplicação
  metric(name: string, value: number, unit: string, tags?: Record<string, string>, context?: LogContext) {
    this.info(`METRIC: ${name}`, {
      metric: {
        name,
        value,
        unit,
        tags,
        timestamp: new Date().toISOString()
      },
      ...context
    })
  }

  // Timer para medir performance
  timer() {
    const start = process.hrtime.bigint()
    const startMemory = process.memoryUsage()

    return {
      stop: (operation: string, context?: LogContext) => {
        const end = process.hrtime.bigint()
        const endMemory = process.memoryUsage()
        const duration = Number(end - start) / 1_000_000 // Converter para ms

        const perfLog: PerformanceLog = {
          operation,
          duration,
          memory: {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal,
            external: endMemory.external
          },
          ...context
        }

        this.performance(perfLog)
        return duration
      }
    }
  }

  // Gerar fingerprint para erros (para deduplicação)
  private generateErrorFingerprint(error: Error): string {
    const key = `${error.name}:${error.message}:${error.stack?.split('\n')[1]?.trim()}`

    // Simples hash para criar fingerprint
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Converter para 32-bit integer
    }

    return Math.abs(hash).toString(36)
  }

  // Middleware para Fastify
  getFastifyLogger() {
    return this.logger
  }

  // Cleanup recursos
  async close() {
    return new Promise<void>((resolve) => {
      this.logger.end(() => {
        this.auditLogger.end(() => {
          this.performanceLogger.end(() => {
            this.errorLogger.end(() => {
              resolve()
            })
          })
        })
      })
    })
  }

  // Obter estatísticas de logs
  async getLogStats(): Promise<{
    totalLogs: number
    errorLogs: number
    warningLogs: number
    lastError?: Date
  }> {
    // Esta implementação seria aprimorada com um backend de métricas
    // Por agora, retornamos dados mock
    return {
      totalLogs: 0,
      errorLogs: 0,
      warningLogs: 0,
      lastError: undefined
    }
  }
}

// Instância singleton
export const structuredLogger = new StructuredLogger()

// Interceptor para Prisma
export const prismaLogger = {
  query: (query: any) => {
    structuredLogger.debug('Prisma Query', {
      query: query.query,
      params: query.params,
      duration: query.duration,
      operation: 'database.query'
    })
  },

  info: (message: string) => {
    structuredLogger.info(message, { operation: 'database.info' })
  },

  warn: (message: string) => {
    structuredLogger.warn(message, { operation: 'database.warn' })
  },

  error: (message: string) => {
    structuredLogger.error(message, undefined, { operation: 'database.error' })
  }
}

export { winston }
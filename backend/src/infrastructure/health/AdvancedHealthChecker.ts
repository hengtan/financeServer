import { Service } from 'typedi'
import { RedisService } from '../cache/RedisService'
import { PrismaService } from '../database/PrismaService'
import { structuredLogger } from '../logging/StructuredLogger'

// Interface para resultado de health check
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: Date
  duration: number
  details?: Record<string, any>
  error?: string
}

// Interface para health check de um serviço
export interface ServiceHealthCheck {
  name: string
  critical: boolean
  timeout: number
  check: () => Promise<HealthCheckResult>
}

// Interface para resultado completo do health check
export interface SystemHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: Date
  version: string
  environment: string
  uptime: number
  services: Record<string, HealthCheckResult>
  summary: {
    total: number
    healthy: number
    unhealthy: number
    degraded: number
    critical_failures: number
  }
  system: {
    memory: {
      used: number
      total: number
      free: number
      usage_percent: number
    }
    cpu: {
      load_avg: number[]
      usage_percent?: number
    }
    disk?: {
      total: number
      used: number
      free: number
      usage_percent: number
    }
  }
}

@Service()
export class AdvancedHealthChecker {
  private healthChecks: ServiceHealthCheck[] = []
  private redisService: RedisService
  private prismaService: PrismaService
  private startTime: Date

  constructor() {
    this.redisService = new RedisService()
    this.prismaService = new PrismaService()
    this.startTime = new Date()
    this.setupDefaultHealthChecks()
  }

  private setupDefaultHealthChecks() {
    // Health check do banco de dados
    this.addHealthCheck({
      name: 'database',
      critical: true,
      timeout: 5000,
      check: async () => {
        const timer = structuredLogger.timer()
        try {
          await this.prismaService.getClient().$queryRaw`SELECT 1`
          const duration = timer.stop('health_check.database')

          return {
            status: 'healthy',
            timestamp: new Date(),
            duration,
            details: {
              connection_pool: 'active',
              query_test: 'passed'
            }
          }
        } catch (error) {
          const duration = timer.stop('health_check.database')
          structuredLogger.error('Database health check failed', error as Error)

          return {
            status: 'unhealthy',
            timestamp: new Date(),
            duration,
            error: (error as Error).message,
            details: {
              connection_pool: 'failed',
              query_test: 'failed'
            }
          }
        }
      }
    })

    // Health check do Redis
    this.addHealthCheck({
      name: 'redis',
      critical: true,
      timeout: 3000,
      check: async () => {
        const timer = structuredLogger.timer()
        try {
          const redis = this.redisService.getClient()
          const testKey = `health_check:${Date.now()}`

          await redis.set(testKey, 'test', 'EX', 10)
          const result = await redis.get(testKey)
          await redis.del(testKey)

          const duration = timer.stop('health_check.redis')

          if (result !== 'test') {
            throw new Error('Redis read/write test failed')
          }

          const redisInfo = await redis.info('memory')
          const memoryMatch = redisInfo.match(/used_memory:(\d+)/)
          const usedMemory = memoryMatch ? parseInt(memoryMatch[1]) : 0

          return {
            status: 'healthy',
            timestamp: new Date(),
            duration,
            details: {
              connection: 'active',
              read_write_test: 'passed',
              used_memory_bytes: usedMemory,
              used_memory_mb: Math.round(usedMemory / 1024 / 1024 * 100) / 100
            }
          }
        } catch (error) {
          const duration = timer.stop('health_check.redis')
          structuredLogger.error('Redis health check failed', error as Error)

          return {
            status: 'unhealthy',
            timestamp: new Date(),
            duration,
            error: (error as Error).message,
            details: {
              connection: 'failed',
              read_write_test: 'failed'
            }
          }
        }
      }
    })

    // Health check da memória
    this.addHealthCheck({
      name: 'memory',
      critical: false,
      timeout: 1000,
      check: async () => {
        const timer = structuredLogger.timer()
        try {
          const memUsage = process.memoryUsage()
          const duration = timer.stop('health_check.memory')

          const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
          const status = heapUsagePercent > 90 ? 'degraded' : heapUsagePercent > 95 ? 'unhealthy' : 'healthy'

          return {
            status,
            timestamp: new Date(),
            duration,
            details: {
              heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
              heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
              heap_usage_percent: Math.round(heapUsagePercent * 100) / 100,
              external_mb: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
              rss_mb: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100
            }
          }
        } catch (error) {
          const duration = timer.stop('health_check.memory')
          return {
            status: 'unhealthy',
            timestamp: new Date(),
            duration,
            error: (error as Error).message
          }
        }
      }
    })

    // Health check do sistema de arquivos
    this.addHealthCheck({
      name: 'filesystem',
      critical: false,
      timeout: 2000,
      check: async () => {
        const timer = structuredLogger.timer()
        try {
          const fs = await import('fs').then(m => m.promises)
          const path = await import('path')

          const testFile = path.join(process.cwd(), `health_check_${Date.now()}.tmp`)
          const testData = 'health check test'

          await fs.writeFile(testFile, testData)
          const readData = await fs.readFile(testFile, 'utf8')
          await fs.unlink(testFile)

          const duration = timer.stop('health_check.filesystem')

          if (readData !== testData) {
            throw new Error('Filesystem read/write test failed')
          }

          // Verificar espaço em disco se possível
          let diskSpace: any = null
          try {
            const { execSync } = await import('child_process')
            const output = execSync('df -h /', { encoding: 'utf8' })
            const lines = output.split('\n')
            if (lines.length > 1) {
              const parts = lines[1].split(/\s+/)
              diskSpace = {
                total: parts[1],
                used: parts[2],
                available: parts[3],
                usage_percent: parts[4]
              }
            }
          } catch {
            // Ignorar erro se não conseguir obter informações de disco
          }

          return {
            status: 'healthy',
            timestamp: new Date(),
            duration,
            details: {
              read_write_test: 'passed',
              working_directory: process.cwd(),
              disk_space: diskSpace
            }
          }
        } catch (error) {
          const duration = timer.stop('health_check.filesystem')
          structuredLogger.error('Filesystem health check failed', error as Error)

          return {
            status: 'unhealthy',
            timestamp: new Date(),
            duration,
            error: (error as Error).message,
            details: {
              read_write_test: 'failed'
            }
          }
        }
      }
    })

    // Health check de conectividade externa (opcional)
    this.addHealthCheck({
      name: 'external_connectivity',
      critical: false,
      timeout: 5000,
      check: async () => {
        const timer = structuredLogger.timer()
        try {
          // Teste simples de conectividade DNS
          const dns = await import('dns').then(m => m.promises)
          await dns.resolve('google.com')

          const duration = timer.stop('health_check.external_connectivity')

          return {
            status: 'healthy',
            timestamp: new Date(),
            duration,
            details: {
              dns_resolution: 'working',
              test_domain: 'google.com'
            }
          }
        } catch (error) {
          const duration = timer.stop('health_check.external_connectivity')

          return {
            status: 'degraded',
            timestamp: new Date(),
            duration,
            error: (error as Error).message,
            details: {
              dns_resolution: 'failed'
            }
          }
        }
      }
    })
  }

  // Adicionar health check customizado
  addHealthCheck(healthCheck: ServiceHealthCheck) {
    this.healthChecks.push(healthCheck)
  }

  // Remover health check
  removeHealthCheck(name: string) {
    this.healthChecks = this.healthChecks.filter(hc => hc.name !== name)
  }

  // Executar health check individual com timeout
  private async runHealthCheck(healthCheck: ServiceHealthCheck): Promise<HealthCheckResult> {
    return new Promise(async (resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          status: 'unhealthy',
          timestamp: new Date(),
          duration: healthCheck.timeout,
          error: `Health check timeout after ${healthCheck.timeout}ms`
        })
      }, healthCheck.timeout)

      try {
        const result = await healthCheck.check()
        clearTimeout(timeout)
        resolve(result)
      } catch (error) {
        clearTimeout(timeout)
        resolve({
          status: 'unhealthy',
          timestamp: new Date(),
          duration: healthCheck.timeout,
          error: (error as Error).message
        })
      }
    })
  }

  // Executar todos os health checks
  async checkHealth(): Promise<SystemHealthStatus> {
    const timer = structuredLogger.timer()
    const timestamp = new Date()

    // Executar todos os health checks em paralelo
    const healthPromises = this.healthChecks.map(async (hc) => {
      const result = await this.runHealthCheck(hc)
      return { name: hc.name, critical: hc.critical, result }
    })

    const healthResults = await Promise.all(healthPromises)

    // Compilar resultados
    const services: Record<string, HealthCheckResult> = {}
    let healthy = 0
    let unhealthy = 0
    let degraded = 0
    let criticalFailures = 0

    healthResults.forEach(({ name, critical, result }) => {
      services[name] = result

      switch (result.status) {
        case 'healthy':
          healthy++
          break
        case 'unhealthy':
          unhealthy++
          if (critical) criticalFailures++
          break
        case 'degraded':
          degraded++
          break
      }
    })

    // Determinar status geral do sistema
    let systemStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
    if (criticalFailures > 0) {
      systemStatus = 'unhealthy'
    } else if (unhealthy > 0 || degraded > 0) {
      systemStatus = 'degraded'
    }

    // Informações do sistema
    const memUsage = process.memoryUsage()
    const loadAvg = await import('os').then(m => m.loadavg())

    const systemInfo = {
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        free: memUsage.heapTotal - memUsage.heapUsed,
        usage_percent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100 * 100) / 100
      },
      cpu: {
        load_avg: loadAvg.map(load => Math.round(load * 100) / 100)
      }
    }

    const duration = timer.stop('health_check.system')

    const result: SystemHealthStatus = {
      status: systemStatus,
      timestamp,
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      services,
      summary: {
        total: this.healthChecks.length,
        healthy,
        unhealthy,
        degraded,
        critical_failures: criticalFailures
      },
      system: systemInfo
    }

    // Log do resultado
    if (systemStatus === 'unhealthy') {
      structuredLogger.error('System health check failed', undefined, {
        status: systemStatus,
        critical_failures: criticalFailures,
        total_duration: duration
      })
    } else if (systemStatus === 'degraded') {
      structuredLogger.warn('System health degraded', {
        status: systemStatus,
        degraded_services: degraded,
        unhealthy_services: unhealthy,
        total_duration: duration
      })
    } else {
      structuredLogger.debug('System health check passed', {
        status: systemStatus,
        healthy_services: healthy,
        total_duration: duration
      })
    }

    return result
  }

  // Health check rápido (apenas serviços críticos)
  async quickHealthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details?: string }> {
    try {
      const criticalChecks = this.healthChecks.filter(hc => hc.critical)
      const results = await Promise.all(
        criticalChecks.map(hc => this.runHealthCheck(hc))
      )

      const failures = results.filter(r => r.status === 'unhealthy')

      if (failures.length > 0) {
        return {
          status: 'unhealthy',
          details: `Critical services failing: ${failures.length}/${criticalChecks.length}`
        }
      }

      return { status: 'healthy' }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: (error as Error).message
      }
    }
  }

  // Obter métricas de performance
  async getPerformanceMetrics(): Promise<{
    memory: NodeJS.MemoryUsage
    uptime: number
    cpu_load: number[]
    gc_stats?: any
  }> {
    const memUsage = process.memoryUsage()
    const uptime = process.uptime()
    const loadAvg = await import('os').then(m => m.loadavg())

    return {
      memory: memUsage,
      uptime,
      cpu_load: loadAvg
    }
  }

  // Verificar se o sistema está pronto (readiness probe)
  async isReady(): Promise<boolean> {
    try {
      const result = await this.quickHealthCheck()
      return result.status === 'healthy'
    } catch {
      return false
    }
  }

  // Verificar se o sistema está vivo (liveness probe)
  async isAlive(): Promise<boolean> {
    try {
      // Teste muito básico - apenas verificar se o processo está respondendo
      return process.uptime() > 0
    } catch {
      return false
    }
  }
}

// Instância singleton
export const advancedHealthChecker = new AdvancedHealthChecker()

export type {
  HealthCheckResult,
  ServiceHealthCheck,
  SystemHealthStatus
}
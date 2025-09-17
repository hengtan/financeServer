import { Service } from 'typedi'
import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'

@Service()
export class MetricsService {
  private httpRequestsTotal: Counter<string>
  private httpRequestDuration: Histogram<string>
  private activeConnections: Gauge<string>
  private transactionCounter: Counter<string>
  private transactionAmount: Histogram<string>
  private userRegistrations: Counter<string>
  private cacheHitRatio: Gauge<string>
  private queueJobsProcessed: Counter<string>
  private queueJobDuration: Histogram<string>

  constructor() {
    // Collect default Node.js metrics
    collectDefaultMetrics({ register })

    // HTTP Metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register]
    })

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register]
    })

    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [register]
    })

    // Business Metrics
    this.transactionCounter = new Counter({
      name: 'transactions_total',
      help: 'Total number of financial transactions',
      labelNames: ['type', 'status', 'user_id'],
      registers: [register]
    })

    this.transactionAmount = new Histogram({
      name: 'transaction_amount_usd',
      help: 'Amount of financial transactions in USD',
      labelNames: ['type', 'status'],
      buckets: [1, 5, 10, 25, 50, 100, 500, 1000, 5000, 10000],
      registers: [register]
    })

    this.userRegistrations = new Counter({
      name: 'user_registrations_total',
      help: 'Total number of user registrations',
      labelNames: ['status'],
      registers: [register]
    })

    // Cache Metrics
    this.cacheHitRatio = new Gauge({
      name: 'cache_hit_ratio',
      help: 'Cache hit ratio (0-1)',
      labelNames: ['cache_type'],
      registers: [register]
    })

    // Queue Metrics
    this.queueJobsProcessed = new Counter({
      name: 'queue_jobs_processed_total',
      help: 'Total number of queue jobs processed',
      labelNames: ['queue_name', 'job_type', 'status'],
      registers: [register]
    })

    this.queueJobDuration = new Histogram({
      name: 'queue_job_duration_seconds',
      help: 'Duration of queue jobs in seconds',
      labelNames: ['queue_name', 'job_type'],
      buckets: [0.1, 0.5, 1, 3, 5, 10, 30, 60],
      registers: [register]
    })
  }

  // HTTP Metrics
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString()
    })

    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration
    )
  }

  setActiveConnections(count: number): void {
    this.activeConnections.set(count)
  }

  // Business Metrics
  recordTransaction(type: string, status: string, amount: number, userId?: string): void {
    this.transactionCounter.inc({
      type,
      status,
      user_id: userId || 'unknown'
    })

    this.transactionAmount.observe({ type, status }, amount)
  }

  recordUserRegistration(status: 'success' | 'failed'): void {
    this.userRegistrations.inc({ status })
  }

  // Cache Metrics
  setCacheHitRatio(cacheType: string, ratio: number): void {
    this.cacheHitRatio.set({ cache_type: cacheType }, ratio)
  }

  // Queue Metrics
  recordQueueJob(queueName: string, jobType: string, status: string, duration?: number): void {
    this.queueJobsProcessed.inc({
      queue_name: queueName,
      job_type: jobType,
      status
    })

    if (duration !== undefined) {
      this.queueJobDuration.observe(
        { queue_name: queueName, job_type: jobType },
        duration
      )
    }
  }

  // Custom business metrics
  incrementCustomCounter(name: string, labels: Record<string, string> = {}): void {
    let counter = register.getSingleMetric(name) as Counter<string>

    if (!counter) {
      counter = new Counter({
        name,
        help: `Custom counter: ${name}`,
        labelNames: Object.keys(labels),
        registers: [register]
      })
    }

    counter.inc(labels)
  }

  setCustomGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    let gauge = register.getSingleMetric(name) as Gauge<string>

    if (!gauge) {
      gauge = new Gauge({
        name,
        help: `Custom gauge: ${name}`,
        labelNames: Object.keys(labels),
        registers: [register]
      })
    }

    gauge.set(labels, value)
  }

  observeCustomHistogram(
    name: string,
    value: number,
    labels: Record<string, string> = {},
    buckets?: number[]
  ): void {
    let histogram = register.getSingleMetric(name) as Histogram<string>

    if (!histogram) {
      histogram = new Histogram({
        name,
        help: `Custom histogram: ${name}`,
        labelNames: Object.keys(labels),
        buckets: buckets || [0.1, 0.5, 1, 2, 5, 10],
        registers: [register]
      })
    }

    histogram.observe(labels, value)
  }

  // Get metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return await register.metrics()
  }

  // Get metrics as JSON for custom dashboards
  async getMetricsAsJson(): Promise<any> {
    const metrics = await register.getMetricsAsJSON()
    return metrics
  }

  // Clear all metrics (useful for testing)
  clearMetrics(): void {
    register.clear()
  }

  // Health check for metrics service
  getHealth(): { status: string; metricsCount: number } {
    const metrics = register.getMetricsAsArray()
    return {
      status: 'healthy',
      metricsCount: metrics.length
    }
  }
}
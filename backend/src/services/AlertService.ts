import { Service, Inject } from 'typedi'
import { IAlertRepository } from '../core/interfaces/repositories/IAlertRepository'
import { ITransactionRepository } from '../core/interfaces/repositories/ITransactionRepository'
import { IAccountRepository } from '../core/interfaces/repositories/IAccountRepository'
import { ICategoryRepository } from '../core/interfaces/repositories/ICategoryRepository'
import { IBudgetRepository } from '../core/interfaces/repositories/IBudgetRepository'
import { IGoalRepository } from '../core/interfaces/repositories/IGoalRepository'
import { Alert, AlertType, AlertSeverity, AlertStatus, AlertChannel, AlertData, AlertRule } from '../core/entities/Alert'
import { Transaction } from '../core/entities/Transaction'
import { RedisService } from '../infrastructure/cache/RedisService'
import { TransactionService } from './TransactionService'

export interface AlertCreationOptions {
  userId: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  description?: string
  data: AlertData
  rule?: AlertRule
  actionUrl?: string
  actionText?: string
  expiresInHours?: number
  channels?: AlertChannel[]
}

export interface SmartAlertConfig {
  budgetExceededThreshold: number // percentage
  highSpendingThreshold: number // amount
  lowBalanceThreshold: number // amount
  unusualTransactionMultiplier: number // times average
  enableBudgetAlerts: boolean
  enableSpendingAlerts: boolean
  enableBalanceAlerts: boolean
  enableAnomalyDetection: boolean
  cooldownHours: number
}

@Service()
export class AlertService {
  constructor(
    @Inject('IAlertRepository') private alertRepository: IAlertRepository,
    @Inject('ITransactionRepository') private transactionRepository: ITransactionRepository,
    @Inject('IAccountRepository') private accountRepository: IAccountRepository,
    @Inject('ICategoryRepository') private categoryRepository: ICategoryRepository,
    @Inject('IBudgetRepository') private budgetRepository: IBudgetRepository,
    @Inject('IGoalRepository') private goalRepository: IGoalRepository,
    private redisService: RedisService,
    private transactionService: TransactionService
  ) {}

  async createAlert(options: AlertCreationOptions): Promise<Alert> {
    // Check for duplicates in cooldown period
    if (options.rule?.cooldownHours) {
      const duplicates = await this.alertRepository.findDuplicates(
        options.userId,
        options.type,
        options.rule.cooldownHours
      )

      if (duplicates.length > 0) {
        // Return the most recent duplicate instead of creating a new one
        return duplicates[0]
      }
    }

    const alert = new Alert({
      userId: options.userId,
      type: options.type,
      severity: options.severity,
      title: options.title,
      message: options.message,
      description: options.description,
      data: options.data,
      rule: options.rule,
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      expiresAt: options.expiresInHours
        ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000)
        : undefined,
      channels: options.channels || [AlertChannel.IN_APP]
    })

    const createdAlert = await this.alertRepository.create(alert)

    // Clear cache
    await this.clearUserAlertCache(options.userId)

    return createdAlert
  }

  async getAlertById(id: string, userId?: string): Promise<Alert | null> {
    const cacheKey = `alert:${id}`

    // Try cache first
    const cached = await this.redisService.get<Alert>(cacheKey)
    if (cached && cached.id) {
      return cached
    }

    const alert = await this.alertRepository.findById(id)

    // Validate ownership if userId provided
    if (alert && userId && alert.userId !== userId) {
      return null
    }

    if (alert) {
      // Cache for 5 minutes
      await this.redisService.set(cacheKey, alert, 300)
    }

    return alert
  }

  async getAlertsByUser(
    userId: string,
    options?: {
      type?: AlertType
      severity?: AlertSeverity
      status?: AlertStatus
      limit?: number
      offset?: number
      includeExpired?: boolean
    }
  ): Promise<{ alerts: Alert[]; total: number }> {
    const cacheKey = `alerts:user:${userId}:${JSON.stringify(options || {})}`

    // Try cache first
    const cached = await this.redisService.get<{ alerts: Alert[]; total: number }>(cacheKey)
    if (cached && cached.alerts) {
      return cached
    }

    const filters = {
      ...options,
      isExpired: options?.includeExpired === true ? undefined : false
    }

    const result = await this.alertRepository.findByUserId(userId, filters)

    // Cache for 30 seconds
    await this.redisService.set(cacheKey, result, 30)

    return result
  }

  async getUnreadAlerts(userId: string): Promise<Alert[]> {
    const cacheKey = `alerts:unread:${userId}`

    // Try cache first
    const cached = await this.redisService.get<Alert[]>(cacheKey)
    if (cached && Array.isArray(cached)) {
      return cached
    }

    const alerts = await this.alertRepository.findUnread(userId)

    // Cache for 30 seconds
    await this.redisService.set(cacheKey, alerts, 30)

    return alerts
  }

  async getCriticalAlerts(userId: string): Promise<Alert[]> {
    return this.alertRepository.findCritical(userId)
  }

  async markAsRead(alertId: string, userId?: string): Promise<Alert> {
    const alert = await this.alertRepository.findById(alertId)

    if (!alert) {
      throw new Error('Alert not found')
    }

    if (userId && alert.userId !== userId) {
      throw new Error('Access denied')
    }

    const updatedAlert = await this.alertRepository.markAsRead(alertId)

    // Clear cache
    await this.clearUserAlertCache(alert.userId)

    return updatedAlert
  }

  async markAsDismissed(alertId: string, userId?: string): Promise<Alert> {
    const alert = await this.alertRepository.findById(alertId)

    if (!alert) {
      throw new Error('Alert not found')
    }

    if (userId && alert.userId !== userId) {
      throw new Error('Access denied')
    }

    const updatedAlert = await this.alertRepository.markAsDismissed(alertId)

    // Clear cache
    await this.clearUserAlertCache(alert.userId)

    return updatedAlert
  }

  async markAllAsRead(userId: string): Promise<number> {
    const count = await this.alertRepository.markAllAsRead(userId)

    // Clear cache
    await this.clearUserAlertCache(userId)

    return count
  }

  async markAllAsDismissed(userId: string): Promise<number> {
    const count = await this.alertRepository.markAllAsDismissed(userId)

    // Clear cache
    await this.clearUserAlertCache(userId)

    return count
  }

  async deleteAlert(alertId: string, userId?: string): Promise<void> {
    const alert = await this.alertRepository.findById(alertId)

    if (!alert) {
      throw new Error('Alert not found')
    }

    if (userId && alert.userId !== userId) {
      throw new Error('Access denied')
    }

    await this.alertRepository.delete(alertId)

    // Clear cache
    await this.clearUserAlertCache(alert.userId)
  }

  async getAlertStats(userId?: string) {
    const cacheKey = `alert-stats:${userId || 'global'}`

    // Try cache first
    const cached = await this.redisService.get(cacheKey)
    if (cached && typeof cached === 'object') {
      return cached
    }

    const stats = await this.alertRepository.getStats(userId)

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, stats, 300)

    return stats
  }

  async getUnreadCount(userId: string): Promise<number> {
    const cacheKey = `alert-count:unread:${userId}`

    // Try cache first
    const cached = await this.redisService.get<number>(cacheKey)
    if (typeof cached === 'number') {
      return cached
    }

    const count = await this.alertRepository.getUnreadCount(userId)

    // Cache for 30 seconds
    await this.redisService.set(cacheKey, count, 30)

    return count
  }

  async generateSmartAlerts(userId: string, config?: Partial<SmartAlertConfig>): Promise<Alert[]> {
    const defaultConfig: SmartAlertConfig = {
      budgetExceededThreshold: 80, // 80%
      highSpendingThreshold: 1000,
      lowBalanceThreshold: 100,
      unusualTransactionMultiplier: 3,
      enableBudgetAlerts: true,
      enableSpendingAlerts: true,
      enableBalanceAlerts: true,
      enableAnomalyDetection: true,
      cooldownHours: 24
    }

    const alertConfig = { ...defaultConfig, ...config }
    const alerts: Alert[] = []

    try {
      // Budget alerts
      if (alertConfig.enableBudgetAlerts) {
        const budgetAlerts = await this.generateBudgetAlerts(userId, alertConfig)
        alerts.push(...budgetAlerts)
      }

      // High spending alerts
      if (alertConfig.enableSpendingAlerts) {
        const spendingAlerts = await this.generateSpendingAlerts(userId, alertConfig)
        alerts.push(...spendingAlerts)
      }

      // Low balance alerts
      if (alertConfig.enableBalanceAlerts) {
        const balanceAlerts = await this.generateBalanceAlerts(userId, alertConfig)
        alerts.push(...balanceAlerts)
      }

      // Anomaly detection
      if (alertConfig.enableAnomalyDetection) {
        const anomalyAlerts = await this.generateAnomalyAlerts(userId, alertConfig)
        alerts.push(...anomalyAlerts)
      }

      // Goal milestone alerts
      const goalAlerts = await this.generateGoalAlerts(userId, alertConfig)
      alerts.push(...goalAlerts)

    } catch (error) {
      console.error('Error generating smart alerts:', error)
    }

    return alerts
  }

  async cleanupExpiredAlerts(): Promise<number> {
    // Mark expired alerts
    const expiredCount = await this.alertRepository.expireOldAlerts()

    // Delete old dismissed alerts (older than 30 days)
    const deletedCount = await this.alertRepository.deleteOldDismissed(30)

    return expiredCount + deletedCount
  }

  async searchAlerts(query: string, userId?: string): Promise<Alert[]> {
    return this.alertRepository.searchByMessage(query, userId)
  }

  private async generateBudgetAlerts(userId: string, config: SmartAlertConfig): Promise<Alert[]> {
    const alerts: Alert[] = []

    try {
      // This would require budget repository implementation
      // For now, return empty array
      return alerts
    } catch (error) {
      console.error('Error generating budget alerts:', error)
      return alerts
    }
  }

  private async generateSpendingAlerts(userId: string, config: SmartAlertConfig): Promise<Alert[]> {
    const alerts: Alert[] = []

    try {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      const monthlyStats = await this.transactionService.getMonthlyStats(userId, currentYear, currentMonth)

      if (monthlyStats && monthlyStats.totalExpenses > config.highSpendingThreshold) {
        const alert = await this.createAlert({
          userId,
          type: AlertType.HIGH_SPENDING,
          severity: AlertSeverity.MEDIUM,
          title: 'Alto gasto detectado',
          message: `Seus gastos este mês (R$ ${monthlyStats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) estão acima do normal.`,
          data: {
            amount: monthlyStats.totalExpenses,
            comparison: {
              current: monthlyStats.totalExpenses,
              previous: 0, // Would need last month data
              change: 0,
              changePercentage: 0
            }
          },
          expiresInHours: 48,
          rule: {
            name: 'High Spending Detection',
            conditions: [{
              field: 'monthlyExpenses',
              operator: 'gt',
              value: config.highSpendingThreshold
            }],
            enabled: true,
            channels: [AlertChannel.IN_APP],
            cooldownHours: config.cooldownHours
          }
        })

        alerts.push(alert)
      }

    } catch (error) {
      console.error('Error generating spending alerts:', error)
    }

    return alerts
  }

  private async generateBalanceAlerts(userId: string, config: SmartAlertConfig): Promise<Alert[]> {
    const alerts: Alert[] = []

    try {
      // Get user accounts and check balances
      const accounts = await this.accountRepository.findByUserId(userId)

      for (const account of accounts) {
        if (account.balance.toNumber() < config.lowBalanceThreshold) {
          const alert = await this.createAlert({
            userId,
            type: AlertType.LOW_BALANCE,
            severity: AlertSeverity.HIGH,
            title: 'Saldo baixo',
            message: `Sua conta ${account.name} está com saldo baixo: R$ ${account.balance.toFixed(2)}`,
            data: {
              amount: account.balance.toNumber(),
              account: account.name
            },
            expiresInHours: 24,
            rule: {
              name: 'Low Balance Detection',
              conditions: [{
                field: 'balance',
                operator: 'lt',
                value: config.lowBalanceThreshold
              }],
              enabled: true,
              channels: [AlertChannel.IN_APP],
              cooldownHours: config.cooldownHours
            }
          })

          alerts.push(alert)
        }
      }

    } catch (error) {
      console.error('Error generating balance alerts:', error)
    }

    return alerts
  }

  private async generateAnomalyAlerts(userId: string, config: SmartAlertConfig): Promise<Alert[]> {
    const alerts: Alert[] = []

    try {
      // Get recent transactions for anomaly detection
      const recentTransactions = await this.transactionService.getTransactionsByUser(userId, {
        limit: 100,
        sortBy: 'date',
        sortOrder: 'desc'
      })

      if (recentTransactions.data.length === 0) {
        return alerts
      }

      // Calculate average transaction amount
      const totalAmount = recentTransactions.data.reduce((sum, t) => sum + Math.abs(t.amount.toNumber()), 0)
      const averageAmount = totalAmount / recentTransactions.data.length

      // Check for unusual transactions
      const unusualTransactions = recentTransactions.data.filter(t =>
        Math.abs(t.amount.toNumber()) > averageAmount * config.unusualTransactionMultiplier
      )

      for (const transaction of unusualTransactions.slice(0, 3)) { // Limit to 3 alerts
        const alert = await this.createAlert({
          userId,
          type: AlertType.UNUSUAL_TRANSACTION,
          severity: AlertSeverity.MEDIUM,
          title: 'Transação incomum detectada',
          message: `Transação de R$ ${Math.abs(transaction.amount.toNumber()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} está acima da média (R$ ${averageAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
          data: {
            amount: transaction.amount.toNumber(),
            transaction: {
              id: transaction.id,
              description: transaction.description,
              date: transaction.date.toISOString(),
              category: transaction.categoryId
            },
            comparison: {
              current: Math.abs(transaction.amount.toNumber()),
              previous: averageAmount,
              change: Math.abs(transaction.amount.toNumber()) - averageAmount,
              changePercentage: ((Math.abs(transaction.amount.toNumber()) - averageAmount) / averageAmount) * 100
            }
          },
          expiresInHours: 72,
          rule: {
            name: 'Unusual Transaction Detection',
            conditions: [{
              field: 'transactionAmount',
              operator: 'gt',
              value: averageAmount * config.unusualTransactionMultiplier
            }],
            enabled: true,
            channels: [AlertChannel.IN_APP],
            cooldownHours: config.cooldownHours
          }
        })

        alerts.push(alert)
      }

    } catch (error) {
      console.error('Error generating anomaly alerts:', error)
    }

    return alerts
  }

  private async generateGoalAlerts(userId: string, config: SmartAlertConfig): Promise<Alert[]> {
    const alerts: Alert[] = []

    try {
      // This would require goal repository implementation
      // For now, return empty array
      return alerts
    } catch (error) {
      console.error('Error generating goal alerts:', error)
      return alerts
    }
  }

  private async clearUserAlertCache(userId: string): Promise<void> {
    const patterns = [
      `alerts:user:${userId}:*`,
      `alerts:unread:${userId}`,
      `alert-count:*:${userId}`,
      `alert-stats:${userId}`
    ]

    for (const pattern of patterns) {
      await this.redisService.invalidatePattern(pattern)
    }
  }
}
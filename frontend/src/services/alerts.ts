import { apiService, ApiResponse } from './api'

export interface AlertFilters {
  type?: AlertType
  severity?: AlertSeverity
  status?: AlertStatus
  dateFrom?: string
  dateTo?: string
  includeExpired?: boolean
  limit?: number
  offset?: number
}

export enum AlertType {
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  HIGH_SPENDING = 'HIGH_SPENDING',
  LOW_BALANCE = 'LOW_BALANCE',
  UNUSUAL_TRANSACTION = 'UNUSUAL_TRANSACTION',
  RECURRING_PAYMENT_DUE = 'RECURRING_PAYMENT_DUE',
  GOAL_MILESTONE = 'GOAL_MILESTONE',
  CASH_FLOW_WARNING = 'CASH_FLOW_WARNING',
  INCOME_RECEIVED = 'INCOME_RECEIVED',
  EXPENSE_ANOMALY = 'EXPENSE_ANOMALY',
  SAVINGS_OPPORTUNITY = 'SAVINGS_OPPORTUNITY',
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_DELETED = 'TRANSACTION_DELETED',
  CUSTOM = 'CUSTOM'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  READ = 'READ',
  DISMISSED = 'DISMISSED',
  EXPIRED = 'EXPIRED'
}

export enum AlertChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'
}

export interface AlertCondition {
  field: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains' | 'between'
  value: any
  secondValue?: any
}

export interface AlertRule {
  name: string
  description?: string
  conditions: AlertCondition[]
  threshold?: number
  period?: 'day' | 'week' | 'month' | 'year'
  enabled: boolean
  channels: AlertChannel[]
  cooldownHours?: number
}

export interface AlertData {
  amount?: number
  category?: string
  account?: string
  transaction?: Record<string, any>
  budget?: Record<string, any>
  goal?: Record<string, any>
  comparison?: {
    current: number
    previous: number
    change: number
    changePercentage: number
  }
  suggestions?: string[]
  metadata?: Record<string, any>
}

export interface Alert {
  id: string
  userId: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  title: string
  message: string
  description?: string
  data: AlertData
  rule?: AlertRule
  actionUrl?: string
  actionText?: string
  triggeredAt: string
  readAt?: string
  dismissedAt?: string
  expiresAt?: string
  channels: AlertChannel[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface AlertStats {
  total: number
  active: number
  read: number
  dismissed: number
  expired: number
  byType: Record<AlertType, number>
  bySeverity: Record<AlertSeverity, number>
  byStatus: Record<AlertStatus, number>
}

export interface SmartAlertConfig {
  budgetExceededThreshold: number
  highSpendingThreshold: number
  lowBalanceThreshold: number
  unusualTransactionMultiplier: number
  enableBudgetAlerts: boolean
  enableSpendingAlerts: boolean
  enableBalanceAlerts: boolean
  enableAnomalyDetection: boolean
  cooldownHours: number
}

export interface CreateAlertRequest {
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

class AlertsService {
  private readonly baseUrl = '/alerts'

  // Get user alerts with filters
  async getAlerts(filters?: AlertFilters): Promise<ApiResponse<{
    alerts: Alert[]
    total: number
  }>> {
    return apiService.get(`${this.baseUrl}`, {
      params: filters
    })
  }

  // Get alert by ID
  async getAlert(id: string): Promise<ApiResponse<Alert>> {
    return apiService.get(`${this.baseUrl}/${id}`)
  }

  // Get unread alerts
  async getUnreadAlerts(): Promise<ApiResponse<Alert[]>> {
    return apiService.get(`${this.baseUrl}/unread`)
  }

  // Get critical alerts
  async getCriticalAlerts(): Promise<ApiResponse<Alert[]>> {
    return apiService.get(`${this.baseUrl}/critical`)
  }

  // Get alert statistics
  async getAlertStats(): Promise<ApiResponse<AlertStats>> {
    return apiService.get(`${this.baseUrl}/stats`)
  }

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiService.get(`${this.baseUrl}/unread/count`)
  }

  // Create new alert
  async createAlert(alertData: CreateAlertRequest): Promise<ApiResponse<Alert>> {
    return apiService.post(`${this.baseUrl}`, alertData)
  }

  // Mark alert as read
  async markAsRead(id: string): Promise<ApiResponse<Alert>> {
    return apiService.patch(`${this.baseUrl}/${id}/read`)
  }

  // Mark alert as dismissed
  async markAsDismissed(id: string): Promise<ApiResponse<Alert>> {
    return apiService.patch(`${this.baseUrl}/${id}/dismiss`)
  }

  // Mark all alerts as read
  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    return apiService.patch(`${this.baseUrl}/read-all`)
  }

  // Mark all alerts as dismissed
  async markAllAsDismissed(): Promise<ApiResponse<{ count: number }>> {
    return apiService.patch(`${this.baseUrl}/dismiss-all`)
  }

  // Delete alert
  async deleteAlert(id: string): Promise<ApiResponse<void>> {
    return apiService.delete(`${this.baseUrl}/${id}`)
  }

  // Generate smart alerts
  async generateSmartAlerts(config?: Partial<SmartAlertConfig>): Promise<ApiResponse<Alert[]>> {
    return apiService.post(`${this.baseUrl}/smart-generate`, config || {})
  }

  // Search alerts
  async searchAlerts(query: string): Promise<ApiResponse<Alert[]>> {
    return apiService.get(`${this.baseUrl}/search`, {
      params: { q: query }
    })
  }

  // Bulk operations
  async bulkMarkAsRead(ids: string[]): Promise<ApiResponse<void>> {
    return apiService.patch(`${this.baseUrl}/bulk/read`, { ids })
  }

  async bulkMarkAsDismissed(ids: string[]): Promise<ApiResponse<void>> {
    return apiService.patch(`${this.baseUrl}/bulk/dismiss`, { ids })
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiService.delete(`${this.baseUrl}/bulk`, { data: { ids } })
  }

  // Real-time alerts (WebSocket or polling)
  async subscribeToAlerts(userId: string, callback: (alerts: Alert[]) => void): Promise<() => void> {
    // For now, implement polling. Later can be replaced with WebSocket
    let isSubscribed = true
    let lastCheck = new Date()

    const pollAlerts = async () => {
      if (!isSubscribed) return

      try {
        const response = await this.getAlerts({
          status: AlertStatus.ACTIVE,
          limit: 50
        })

        if (response.success) {
          // Filter alerts created since last check
          const newAlerts = response.data.alerts.filter(alert =>
            new Date(alert.createdAt) > lastCheck
          )

          if (newAlerts.length > 0) {
            callback(newAlerts)
          }

          lastCheck = new Date()
        }
      } catch (error) {
        console.error('Error polling alerts:', error)
      }

      // Poll every 30 seconds
      if (isSubscribed) {
        setTimeout(pollAlerts, 30000)
      }
    }

    // Start polling
    pollAlerts()

    // Return unsubscribe function
    return () => {
      isSubscribed = false
    }
  }
}

export const alertsService = new AlertsService()

// Utility functions for alerts
export class AlertUtils {
  static getAlertIcon(type: AlertType): string {
    switch (type) {
      case AlertType.BUDGET_EXCEEDED:
        return '🚨'
      case AlertType.HIGH_SPENDING:
        return '💸'
      case AlertType.LOW_BALANCE:
        return '⚠️'
      case AlertType.UNUSUAL_TRANSACTION:
        return '🔍'
      case AlertType.RECURRING_PAYMENT_DUE:
        return '📅'
      case AlertType.GOAL_MILESTONE:
        return '🎯'
      case AlertType.CASH_FLOW_WARNING:
        return '📊'
      case AlertType.INCOME_RECEIVED:
        return '💰'
      case AlertType.EXPENSE_ANOMALY:
        return '📈'
      case AlertType.SAVINGS_OPPORTUNITY:
        return '💡'
      case AlertType.TRANSACTION_CREATED:
        return '✅'
      case AlertType.TRANSACTION_DELETED:
        return '🗑️'
      default:
        return '🔔'
    }
  }

  static getAlertColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return '#EF4444' // red-500
      case AlertSeverity.HIGH:
        return '#F97316' // orange-500
      case AlertSeverity.MEDIUM:
        return '#F59E0B' // amber-500
      case AlertSeverity.LOW:
        return '#3B82F6' // blue-500
      default:
        return '#6B7280' // gray-500
    }
  }

  static getStatusColor(status: AlertStatus): string {
    switch (status) {
      case AlertStatus.ACTIVE:
        return '#10B981' // green-500
      case AlertStatus.READ:
        return '#6B7280' // gray-500
      case AlertStatus.DISMISSED:
        return '#9CA3AF' // gray-400
      case AlertStatus.EXPIRED:
        return '#F87171' // red-400
      default:
        return '#6B7280' // gray-500
    }
  }

  static formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'agora mesmo'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} dia${days > 1 ? 's' : ''} atrás`
    }
  }

  static isExpired(alert: Alert): boolean {
    if (alert.status === AlertStatus.EXPIRED) return true
    if (!alert.expiresAt) return false
    return new Date(alert.expiresAt) < new Date()
  }

  static shouldShowNotification(alert: Alert): boolean {
    return (
      alert.status === AlertStatus.ACTIVE &&
      !this.isExpired(alert) &&
      alert.channels.includes(AlertChannel.IN_APP)
    )
  }

  static getSeverityLevel(severity: AlertSeverity): number {
    switch (severity) {
      case AlertSeverity.LOW:
        return 1
      case AlertSeverity.MEDIUM:
        return 2
      case AlertSeverity.HIGH:
        return 3
      case AlertSeverity.CRITICAL:
        return 4
      default:
        return 0
    }
  }

  static sortBySeverityAndDate(alerts: Alert[]): Alert[] {
    return alerts.sort((a, b) => {
      // First sort by severity (critical first)
      const severityDiff = this.getSeverityLevel(b.severity) - this.getSeverityLevel(a.severity)
      if (severityDiff !== 0) return severityDiff

      // Then sort by date (newest first)
      return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    })
  }

  static groupByDate(alerts: Alert[]): Record<string, Alert[]> {
    const groups: Record<string, Alert[]> = {}

    alerts.forEach(alert => {
      const dateKey = new Date(alert.triggeredAt).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(alert)
    })

    return groups
  }

  static filterActive(alerts: Alert[]): Alert[] {
    return alerts.filter(alert =>
      alert.status === AlertStatus.ACTIVE && !this.isExpired(alert)
    )
  }

  static filterUnread(alerts: Alert[]): Alert[] {
    return alerts.filter(alert =>
      alert.status === AlertStatus.ACTIVE && !alert.readAt && !this.isExpired(alert)
    )
  }

  static filterCritical(alerts: Alert[]): Alert[] {
    return alerts.filter(alert =>
      alert.severity === AlertSeverity.CRITICAL &&
      alert.status === AlertStatus.ACTIVE &&
      !this.isExpired(alert)
    )
  }
}
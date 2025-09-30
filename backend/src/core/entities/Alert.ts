import { IsUUID, IsNotEmpty, IsEnum, IsOptional, IsDate, IsNumber } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'

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
  secondValue?: any // For 'between' operator
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

export class Alert {
  @IsUUID(4)
  public readonly id: string

  @IsUUID(4)
  @IsNotEmpty()
  public readonly userId: string

  @IsEnum(AlertType)
  public readonly type: AlertType

  @IsEnum(AlertSeverity)
  public readonly severity: AlertSeverity

  @IsEnum(AlertStatus)
  public readonly status: AlertStatus

  @IsNotEmpty()
  public readonly title: string

  @IsNotEmpty()
  public readonly message: string

  @IsOptional()
  public readonly description?: string

  public readonly data: AlertData

  public readonly rule?: AlertRule

  @IsOptional()
  public readonly actionUrl?: string

  @IsOptional()
  public readonly actionText?: string

  @IsOptional()
  @IsDate()
  public readonly triggeredAt: Date

  @IsOptional()
  @IsDate()
  public readonly readAt?: Date

  @IsOptional()
  @IsDate()
  public readonly dismissedAt?: Date

  @IsOptional()
  @IsDate()
  public readonly expiresAt?: Date

  @IsOptional()
  public readonly channels: AlertChannel[]

  @IsOptional()
  public readonly metadata?: Record<string, any>

  @IsDate()
  public readonly createdAt: Date

  @IsDate()
  public readonly updatedAt: Date

  constructor(data: {
    id?: string
    userId: string
    type: AlertType
    severity: AlertSeverity
    status?: AlertStatus
    title: string
    message: string
    description?: string
    data: AlertData
    rule?: AlertRule
    actionUrl?: string
    actionText?: string
    triggeredAt?: Date
    readAt?: Date
    dismissedAt?: Date
    expiresAt?: Date
    channels?: AlertChannel[]
    metadata?: Record<string, any>
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = data.id || uuidv4()
    this.userId = data.userId
    this.type = data.type
    this.severity = data.severity
    this.status = data.status || AlertStatus.ACTIVE
    this.title = data.title
    this.message = data.message
    this.description = data.description
    this.data = data.data
    this.rule = data.rule
    this.actionUrl = data.actionUrl
    this.actionText = data.actionText
    this.triggeredAt = data.triggeredAt || new Date()
    this.readAt = data.readAt
    this.dismissedAt = data.dismissedAt
    this.expiresAt = data.expiresAt
    this.channels = data.channels || [AlertChannel.IN_APP]
    this.metadata = data.metadata
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  public isActive(): boolean {
    return this.status === AlertStatus.ACTIVE
  }

  public isRead(): boolean {
    return this.status === AlertStatus.READ
  }

  public isDismissed(): boolean {
    return this.status === AlertStatus.DISMISSED
  }

  public isExpired(): boolean {
    if (this.status === AlertStatus.EXPIRED) return true
    return this.expiresAt ? new Date() > this.expiresAt : false
  }

  public isCritical(): boolean {
    return this.severity === AlertSeverity.CRITICAL
  }

  public isHigh(): boolean {
    return this.severity === AlertSeverity.HIGH
  }

  public markAsRead(): Alert {
    return new Alert({
      ...this,
      status: AlertStatus.READ,
      readAt: new Date(),
      updatedAt: new Date()
    })
  }

  public markAsDismissed(): Alert {
    return new Alert({
      ...this,
      status: AlertStatus.DISMISSED,
      dismissedAt: new Date(),
      updatedAt: new Date()
    })
  }

  public markAsExpired(): Alert {
    return new Alert({
      ...this,
      status: AlertStatus.EXPIRED,
      updatedAt: new Date()
    })
  }

  public setExpirationDate(expiresAt: Date): Alert {
    return new Alert({
      ...this,
      expiresAt,
      updatedAt: new Date()
    })
  }

  public updateSeverity(severity: AlertSeverity): Alert {
    return new Alert({
      ...this,
      severity,
      updatedAt: new Date()
    })
  }

  public canSendToChannel(channel: AlertChannel): boolean {
    return this.channels.includes(channel)
  }

  public shouldNotify(): boolean {
    return this.isActive() && !this.isExpired()
  }

  public getIcon(): string {
    switch (this.type) {
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
      default:
        return '🔔'
    }
  }

  public getColor(): string {
    switch (this.severity) {
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
}
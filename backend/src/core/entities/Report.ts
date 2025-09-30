import { IsUUID, IsNotEmpty, IsEnum, IsOptional, IsDate } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'

export enum ReportType {
  FINANCIAL_SUMMARY = 'FINANCIAL_SUMMARY',
  CATEGORY_ANALYSIS = 'CATEGORY_ANALYSIS',
  MONTHLY_TREND = 'MONTHLY_TREND',
  CASH_FLOW_PROJECTION = 'CASH_FLOW_PROJECTION',
  BUDGET_VARIANCE = 'BUDGET_VARIANCE',
  SPENDING_PATTERNS = 'SPENDING_PATTERNS',
  CUSTOM = 'CUSTOM'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum ReportFormat {
  JSON = 'JSON',
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV'
}

export interface ReportFilters {
  dateFrom?: Date
  dateTo?: Date
  categoryIds?: string[]
  accountIds?: string[]
  transactionTypes?: string[]
  minAmount?: number
  maxAmount?: number
  groupBy?: 'day' | 'week' | 'month' | 'year'
}

export interface ReportConfig {
  name: string
  description?: string
  type: ReportType
  filters: ReportFilters
  format: ReportFormat
  charts?: string[]
  grouping?: 'day' | 'week' | 'month' | 'year'
  autoGenerate?: boolean
  cronExpression?: string
}

export interface ReportData {
  summary?: Record<string, any>
  categories?: Record<string, any>[]
  trends?: Record<string, any>[]
  charts?: Record<string, any>[]
  rawData?: Record<string, any>[]
  metadata?: Record<string, any>
}

export class Report {
  @IsUUID(4)
  public readonly id: string

  @IsUUID(4)
  @IsNotEmpty()
  public readonly userId: string

  @IsNotEmpty()
  public readonly name: string

  @IsOptional()
  public readonly description?: string

  @IsEnum(ReportType)
  public readonly type: ReportType

  public readonly config: ReportConfig

  @IsEnum(ReportStatus)
  public readonly status: ReportStatus

  @IsEnum(ReportFormat)
  public readonly format: ReportFormat

  @IsOptional()
  public readonly data?: ReportData

  @IsOptional()
  public readonly fileUrl?: string

  @IsOptional()
  public readonly filePath?: string

  @IsOptional()
  public readonly error?: string

  @IsOptional()
  @IsDate()
  public readonly generatedAt?: Date

  @IsOptional()
  @IsDate()
  public readonly expiresAt?: Date

  @IsOptional()
  public readonly metadata?: Record<string, any>

  @IsDate()
  public readonly createdAt: Date

  @IsDate()
  public readonly updatedAt: Date

  constructor(data: {
    id?: string
    userId: string
    name: string
    description?: string
    type: ReportType
    config: ReportConfig
    status?: ReportStatus
    format: ReportFormat
    data?: ReportData
    fileUrl?: string
    filePath?: string
    error?: string
    generatedAt?: Date
    expiresAt?: Date
    metadata?: Record<string, any>
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = data.id || uuidv4()
    this.userId = data.userId
    this.name = data.name
    this.description = data.description
    this.type = data.type
    this.config = data.config
    this.status = data.status || ReportStatus.PENDING
    this.format = data.format
    this.data = data.data
    this.fileUrl = data.fileUrl
    this.filePath = data.filePath
    this.error = data.error
    this.generatedAt = data.generatedAt
    this.expiresAt = data.expiresAt
    this.metadata = data.metadata
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  public isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false
  }

  public isCompleted(): boolean {
    return this.status === ReportStatus.COMPLETED
  }

  public isFailed(): boolean {
    return this.status === ReportStatus.FAILED
  }

  public isProcessing(): boolean {
    return this.status === ReportStatus.PROCESSING || this.status === ReportStatus.PENDING
  }

  public markAsProcessing(): Report {
    return new Report({
      ...this,
      status: ReportStatus.PROCESSING,
      updatedAt: new Date()
    })
  }

  public markAsCompleted(data: ReportData, fileUrl?: string, filePath?: string): Report {
    return new Report({
      ...this,
      status: ReportStatus.COMPLETED,
      data,
      fileUrl,
      filePath,
      generatedAt: new Date(),
      updatedAt: new Date()
    })
  }

  public markAsFailed(error: string): Report {
    return new Report({
      ...this,
      status: ReportStatus.FAILED,
      error,
      updatedAt: new Date()
    })
  }

  public setExpirationDate(expiresAt: Date): Report {
    return new Report({
      ...this,
      expiresAt,
      updatedAt: new Date()
    })
  }
}
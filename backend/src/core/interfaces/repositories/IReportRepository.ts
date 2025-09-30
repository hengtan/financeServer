import { Report, ReportType, ReportStatus, ReportFormat } from '../../entities/Report'

export interface ReportQueryFilters {
  userId?: string
  type?: ReportType
  status?: ReportStatus
  format?: ReportFormat
  dateFrom?: Date
  dateTo?: Date
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ReportStats {
  total: number
  byType: Record<ReportType, number>
  byStatus: Record<ReportStatus, number>
  byFormat: Record<ReportFormat, number>
}

export interface IReportRepository {
  create(report: Report): Promise<Report>

  findById(id: string): Promise<Report | null>

  findByUserId(userId: string, filters?: Omit<ReportQueryFilters, 'userId'>): Promise<{
    reports: Report[]
    total: number
  }>

  findByType(type: ReportType, filters?: ReportQueryFilters): Promise<{
    reports: Report[]
    total: number
  }>

  findByStatus(status: ReportStatus, filters?: ReportQueryFilters): Promise<{
    reports: Report[]
    total: number
  }>

  findExpired(): Promise<Report[]>

  findPending(): Promise<Report[]>

  findProcessing(): Promise<Report[]>

  update(report: Report): Promise<Report>

  delete(id: string): Promise<void>

  deleteByUserId(userId: string): Promise<void>

  deleteExpired(): Promise<number>

  markAsProcessing(id: string): Promise<Report>

  markAsCompleted(id: string, data: any, fileUrl?: string, filePath?: string): Promise<Report>

  markAsFailed(id: string, error: string): Promise<Report>

  getStats(userId?: string): Promise<ReportStats>

  getRecentReports(userId: string, limit?: number): Promise<Report[]>

  searchByName(query: string, userId?: string): Promise<Report[]>

  exists(id: string): Promise<boolean>

  count(filters?: ReportQueryFilters): Promise<number>

  bulkCreate(reports: Report[]): Promise<Report[]>

  bulkUpdate(reports: Report[]): Promise<Report[]>

  bulkDelete(ids: string[]): Promise<void>

  cleanup(olderThanDays: number): Promise<number>
}
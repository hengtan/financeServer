import { Alert, AlertType, AlertSeverity, AlertStatus, AlertChannel } from '../../entities/Alert'

export interface AlertQueryFilters {
  userId?: string
  type?: AlertType
  severity?: AlertSeverity
  status?: AlertStatus
  channel?: AlertChannel
  dateFrom?: Date
  dateTo?: Date
  isExpired?: boolean
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
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

export interface IAlertRepository {
  create(alert: Alert): Promise<Alert>

  findById(id: string): Promise<Alert | null>

  findByUserId(userId: string, filters?: Omit<AlertQueryFilters, 'userId'>): Promise<{
    alerts: Alert[]
    total: number
  }>

  findByType(type: AlertType, filters?: AlertQueryFilters): Promise<{
    alerts: Alert[]
    total: number
  }>

  findBySeverity(severity: AlertSeverity, filters?: AlertQueryFilters): Promise<{
    alerts: Alert[]
    total: number
  }>

  findByStatus(status: AlertStatus, filters?: AlertQueryFilters): Promise<{
    alerts: Alert[]
    total: number
  }>

  findActive(userId?: string): Promise<Alert[]>

  findUnread(userId: string): Promise<Alert[]>

  findExpired(): Promise<Alert[]>

  findCritical(userId?: string): Promise<Alert[]>

  findRecentByUser(userId: string, limit?: number): Promise<Alert[]>

  update(alert: Alert): Promise<Alert>

  delete(id: string): Promise<void>

  deleteByUserId(userId: string): Promise<void>

  deleteExpired(): Promise<number>

  markAsRead(id: string): Promise<Alert>

  markAsDismissed(id: string): Promise<Alert>

  markAsExpired(id: string): Promise<Alert>

  markAllAsRead(userId: string): Promise<number>

  markAllAsDismissed(userId: string): Promise<number>

  getStats(userId?: string): Promise<AlertStats>

  getUnreadCount(userId: string): Promise<number>

  getActiveCount(userId: string): Promise<number>

  getCriticalCount(userId: string): Promise<number>

  searchByMessage(query: string, userId?: string): Promise<Alert[]>

  exists(id: string): Promise<boolean>

  count(filters?: AlertQueryFilters): Promise<number>

  bulkCreate(alerts: Alert[]): Promise<Alert[]>

  bulkUpdate(alerts: Alert[]): Promise<Alert[]>

  bulkDelete(ids: string[]): Promise<void>

  bulkMarkAsRead(ids: string[]): Promise<void>

  bulkMarkAsDismissed(ids: string[]): Promise<void>

  cleanup(olderThanDays: number): Promise<number>

  findDuplicates(userId: string, type: AlertType, timeWindowHours: number): Promise<Alert[]>

  deleteOldDismissed(olderThanDays: number): Promise<number>

  findByChannel(channel: AlertChannel, filters?: AlertQueryFilters): Promise<Alert[]>

  expireOldAlerts(): Promise<number>
}
import {
  PrismaClient,
  Alert as PrismaAlert,
  AlertType as PrismaAlertType,
  AlertSeverity as PrismaAlertSeverity,
  AlertStatus as PrismaAlertStatus
} from '@prisma/client'
import { IAlertRepository, AlertQueryFilters, AlertStats } from '../../core/interfaces/repositories/IAlertRepository'
import { Alert, AlertType, AlertSeverity, AlertStatus, AlertChannel, AlertData, AlertRule } from '../../core/entities/Alert'
import { Service, Inject } from 'typedi'

type PrismaAlertWithUser = PrismaAlert & {
  user?: {
    id: string
    name: string
    email: string
  }
}

@Service()
export class PrismaAlertRepository implements IAlertRepository {
  constructor(@Inject('PrismaClient') private prisma: PrismaClient) {}

  async create(alert: Alert): Promise<Alert> {
    const created = await this.prisma.alert.create({
      data: {
        id: alert.id,
        userId: alert.userId,
        type: alert.type as PrismaAlertType,
        severity: alert.severity as PrismaAlertSeverity,
        status: alert.status as PrismaAlertStatus,
        title: alert.title,
        message: alert.message,
        description: alert.description,
        data: alert.data as any,
        rule: alert.rule as any,
        actionUrl: alert.actionUrl,
        actionText: alert.actionText,
        triggeredAt: alert.triggeredAt,
        readAt: alert.readAt,
        dismissedAt: alert.dismissedAt,
        expiresAt: alert.expiresAt,
        channels: alert.channels as any,
        metadata: alert.metadata as any,
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return this.toDomainEntity(created)
  }

  async findById(id: string): Promise<Alert | null> {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!alert) return null
    return this.toDomainEntity(alert)
  }

  async findByUserId(userId: string, filters?: Omit<AlertQueryFilters, 'userId'>): Promise<{
    alerts: Alert[]
    total: number
  }> {
    const where: any = { userId }

    if (filters) {
      if (filters.type) where.type = filters.type
      if (filters.severity) where.severity = filters.severity
      if (filters.status) where.status = filters.status
      if (filters.dateFrom || filters.dateTo) {
        where.triggeredAt = {}
        if (filters.dateFrom) where.triggeredAt.gte = filters.dateFrom
        if (filters.dateTo) where.triggeredAt.lte = filters.dateTo
      }
      if (filters.isExpired !== undefined) {
        if (filters.isExpired) {
          where.OR = [
            { status: 'EXPIRED' },
            { expiresAt: { lte: new Date() } }
          ]
        } else {
          where.AND = [
            { status: { not: 'EXPIRED' } },
            { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }
          ]
        }
      }
    }

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: filters?.sortBy ? {
          [filters.sortBy]: filters.sortOrder || 'desc'
        } : { triggeredAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0
      }),
      this.prisma.alert.count({ where })
    ])

    return {
      alerts: alerts.map(a => this.toDomainEntity(a)),
      total
    }
  }

  async findByType(type: AlertType, filters?: AlertQueryFilters): Promise<{
    alerts: Alert[]
    total: number
  }> {
    const where: any = { type: type as PrismaAlertType }

    if (filters) {
      if (filters.userId) where.userId = filters.userId
      if (filters.severity) where.severity = filters.severity
      if (filters.status) where.status = filters.status
      if (filters.dateFrom || filters.dateTo) {
        where.triggeredAt = {}
        if (filters.dateFrom) where.triggeredAt.gte = filters.dateFrom
        if (filters.dateTo) where.triggeredAt.lte = filters.dateTo
      }
    }

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: filters?.sortBy ? {
          [filters.sortBy]: filters.sortOrder || 'desc'
        } : { triggeredAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0
      }),
      this.prisma.alert.count({ where })
    ])

    return {
      alerts: alerts.map(a => this.toDomainEntity(a)),
      total
    }
  }

  async findBySeverity(severity: AlertSeverity, filters?: AlertQueryFilters): Promise<{
    alerts: Alert[]
    total: number
  }> {
    const where: any = { severity: severity as PrismaAlertSeverity }

    if (filters) {
      if (filters.userId) where.userId = filters.userId
      if (filters.type) where.type = filters.type
      if (filters.status) where.status = filters.status
      if (filters.dateFrom || filters.dateTo) {
        where.triggeredAt = {}
        if (filters.dateFrom) where.triggeredAt.gte = filters.dateFrom
        if (filters.dateTo) where.triggeredAt.lte = filters.dateTo
      }
    }

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: filters?.sortBy ? {
          [filters.sortBy]: filters.sortOrder || 'desc'
        } : { triggeredAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0
      }),
      this.prisma.alert.count({ where })
    ])

    return {
      alerts: alerts.map(a => this.toDomainEntity(a)),
      total
    }
  }

  async findByStatus(status: AlertStatus, filters?: AlertQueryFilters): Promise<{
    alerts: Alert[]
    total: number
  }> {
    const where: any = { status: status as PrismaAlertStatus }

    if (filters) {
      if (filters.userId) where.userId = filters.userId
      if (filters.type) where.type = filters.type
      if (filters.severity) where.severity = filters.severity
      if (filters.dateFrom || filters.dateTo) {
        where.triggeredAt = {}
        if (filters.dateFrom) where.triggeredAt.gte = filters.dateFrom
        if (filters.dateTo) where.triggeredAt.lte = filters.dateTo
      }
    }

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: filters?.sortBy ? {
          [filters.sortBy]: filters.sortOrder || 'desc'
        } : { triggeredAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0
      }),
      this.prisma.alert.count({ where })
    ])

    return {
      alerts: alerts.map(a => this.toDomainEntity(a)),
      total
    }
  }

  async findActive(userId?: string): Promise<Alert[]> {
    const where: any = {
      status: 'ACTIVE',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }

    if (userId) where.userId = userId

    const alerts = await this.prisma.alert.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { triggeredAt: 'desc' }
    })

    return alerts.map(a => this.toDomainEntity(a))
  }

  async findUnread(userId: string): Promise<Alert[]> {
    const alerts = await this.prisma.alert.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        readAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { triggeredAt: 'desc' }
    })

    return alerts.map(a => this.toDomainEntity(a))
  }

  async findExpired(): Promise<Alert[]> {
    const alerts = await this.prisma.alert.findMany({
      where: {
        OR: [
          { status: 'EXPIRED' },
          {
            expiresAt: {
              lte: new Date()
            },
            status: {
              not: 'EXPIRED'
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return alerts.map(a => this.toDomainEntity(a))
  }

  async findCritical(userId?: string): Promise<Alert[]> {
    const where: any = {
      severity: 'CRITICAL',
      status: 'ACTIVE'
    }

    if (userId) where.userId = userId

    const alerts = await this.prisma.alert.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { triggeredAt: 'desc' }
    })

    return alerts.map(a => this.toDomainEntity(a))
  }

  async findRecentByUser(userId: string, limit = 10): Promise<Alert[]> {
    const alerts = await this.prisma.alert.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { triggeredAt: 'desc' },
      take: limit
    })

    return alerts.map(a => this.toDomainEntity(a))
  }

  async update(alert: Alert): Promise<Alert> {
    const updated = await this.prisma.alert.update({
      where: { id: alert.id },
      data: {
        type: alert.type as PrismaAlertType,
        severity: alert.severity as PrismaAlertSeverity,
        status: alert.status as PrismaAlertStatus,
        title: alert.title,
        message: alert.message,
        description: alert.description,
        data: alert.data as any,
        rule: alert.rule as any,
        actionUrl: alert.actionUrl,
        actionText: alert.actionText,
        triggeredAt: alert.triggeredAt,
        readAt: alert.readAt,
        dismissedAt: alert.dismissedAt,
        expiresAt: alert.expiresAt,
        channels: alert.channels as any,
        metadata: alert.metadata as any,
        updatedAt: alert.updatedAt
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return this.toDomainEntity(updated)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.alert.delete({
      where: { id }
    })
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.alert.deleteMany({
      where: { userId }
    })
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.alert.deleteMany({
      where: {
        OR: [
          { status: 'EXPIRED' },
          {
            expiresAt: {
              lte: new Date()
            }
          }
        ]
      }
    })

    return result.count
  }

  async markAsRead(id: string): Promise<Alert> {
    const updated = await this.prisma.alert.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return this.toDomainEntity(updated)
  }

  async markAsDismissed(id: string): Promise<Alert> {
    const updated = await this.prisma.alert.update({
      where: { id },
      data: {
        status: 'DISMISSED',
        dismissedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return this.toDomainEntity(updated)
  }

  async markAsExpired(id: string): Promise<Alert> {
    const updated = await this.prisma.alert.update({
      where: { id },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return this.toDomainEntity(updated)
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.alert.updateMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      data: {
        status: 'READ',
        readAt: new Date(),
        updatedAt: new Date()
      }
    })

    return result.count
  }

  async markAllAsDismissed(userId: string): Promise<number> {
    const result = await this.prisma.alert.updateMany({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'READ']
        }
      },
      data: {
        status: 'DISMISSED',
        dismissedAt: new Date(),
        updatedAt: new Date()
      }
    })

    return result.count
  }

  async getStats(userId?: string): Promise<AlertStats> {
    const where = userId ? { userId } : {}

    const [
      total,
      active,
      read,
      dismissed,
      expired,
      byType,
      bySeverity,
      byStatus
    ] = await Promise.all([
      this.prisma.alert.count({ where }),
      this.prisma.alert.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.alert.count({ where: { ...where, status: 'READ' } }),
      this.prisma.alert.count({ where: { ...where, status: 'DISMISSED' } }),
      this.prisma.alert.count({ where: { ...where, status: 'EXPIRED' } }),
      this.prisma.alert.groupBy({
        by: ['type'],
        where,
        _count: { type: true }
      }),
      this.prisma.alert.groupBy({
        by: ['severity'],
        where,
        _count: { severity: true }
      }),
      this.prisma.alert.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      })
    ])

    return {
      total,
      active,
      read,
      dismissed,
      expired,
      byType: byType.reduce((acc, item) => {
        acc[item.type as AlertType] = item._count.type
        return acc
      }, {} as Record<AlertType, number>),
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item.severity as AlertSeverity] = item._count.severity
        return acc
      }, {} as Record<AlertSeverity, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status as AlertStatus] = item._count.status
        return acc
      }, {} as Record<AlertStatus, number>)
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.alert.count({
      where: {
        userId,
        status: 'ACTIVE',
        readAt: null
      }
    })
  }

  async getActiveCount(userId: string): Promise<number> {
    return this.prisma.alert.count({
      where: {
        userId,
        status: 'ACTIVE'
      }
    })
  }

  async getCriticalCount(userId: string): Promise<number> {
    return this.prisma.alert.count({
      where: {
        userId,
        severity: 'CRITICAL',
        status: 'ACTIVE'
      }
    })
  }

  async searchByMessage(query: string, userId?: string): Promise<Alert[]> {
    const where: any = {
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          message: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    }

    if (userId) where.userId = userId

    const alerts = await this.prisma.alert.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { triggeredAt: 'desc' }
    })

    return alerts.map(a => this.toDomainEntity(a))
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.alert.count({
      where: { id }
    })
    return count > 0
  }

  async count(filters?: AlertQueryFilters): Promise<number> {
    const where: any = {}

    if (filters) {
      if (filters.userId) where.userId = filters.userId
      if (filters.type) where.type = filters.type
      if (filters.severity) where.severity = filters.severity
      if (filters.status) where.status = filters.status
      if (filters.dateFrom || filters.dateTo) {
        where.triggeredAt = {}
        if (filters.dateFrom) where.triggeredAt.gte = filters.dateFrom
        if (filters.dateTo) where.triggeredAt.lte = filters.dateTo
      }
    }

    return this.prisma.alert.count({ where })
  }

  async bulkCreate(alerts: Alert[]): Promise<Alert[]> {
    const created = await this.prisma.$transaction(
      alerts.map(alert =>
        this.prisma.alert.create({
          data: {
            id: alert.id,
            userId: alert.userId,
            type: alert.type as PrismaAlertType,
            severity: alert.severity as PrismaAlertSeverity,
            status: alert.status as PrismaAlertStatus,
            title: alert.title,
            message: alert.message,
            description: alert.description,
            data: alert.data as any,
            rule: alert.rule as any,
            actionUrl: alert.actionUrl,
            actionText: alert.actionText,
            triggeredAt: alert.triggeredAt,
            readAt: alert.readAt,
            dismissedAt: alert.dismissedAt,
            expiresAt: alert.expiresAt,
            channels: alert.channels as any,
            metadata: alert.metadata as any,
            createdAt: alert.createdAt,
            updatedAt: alert.updatedAt
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })
      )
    )

    return created.map(a => this.toDomainEntity(a))
  }

  async bulkUpdate(alerts: Alert[]): Promise<Alert[]> {
    const updated = await this.prisma.$transaction(
      alerts.map(alert =>
        this.prisma.alert.update({
          where: { id: alert.id },
          data: {
            type: alert.type as PrismaAlertType,
            severity: alert.severity as PrismaAlertSeverity,
            status: alert.status as PrismaAlertStatus,
            title: alert.title,
            message: alert.message,
            description: alert.description,
            data: alert.data as any,
            rule: alert.rule as any,
            actionUrl: alert.actionUrl,
            actionText: alert.actionText,
            triggeredAt: alert.triggeredAt,
            readAt: alert.readAt,
            dismissedAt: alert.dismissedAt,
            expiresAt: alert.expiresAt,
            channels: alert.channels as any,
            metadata: alert.metadata as any,
            updatedAt: alert.updatedAt
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })
      )
    )

    return updated.map(a => this.toDomainEntity(a))
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.prisma.alert.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })
  }

  async bulkMarkAsRead(ids: string[]): Promise<void> {
    await this.prisma.alert.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        status: 'READ',
        readAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  async bulkMarkAsDismissed(ids: string[]): Promise<void> {
    await this.prisma.alert.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        status: 'DISMISSED',
        dismissedAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  async cleanup(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await this.prisma.alert.deleteMany({
      where: {
        createdAt: {
          lte: cutoffDate
        },
        status: {
          in: ['READ', 'DISMISSED', 'EXPIRED']
        }
      }
    })

    return result.count
  }

  async findDuplicates(userId: string, type: AlertType, timeWindowHours: number): Promise<Alert[]> {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - timeWindowHours)

    const alerts = await this.prisma.alert.findMany({
      where: {
        userId,
        type: type as PrismaAlertType,
        triggeredAt: {
          gte: cutoffDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { triggeredAt: 'desc' }
    })

    return alerts.map(a => this.toDomainEntity(a))
  }

  async deleteOldDismissed(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await this.prisma.alert.deleteMany({
      where: {
        status: 'DISMISSED',
        dismissedAt: {
          lte: cutoffDate
        }
      }
    })

    return result.count
  }

  async findByChannel(channel: AlertChannel, filters?: AlertQueryFilters): Promise<Alert[]> {
    const where: any = {
      channels: {
        array_contains: [channel]
      }
    }

    if (filters) {
      if (filters.userId) where.userId = filters.userId
      if (filters.type) where.type = filters.type
      if (filters.severity) where.severity = filters.severity
      if (filters.status) where.status = filters.status
      if (filters.dateFrom || filters.dateTo) {
        where.triggeredAt = {}
        if (filters.dateFrom) where.triggeredAt.gte = filters.dateFrom
        if (filters.dateTo) where.triggeredAt.lte = filters.dateTo
      }
    }

    const alerts = await this.prisma.alert.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { triggeredAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    })

    return alerts.map(a => this.toDomainEntity(a))
  }

  async expireOldAlerts(): Promise<number> {
    const result = await this.prisma.alert.updateMany({
      where: {
        expiresAt: {
          lte: new Date()
        },
        status: {
          not: 'EXPIRED'
        }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    })

    return result.count
  }

  private toDomainEntity(prismaAlert: PrismaAlertWithUser): Alert {
    return new Alert({
      id: prismaAlert.id,
      userId: prismaAlert.userId,
      type: prismaAlert.type as AlertType,
      severity: prismaAlert.severity as AlertSeverity,
      status: prismaAlert.status as AlertStatus,
      title: prismaAlert.title,
      message: prismaAlert.message,
      description: prismaAlert.description,
      data: prismaAlert.data as AlertData,
      rule: prismaAlert.rule as AlertRule,
      actionUrl: prismaAlert.actionUrl,
      actionText: prismaAlert.actionText,
      triggeredAt: prismaAlert.triggeredAt,
      readAt: prismaAlert.readAt,
      dismissedAt: prismaAlert.dismissedAt,
      expiresAt: prismaAlert.expiresAt,
      channels: (prismaAlert.channels as any) || [AlertChannel.IN_APP],
      metadata: prismaAlert.metadata as Record<string, any>,
      createdAt: prismaAlert.createdAt,
      updatedAt: prismaAlert.updatedAt
    })
  }
}
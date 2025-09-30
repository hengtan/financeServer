import {
  PrismaClient,
  Report as PrismaReport,
  ReportType as PrismaReportType,
  ReportStatus as PrismaReportStatus,
  ReportFormat as PrismaReportFormat
} from '@prisma/client'
import { IReportRepository, ReportQueryFilters, ReportStats } from '../../core/interfaces/repositories/IReportRepository'
import { Report, ReportType, ReportStatus, ReportFormat, ReportConfig, ReportData } from '../../core/entities/Report'
import { Service, Inject } from 'typedi'

type PrismaReportWithUser = PrismaReport & {
  user?: {
    id: string
    name: string
    email: string
  }
}

@Service()
export class PrismaReportRepository implements IReportRepository {
  constructor(@Inject('PrismaClient') private prisma: PrismaClient) {}

  async create(report: Report): Promise<Report> {
    const created = await this.prisma.report.create({
      data: {
        id: report.id,
        userId: report.userId,
        name: report.name,
        description: report.description,
        type: report.type as PrismaReportType,
        status: report.status as PrismaReportStatus,
        format: report.format as PrismaReportFormat,
        config: report.config as any,
        data: report.data as any,
        fileUrl: report.fileUrl,
        filePath: report.filePath,
        error: report.error,
        generatedAt: report.generatedAt,
        expiresAt: report.expiresAt,
        metadata: report.metadata as any,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
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

  async findById(id: string): Promise<Report | null> {
    const report = await this.prisma.report.findUnique({
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

    if (!report) return null
    return this.toDomainEntity(report)
  }

  async findByUserId(userId: string, filters?: Omit<ReportQueryFilters, 'userId'>): Promise<{
    reports: Report[]
    total: number
  }> {
    const where: any = { userId }

    if (filters) {
      if (filters.type) where.type = filters.type
      if (filters.status) where.status = filters.status
      if (filters.format) where.format = filters.format
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {}
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
        if (filters.dateTo) where.createdAt.lte = filters.dateTo
      }
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
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
        } : { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0
      }),
      this.prisma.report.count({ where })
    ])

    return {
      reports: reports.map(r => this.toDomainEntity(r)),
      total
    }
  }

  async findByType(type: ReportType, filters?: ReportQueryFilters): Promise<{
    reports: Report[]
    total: number
  }> {
    const where: any = { type: type as PrismaReportType }

    if (filters) {
      if (filters.userId) where.userId = filters.userId
      if (filters.status) where.status = filters.status
      if (filters.format) where.format = filters.format
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {}
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
        if (filters.dateTo) where.createdAt.lte = filters.dateTo
      }
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
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
        } : { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0
      }),
      this.prisma.report.count({ where })
    ])

    return {
      reports: reports.map(r => this.toDomainEntity(r)),
      total
    }
  }

  async findByStatus(status: ReportStatus, filters?: ReportQueryFilters): Promise<{
    reports: Report[]
    total: number
  }> {
    const where: any = { status: status as PrismaReportStatus }

    if (filters) {
      if (filters.userId) where.userId = filters.userId
      if (filters.type) where.type = filters.type
      if (filters.format) where.format = filters.format
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {}
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
        if (filters.dateTo) where.createdAt.lte = filters.dateTo
      }
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
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
        } : { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0
      }),
      this.prisma.report.count({ where })
    ])

    return {
      reports: reports.map(r => this.toDomainEntity(r)),
      total
    }
  }

  async findExpired(): Promise<Report[]> {
    const reports = await this.prisma.report.findMany({
      where: {
        expiresAt: {
          lte: new Date()
        },
        status: {
          not: 'FAILED'
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
      }
    })

    return reports.map(r => this.toDomainEntity(r))
  }

  async findPending(): Promise<Report[]> {
    const reports = await this.prisma.report.findMany({
      where: {
        status: 'PENDING'
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
      orderBy: { createdAt: 'asc' }
    })

    return reports.map(r => this.toDomainEntity(r))
  }

  async findProcessing(): Promise<Report[]> {
    const reports = await this.prisma.report.findMany({
      where: {
        status: 'PROCESSING'
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

    return reports.map(r => this.toDomainEntity(r))
  }

  async update(report: Report): Promise<Report> {
    const updated = await this.prisma.report.update({
      where: { id: report.id },
      data: {
        name: report.name,
        description: report.description,
        type: report.type as PrismaReportType,
        status: report.status as PrismaReportStatus,
        format: report.format as PrismaReportFormat,
        config: report.config as any,
        data: report.data as any,
        fileUrl: report.fileUrl,
        filePath: report.filePath,
        error: report.error,
        generatedAt: report.generatedAt,
        expiresAt: report.expiresAt,
        metadata: report.metadata as any,
        updatedAt: report.updatedAt
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
    await this.prisma.report.delete({
      where: { id }
    })
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.report.deleteMany({
      where: { userId }
    })
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.report.deleteMany({
      where: {
        expiresAt: {
          lte: new Date()
        }
      }
    })

    return result.count
  }

  async markAsProcessing(id: string): Promise<Report> {
    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status: 'PROCESSING',
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

  async markAsCompleted(id: string, data: any, fileUrl?: string, filePath?: string): Promise<Report> {
    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        data: data as any,
        fileUrl,
        filePath,
        generatedAt: new Date(),
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

  async markAsFailed(id: string, error: string): Promise<Report> {
    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status: 'FAILED',
        error,
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

  async getStats(userId?: string): Promise<ReportStats> {
    const where = userId ? { userId } : {}

    const [
      total,
      byType,
      byStatus,
      byFormat
    ] = await Promise.all([
      this.prisma.report.count({ where }),
      this.prisma.report.groupBy({
        by: ['type'],
        where,
        _count: { type: true }
      }),
      this.prisma.report.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      this.prisma.report.groupBy({
        by: ['format'],
        where,
        _count: { format: true }
      })
    ])

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item.type as ReportType] = item._count.type
        return acc
      }, {} as Record<ReportType, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status as ReportStatus] = item._count.status
        return acc
      }, {} as Record<ReportStatus, number>),
      byFormat: byFormat.reduce((acc, item) => {
        acc[item.format as ReportFormat] = item._count.format
        return acc
      }, {} as Record<ReportFormat, number>)
    }
  }

  async getRecentReports(userId: string, limit = 10): Promise<Report[]> {
    const reports = await this.prisma.report.findMany({
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
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return reports.map(r => this.toDomainEntity(r))
  }

  async searchByName(query: string, userId?: string): Promise<Report[]> {
    const where: any = {
      name: {
        contains: query,
        mode: 'insensitive'
      }
    }

    if (userId) where.userId = userId

    const reports = await this.prisma.report.findMany({
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
      orderBy: { createdAt: 'desc' }
    })

    return reports.map(r => this.toDomainEntity(r))
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.report.count({
      where: { id }
    })
    return count > 0
  }

  async count(filters?: ReportQueryFilters): Promise<number> {
    const where: any = {}

    if (filters) {
      if (filters.userId) where.userId = filters.userId
      if (filters.type) where.type = filters.type
      if (filters.status) where.status = filters.status
      if (filters.format) where.format = filters.format
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {}
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
        if (filters.dateTo) where.createdAt.lte = filters.dateTo
      }
    }

    return this.prisma.report.count({ where })
  }

  async bulkCreate(reports: Report[]): Promise<Report[]> {
    const created = await this.prisma.$transaction(
      reports.map(report =>
        this.prisma.report.create({
          data: {
            id: report.id,
            userId: report.userId,
            name: report.name,
            description: report.description,
            type: report.type as PrismaReportType,
            status: report.status as PrismaReportStatus,
            format: report.format as PrismaReportFormat,
            config: report.config as any,
            data: report.data as any,
            fileUrl: report.fileUrl,
            filePath: report.filePath,
            error: report.error,
            generatedAt: report.generatedAt,
            expiresAt: report.expiresAt,
            metadata: report.metadata as any,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt
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

    return created.map(r => this.toDomainEntity(r))
  }

  async bulkUpdate(reports: Report[]): Promise<Report[]> {
    const updated = await this.prisma.$transaction(
      reports.map(report =>
        this.prisma.report.update({
          where: { id: report.id },
          data: {
            name: report.name,
            description: report.description,
            type: report.type as PrismaReportType,
            status: report.status as PrismaReportStatus,
            format: report.format as PrismaReportFormat,
            config: report.config as any,
            data: report.data as any,
            fileUrl: report.fileUrl,
            filePath: report.filePath,
            error: report.error,
            generatedAt: report.generatedAt,
            expiresAt: report.expiresAt,
            metadata: report.metadata as any,
            updatedAt: report.updatedAt
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

    return updated.map(r => this.toDomainEntity(r))
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.prisma.report.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })
  }

  async cleanup(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await this.prisma.report.deleteMany({
      where: {
        createdAt: {
          lte: cutoffDate
        },
        status: {
          in: ['COMPLETED', 'FAILED']
        }
      }
    })

    return result.count
  }

  private toDomainEntity(prismaReport: PrismaReportWithUser): Report {
    return new Report({
      id: prismaReport.id,
      userId: prismaReport.userId,
      name: prismaReport.name,
      description: prismaReport.description,
      type: prismaReport.type as ReportType,
      status: prismaReport.status as ReportStatus,
      format: prismaReport.format as ReportFormat,
      config: prismaReport.config as ReportConfig,
      data: prismaReport.data as ReportData,
      fileUrl: prismaReport.fileUrl,
      filePath: prismaReport.filePath,
      error: prismaReport.error,
      generatedAt: prismaReport.generatedAt,
      expiresAt: prismaReport.expiresAt,
      metadata: prismaReport.metadata as Record<string, any>,
      createdAt: prismaReport.createdAt,
      updatedAt: prismaReport.updatedAt
    })
  }
}
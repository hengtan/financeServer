import { PrismaClient, Budget } from '@prisma/client'
import { IBudgetRepository } from '../../core/interfaces/repositories/IBudgetRepository'

export class PrismaBudgetRepository implements IBudgetRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string, filters?: { period?: string; status?: string }): Promise<Budget[]> {
    const where: any = { userId }

    if (filters?.period) {
      where.period = filters.period
    }

    if (filters?.status) {
      where.status = filters.status
    }

    return this.prisma.budget.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        category: true
      }
    })
  }

  async findById(id: string): Promise<Budget | null> {
    return this.prisma.budget.findUnique({
      where: { id },
      include: {
        user: true,
        category: true
      }
    })
  }

  async create(data: any): Promise<Budget> {
    return this.prisma.budget.create({
      data: {
        name: data.name,
        description: data.description,
        amount: parseFloat(data.amount),
        period: data.period,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'ACTIVE',
        color: data.color || '#3B82F6',
        categoryId: data.categoryId,
        userId: data.userId
      },
      include: {
        user: true,
        category: true
      }
    })
  }

  async update(id: string, data: any): Promise<Budget> {
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount)
    if (data.period !== undefined) updateData.period = data.period
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate)
    if (data.status !== undefined) updateData.status = data.status
    if (data.color !== undefined) updateData.color = data.color
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId

    return this.prisma.budget.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        category: true
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.budget.delete({
      where: { id }
    })
  }

  async findByUserIdAndPeriod(userId: string, startDate: string, endDate: string): Promise<Budget[]> {
    return this.prisma.budget.findMany({
      where: {
        userId,
        OR: [
          {
            startDate: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          },
          {
            endDate: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          },
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(endDate) } }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        category: true
      }
    })
  }

  async getBudgetUsage(budgetId: string): Promise<any> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        user: true,
        category: true
      }
    })

    if (!budget) return null

    // Get transactions for the budget period and category
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: budget.userId,
        categoryId: budget.categoryId,
        type: 'EXPENSE',
        date: {
          gte: budget.startDate,
          lte: budget.endDate
        }
      }
    })

    const spent = transactions.reduce((sum, transaction) => sum + Math.abs(parseFloat(transaction.amount)), 0)
    const remaining = Math.max(0, budget.amount - spent)
    const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

    return {
      ...budget,
      spent,
      remaining,
      progress: Math.min(100, progress),
      transactionCount: transactions.length,
      transactions
    }
  }

  async findActiveBudgetsByCategory(userId: string, categoryId: string): Promise<Budget[]> {
    const now = new Date()

    return this.prisma.budget.findMany({
      where: {
        userId,
        categoryId,
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        user: true,
        category: true
      }
    })
  }
}
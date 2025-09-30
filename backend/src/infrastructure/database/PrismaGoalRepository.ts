import { PrismaClient, Goal } from '@prisma/client'
import { IGoalRepository } from '../../core/interfaces/repositories/IGoalRepository'

export class PrismaGoalRepository implements IGoalRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string, status?: string): Promise<Goal[]> {
    const where: any = { userId }

    if (status) {
      where.status = status
    }

    return this.prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        category: true
      }
    })
  }

  async findById(id: string): Promise<Goal | null> {
    return this.prisma.goal.findUnique({
      where: { id },
      include: {
        user: true,
        category: true
      }
    })
  }

  async create(data: any): Promise<Goal> {
    return this.prisma.goal.create({
      data: {
        title: data.title,
        description: data.description,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: parseFloat(data.currentAmount || '0'),
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: data.status || 'ACTIVE',
        category: data.category || 'Geral',
        color: data.color || '#3B82F6',
        userId: data.userId
      },
      include: {
        user: true,
        category: true
      }
    })
  }

  async update(id: string, data: any): Promise<Goal> {
    const updateData: any = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.targetAmount !== undefined) updateData.targetAmount = parseFloat(data.targetAmount)
    if (data.currentAmount !== undefined) updateData.currentAmount = parseFloat(data.currentAmount)
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null
    if (data.status !== undefined) updateData.status = data.status
    if (data.category !== undefined) updateData.category = data.category
    if (data.color !== undefined) updateData.color = data.color

    return this.prisma.goal.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        category: true
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.goal.delete({
      where: { id }
    })
  }

  async findByUserIdAndPeriod(userId: string, startDate: string, endDate: string): Promise<Goal[]> {
    return this.prisma.goal.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        category: true
      }
    })
  }

  async getGoalProgress(goalId: string): Promise<any> {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        user: true,
        category: true
      }
    })

    if (!goal) return null

    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

    let daysRemaining = null
    if (goal.deadline) {
      daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }

    return {
      ...goal,
      progress: Math.min(100, progress),
      remaining,
      daysRemaining
    }
  }
}
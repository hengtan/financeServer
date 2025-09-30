import { Goal } from '@prisma/client'

export interface IGoalRepository {
  findByUserId(userId: string, status?: string): Promise<Goal[]>
  findById(id: string): Promise<Goal | null>
  create(data: any): Promise<Goal>
  update(id: string, data: any): Promise<Goal>
  delete(id: string): Promise<void>
  findByUserIdAndPeriod(userId: string, startDate: string, endDate: string): Promise<Goal[]>
  getGoalProgress(goalId: string): Promise<any>
}
import { Budget } from '@prisma/client'

export interface IBudgetRepository {
  findByUserId(userId: string, filters?: { period?: string; status?: string }): Promise<Budget[]>
  findById(id: string): Promise<Budget | null>
  create(data: any): Promise<Budget>
  update(id: string, data: any): Promise<Budget>
  delete(id: string): Promise<void>
  findByUserIdAndPeriod(userId: string, startDate: string, endDate: string): Promise<Budget[]>
  getBudgetUsage(budgetId: string): Promise<any>
  findActiveBudgetsByCategory(userId: string, categoryId: string): Promise<Budget[]>
}
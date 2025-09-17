import { apiService, ApiResponse, PaginatedResponse, PaginationParams } from './api'

export interface Goal {
  id?: number
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: 'savings' | 'investment' | 'purchase' | 'debt_payment' | 'other'
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  progress: number
  createdAt?: string
  updatedAt?: string
  userId?: number
}

export interface GoalFilters extends PaginationParams {
  category?: string
  status?: 'active' | 'completed' | 'paused' | 'cancelled'
  priority?: 'low' | 'medium' | 'high'
  search?: string
}

export interface GoalContribution {
  id?: number
  goalId: number
  amount: number
  date: string
  description?: string
  type: 'contribution' | 'withdrawal'
  createdAt?: string
}

export interface GoalAnalytics {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalTargetAmount: number
  totalCurrentAmount: number
  averageProgress: number
  projectedCompletion: {
    goalId: number
    title: string
    estimatedDate: string
    monthsRemaining: number
  }[]
}

class GoalsService {
  private readonly baseUrl = '/goals'

  async getGoals(filters?: GoalFilters): Promise<ApiResponse<PaginatedResponse<Goal>>> {
    return apiService.getPaginated<Goal>(this.baseUrl, filters)
  }

  async getGoal(id: number): Promise<ApiResponse<Goal>> {
    return apiService.get<Goal>(`${this.baseUrl}/${id}`)
  }

  async createGoal(goal: Omit<Goal, 'id' | 'progress' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Goal>> {
    return apiService.post<Goal>(this.baseUrl, goal)
  }

  async updateGoal(id: number, goal: Partial<Goal>): Promise<ApiResponse<Goal>> {
    return apiService.put<Goal>(`${this.baseUrl}/${id}`, goal)
  }

  async deleteGoal(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`)
  }

  async getGoalContributions(goalId: number): Promise<ApiResponse<GoalContribution[]>> {
    return apiService.get<GoalContribution[]>(`${this.baseUrl}/${goalId}/contributions`)
  }

  async addContribution(goalId: number, contribution: Omit<GoalContribution, 'id' | 'goalId' | 'createdAt'>): Promise<ApiResponse<GoalContribution>> {
    return apiService.post<GoalContribution>(`${this.baseUrl}/${goalId}/contributions`, contribution)
  }

  async updateContribution(goalId: number, contributionId: number, contribution: Partial<GoalContribution>): Promise<ApiResponse<GoalContribution>> {
    return apiService.put<GoalContribution>(`${this.baseUrl}/${goalId}/contributions/${contributionId}`, contribution)
  }

  async deleteContribution(goalId: number, contributionId: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${goalId}/contributions/${contributionId}`)
  }

  async getGoalsAnalytics(): Promise<ApiResponse<GoalAnalytics>> {
    return apiService.get<GoalAnalytics>(`${this.baseUrl}/analytics`)
  }

  async getGoalProgress(id: number): Promise<ApiResponse<{
    progress: number
    remainingAmount: number
    monthlyContributionNeeded: number
    projectedCompletionDate: string
    onTrack: boolean
  }>> {
    return apiService.get(`${this.baseUrl}/${id}/progress`)
  }

  async getGoalCategories(): Promise<ApiResponse<Array<{
    category: string
    count: number
    totalAmount: number
    averageProgress: number
  }>>> {
    return apiService.get<Array<{
      category: string
      count: number
      totalAmount: number
      averageProgress: number
    }>>(`${this.baseUrl}/categories-summary`)
  }

  async simulateGoal(params: {
    targetAmount: number
    currentAmount: number
    monthlyContribution: number
    targetDate: string
  }): Promise<ApiResponse<{
    monthsToComplete: number
    projectedCompletionDate: string
    totalContributions: number
    feasible: boolean
    requiredMonthlyContribution: number
  }>> {
    return apiService.post(`${this.baseUrl}/simulate`, params)
  }

  async markGoalComplete(id: number): Promise<ApiResponse<Goal>> {
    return apiService.patch<Goal>(`${this.baseUrl}/${id}/complete`)
  }

  async pauseGoal(id: number): Promise<ApiResponse<Goal>> {
    return apiService.patch<Goal>(`${this.baseUrl}/${id}/pause`)
  }

  async resumeGoal(id: number): Promise<ApiResponse<Goal>> {
    return apiService.patch<Goal>(`${this.baseUrl}/${id}/resume`)
  }
}

export const goalsService = new GoalsService()

export class GoalUtils {
  static calculateProgress(currentAmount: number, targetAmount: number): number {
    return Math.min((currentAmount / targetAmount) * 100, 100)
  }

  static calculateRemainingAmount(currentAmount: number, targetAmount: number): number {
    return Math.max(targetAmount - currentAmount, 0)
  }

  static calculateMonthsRemaining(targetDate: string): number {
    const target = new Date(targetDate)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)), 0)
  }

  static calculateRequiredMonthlyContribution(
    currentAmount: number,
    targetAmount: number,
    targetDate: string
  ): number {
    const remaining = this.calculateRemainingAmount(currentAmount, targetAmount)
    const monthsRemaining = this.calculateMonthsRemaining(targetDate)

    if (monthsRemaining <= 0) return remaining
    return remaining / monthsRemaining
  }

  static formatGoalStatus(status: Goal['status']): string {
    const statusMap = {
      active: 'Ativo',
      completed: 'Concluído',
      paused: 'Pausado',
      cancelled: 'Cancelado'
    }
    return statusMap[status]
  }

  static formatGoalCategory(category: Goal['category']): string {
    const categoryMap = {
      savings: 'Poupança',
      investment: 'Investimento',
      purchase: 'Compra',
      debt_payment: 'Pagamento de Dívida',
      other: 'Outros'
    }
    return categoryMap[category]
  }

  static formatGoalPriority(priority: Goal['priority']): string {
    const priorityMap = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta'
    }
    return priorityMap[priority]
  }

  static getStatusColor(status: Goal['status']): string {
    const colorMap = {
      active: 'green',
      completed: 'blue',
      paused: 'orange',
      cancelled: 'red'
    }
    return colorMap[status]
  }

  static getPriorityColor(priority: Goal['priority']): string {
    const colorMap = {
      low: 'gray',
      medium: 'orange',
      high: 'red'
    }
    return colorMap[priority]
  }

  static isGoalOnTrack(goal: Goal): boolean {
    const monthsRemaining = this.calculateMonthsRemaining(goal.targetDate)
    const progressNeeded = (Date.now() - new Date(goal.createdAt || Date.now()).getTime()) /
      (new Date(goal.targetDate).getTime() - new Date(goal.createdAt || Date.now()).getTime()) * 100

    return goal.progress >= progressNeeded * 0.9 // 90% tolerance
  }
}
import { apiService } from './api'

// Types
export interface GoalPrediction {
  goalId: string
  prediction: {
    probability: number
    riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'critical'
    projectedCompletionDate: string | null
    onTrack: boolean
  }
  financial: {
    remaining: number
    requiredMonthly: number
    availableMonthly: number
    recommendedMonthly: number
    monthsRemaining: number
  }
  insights: Array<{
    type: string
    message: string
    priority: string
  }>
  timestamp: string
}

export interface ContributionPlan {
  name: string
  type: 'conservative' | 'moderate' | 'aggressive'
  monthly: number
  weekly: number
  daily: number
  completionMonths: number
  completionDate: string
  impactOnBudget: string
  description: string
}

export interface ContributionRecommendations {
  goalId: string
  plans: ContributionPlan[]
  recommended: 'conservative' | 'moderate' | 'aggressive'
  context: {
    monthlyIncome: number
    monthlyExpenses: number
    available: number
    remaining: number
    monthsToDeadline: number
  }
  timestamp: string
}

export interface AtRiskGoal {
  goalId: string
  name: string
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  reasons: string[]
  progress?: number
  daysRemaining?: number
  requiredMonthly?: number
  recommendation: string
}

export interface GoalOptimization {
  goalId: string
  suggestions: Array<{
    type: string
    current?: string
    suggested?: string | number
    reason: string
    impact: string
  }>
  optimal: {
    monthlyContribution: number
    deadline: string
    timeframe: string
  }
  timestamp: string
}

export interface GoalsDashboard {
  summary: {
    totalGoals: number
    activeGoals: number
    completedGoals: number
    atRiskCount: number
    totalTarget: number
    totalCurrent: number
    overallProgress: number
  }
  atRiskGoals: AtRiskGoal[]
  insights: Array<{
    type: string
    message: string
    priority: string
  }>
  timestamp: string
}

class AnalyticsService {
  private readonly basePath = '/analytics/goals'

  // Get prediction for a specific goal
  async getGoalPrediction(goalId: string, userId: string) {
    return apiService.get<GoalPrediction>(
      `${this.basePath}/prediction/${goalId}?user_id=${userId}`
    )
  }

  // Get contribution recommendations for a goal
  async getContributionRecommendations(goalId: string, userId: string) {
    return apiService.get<ContributionRecommendations>(
      `${this.basePath}/recommendations/${goalId}?user_id=${userId}`
    )
  }

  // Get all at-risk goals for a user
  async getAtRiskGoals(userId: string) {
    return apiService.get<{
      atRiskGoals: AtRiskGoal[]
      count: number
      summary: {
        critical: number
        high: number
        medium: number
      }
    }>(`${this.basePath}/at-risk?user_id=${userId}`)
  }

  // Get optimization suggestions for a goal
  async getGoalOptimization(goalId: string, userId: string) {
    return apiService.get<GoalOptimization>(
      `${this.basePath}/optimization/${goalId}?user_id=${userId}`
    )
  }

  // Get goals dashboard with AI insights
  async getGoalsDashboard(userId: string) {
    return apiService.get<GoalsDashboard>(
      `${this.basePath}/dashboard?user_id=${userId}`
    )
  }
}

export const analyticsService = new AnalyticsService()

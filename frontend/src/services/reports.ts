import { apiService, ApiResponse } from './api'

export interface ReportFilters {
  dateFrom?: string
  dateTo?: string
  category?: string
  type?: 'income' | 'expense'
  groupBy?: 'day' | 'week' | 'month' | 'year'
}

export interface FinancialSummary {
  period: {
    start: string
    end: string
  }
  totalIncome: number
  totalExpenses: number
  netIncome: number
  transactionsCount: number
  averageTransaction: number
  biggestIncome: {
    amount: number
    description: string
    date: string
  }
  biggestExpense: {
    amount: number
    description: string
    date: string
  }
}

export interface CategoryAnalysis {
  category: string
  totalAmount: number
  transactionsCount: number
  percentage: number
  averageTransaction: number
  trend: 'up' | 'down' | 'stable'
  monthlyData: Array<{
    month: string
    amount: number
  }>
}

export interface MonthlyTrend {
  month: string
  year: number
  income: number
  expenses: number
  netIncome: number
  transactionsCount: number
  categories: Array<{
    category: string
    amount: number
    percentage: number
  }>
}

export interface CashFlowProjection {
  projectionDate: string
  projectedBalance: number
  confidence: number
  factors: string[]
  scenarios: {
    optimistic: number
    realistic: number
    pessimistic: number
  }
}

export interface ExpenseByCategory {
  category: string
  amount: number
  percentage: number
  count: number
  avgAmount: number
  color: string
}

export interface IncomeBySource {
  source: string
  amount: number
  percentage: number
  count: number
  avgAmount: number
  color: string
}

export interface DashboardStats {
  currentMonth: {
    income: number
    expenses: number
    balance: number
    transactionsCount: number
  }
  lastMonth: {
    income: number
    expenses: number
    balance: number
    transactionsCount: number
  }
  yearToDate: {
    income: number
    expenses: number
    balance: number
    transactionsCount: number
  }
  trends: {
    incomeGrowth: number
    expenseGrowth: number
    balanceGrowth: number
  }
  topCategories: Array<{
    category: string
    amount: number
    type: 'income' | 'expense'
  }>
  recentTransactions: Array<{
    id: number
    description: string
    amount: number
    date: string
    category: string
    type: 'income' | 'expense'
  }>
}

class ReportsService {
  private readonly baseUrl = '/reports'

  async getFinancialSummary(filters?: ReportFilters): Promise<ApiResponse<FinancialSummary>> {
    return apiService.get<FinancialSummary>(`${this.baseUrl}/financial-summary`, {
      params: filters
    })
  }

  async getCategoryAnalysis(filters?: ReportFilters): Promise<ApiResponse<CategoryAnalysis[]>> {
    return apiService.get<CategoryAnalysis[]>(`${this.baseUrl}/category-analysis`, {
      params: filters
    })
  }

  async getMonthlyTrend(year?: number): Promise<ApiResponse<MonthlyTrend[]>> {
    return apiService.get<MonthlyTrend[]>(`${this.baseUrl}/monthly-trend`, {
      params: year ? { year } : {}
    })
  }

  async getExpensesByCategory(filters?: ReportFilters): Promise<ApiResponse<ExpenseByCategory[]>> {
    return apiService.get<ExpenseByCategory[]>(`${this.baseUrl}/expenses-by-category`, {
      params: filters
    })
  }

  async getIncomeBySource(filters?: ReportFilters): Promise<ApiResponse<IncomeBySource[]>> {
    return apiService.get<IncomeBySource[]>(`${this.baseUrl}/income-by-source`, {
      params: filters
    })
  }

  async getCashFlowProjection(months = 6): Promise<ApiResponse<CashFlowProjection[]>> {
    return apiService.get<CashFlowProjection[]>(`${this.baseUrl}/cash-flow-projection`, {
      params: { months }
    })
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiService.get<DashboardStats>(`${this.baseUrl}/dashboard-stats`)
  }

  async getYearlyComparison(years: number[]): Promise<ApiResponse<Array<{
    year: number
    income: number
    expenses: number
    balance: number
    months: Array<{
      month: number
      income: number
      expenses: number
      balance: number
    }>
  }>>> {
    return apiService.get(`${this.baseUrl}/yearly-comparison`, {
      params: { years: years.join(',') }
    })
  }

  async getTopTransactions(filters: ReportFilters & {
    limit?: number
    type: 'highest_income' | 'highest_expense' | 'most_frequent_category'
  }): Promise<ApiResponse<Array<{
    id: number
    description: string
    amount: number
    date: string
    category: string
    type: 'income' | 'expense'
  }>>> {
    return apiService.get(`${this.baseUrl}/top-transactions`, {
      params: filters
    })
  }

  async getSpendingPatterns(filters?: ReportFilters): Promise<ApiResponse<{
    byDayOfWeek: Array<{
      day: string
      amount: number
      count: number
    }>
    byTimeOfDay: Array<{
      hour: number
      amount: number
      count: number
    }>
    byPaymentMethod: Array<{
      method: string
      amount: number
      percentage: number
    }>
    seasonalTrends: Array<{
      quarter: string
      amount: number
      categories: string[]
    }>
  }>> {
    return apiService.get(`${this.baseUrl}/spending-patterns`, {
      params: filters
    })
  }

  async generateCustomReport(config: {
    name: string
    filters: ReportFilters
    charts: string[]
    grouping: 'day' | 'week' | 'month' | 'year'
    format: 'pdf' | 'excel' | 'csv'
  }): Promise<Blob> {
    const response = await apiService.client.post(`${this.baseUrl}/custom-report`, config, {
      responseType: 'blob'
    })
    return response.data
  }

  async getRecurringAnalysis(): Promise<ApiResponse<{
    recurringIncome: Array<{
      description: string
      amount: number
      frequency: string
      nextDate: string
      confidence: number
    }>
    recurringExpenses: Array<{
      description: string
      amount: number
      frequency: string
      nextDate: string
      confidence: number
    }>
    seasonalPatterns: Array<{
      period: string
      category: string
      averageAmount: number
      occurrences: number
    }>
  }>> {
    return apiService.get(`${this.baseUrl}/recurring-analysis`)
  }

  async getBudgetVariance(budgetId?: number): Promise<ApiResponse<{
    categories: Array<{
      category: string
      budgeted: number
      actual: number
      variance: number
      variancePercentage: number
      status: 'under' | 'over' | 'on_track'
    }>
    totalBudgeted: number
    totalActual: number
    totalVariance: number
    overallStatus: 'under' | 'over' | 'on_track'
  }>> {
    return apiService.get(`${this.baseUrl}/budget-variance`, {
      params: budgetId ? { budgetId } : {}
    })
  }
}

export const reportsService = new ReportsService()

export class ReportUtils {
  static formatCurrency(amount: number, currency = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  static formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`
  }

  static formatDate(date: string, format: 'short' | 'long' = 'short'): string {
    const options: Intl.DateTimeFormatOptions = format === 'short'
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { day: '2-digit', month: 'long', year: 'numeric' }

    return new Date(date).toLocaleDateString('pt-BR', options)
  }

  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / Math.abs(previous)) * 100
  }

  static getGrowthTrend(growthRate: number): 'up' | 'down' | 'stable' {
    if (Math.abs(growthRate) < 5) return 'stable'
    return growthRate > 0 ? 'up' : 'down'
  }

  static calculateVariance(actual: number, budgeted: number): {
    amount: number
    percentage: number
    status: 'under' | 'over' | 'on_track'
  } {
    const amount = actual - budgeted
    const percentage = budgeted !== 0 ? (amount / Math.abs(budgeted)) * 100 : 0

    let status: 'under' | 'over' | 'on_track' = 'on_track'
    if (Math.abs(percentage) > 10) {
      status = amount > 0 ? 'over' : 'under'
    }

    return { amount, percentage, status }
  }

  static groupDataByPeriod<T extends { date: string; amount: number }>(
    data: T[],
    groupBy: 'day' | 'week' | 'month' | 'year'
  ): Record<string, { items: T[]; total: number }> {
    return data.reduce((groups, item) => {
      let key: string

      const date = new Date(item.date)
      switch (groupBy) {
        case 'day':
          key = item.date.substring(0, 10) // YYYY-MM-DD
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().substring(0, 10)
          break
        case 'month':
          key = item.date.substring(0, 7) // YYYY-MM
          break
        case 'year':
          key = item.date.substring(0, 4) // YYYY
          break
      }

      if (!groups[key]) {
        groups[key] = { items: [], total: 0 }
      }

      groups[key].items.push(item)
      groups[key].total += item.amount

      return groups
    }, {} as Record<string, { items: T[]; total: number }>)
  }

  static generateColorPalette(count: number): string[] {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ]

    if (count <= colors.length) {
      return colors.slice(0, count)
    }

    // Generate additional colors if needed
    const additionalColors = []
    for (let i = colors.length; i < count; i++) {
      const hue = (i * 137.508) % 360 // Golden angle approximation
      additionalColors.push(`hsl(${hue}, 70%, 50%)`)
    }

    return [...colors, ...additionalColors]
  }
}
// Dashboard Service - Gerenciamento do dashboard financeiro
import { apiService, ApiResponse } from './api'

// Interface para resumo financeiro
export interface FinancialSummary {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
  expenseTrend: {
    percentage: number
    direction: 'UP' | 'DOWN' | 'STABLE'
  }
}

// Interface para resumo de contas
export interface AccountsSummary {
  total: number
  active: number
  totalBalance: number
}

// Interface para resumo de transações
export interface TransactionsSummary {
  total: number
  income: number
  expenses: number
  avgTransactionAmount: number
}

// Interface para resumo de metas
export interface GoalsSummary {
  total: number
  averageProgress: number
  completedGoals: number
  activeGoals: any[]
}

// Interface para resumo de orçamentos
export interface BudgetsSummary {
  total: number
  exceeded: number
  warning: number
  activeBudgets: any[]
}

// Interface para categoria de despesas
export interface ExpenseCategory {
  categoryId: string
  categoryName: string
  total: number
  count: number
}

// Interface para saúde financeira
export interface FinancialHealth {
  score: number
  recommendations: string[]
}

// Interface para analytics
export interface DashboardAnalytics {
  topExpenseCategories: ExpenseCategory[]
  monthlyTrend: number
  financialHealth: FinancialHealth
}

// Interface para período
export interface DashboardPeriod {
  days: number
  startDate: string
  endDate: string
}

// Interface para visão geral completa do dashboard
export interface DashboardOverview {
  period: DashboardPeriod
  financial: FinancialSummary
  accounts: AccountsSummary
  transactions: TransactionsSummary
  goals: GoalsSummary
  budgets: BudgetsSummary
  analytics: DashboardAnalytics
}

// Interface para estatísticas rápidas
export interface QuickStats {
  totalBalance: number
  accountsCount: number
  recentTransactionsCount: number
  activeGoalsCount: number
  activeBudgetsCount: number
  lastTransactionDate: string | null
}

class DashboardService {
  private readonly basePath = '/dashboard'

  // Obter visão geral financeira completa
  async getOverview(
    periodOrOptions?: number | { startDate: string; endDate: string }
  ): Promise<ApiResponse<DashboardOverview>> {
    let params: Record<string, string> = {}

    if (typeof periodOrOptions === 'number') {
      // Modo antigo: passar period (dias)
      params = { period: periodOrOptions.toString() }
    } else if (periodOrOptions && 'startDate' in periodOrOptions) {
      // Modo novo: passar datas específicas
      params = {
        startDate: periodOrOptions.startDate,
        endDate: periodOrOptions.endDate
      }
    }

    return apiService.get<DashboardOverview>(`${this.basePath}/overview`, { params })
  }

  // Obter estatísticas rápidas para widgets
  async getQuickStats(): Promise<ApiResponse<QuickStats>> {
    return apiService.get<QuickStats>(`${this.basePath}/quick-stats`)
  }

  // Testar conectividade da API
  async testConnection(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return apiService.get<{ message: string; timestamp: string }>(`${this.basePath}/test`)
  }

  // Métodos auxiliares

  // Obter períodos disponíveis
  getAvailablePeriods(): { value: number; label: string; description: string }[] {
    return [
      { value: 7, label: '7 dias', description: 'Última semana' },
      { value: 30, label: '30 dias', description: 'Último mês' },
      { value: 90, label: '90 dias', description: 'Últimos 3 meses' },
      { value: 180, label: '180 dias', description: 'Últimos 6 meses' },
      { value: 365, label: '365 dias', description: 'Último ano' }
    ]
  }

  // Calcular score de saúde financeira com base nos dados
  calculateLocalHealthScore(data: {
    income: number
    expenses: number
    savings: number
    budgetCompliance: number
  }): number {
    let score = 0

    // Renda vs Gastos (30 pontos)
    if (data.income > data.expenses) {
      const savingsRate = (data.income - data.expenses) / data.income
      score += Math.min(30, savingsRate * 100)
    }

    // Reserva de emergência (30 pontos)
    const emergencyMonths = data.savings / (data.expenses || 1)
    score += Math.min(30, emergencyMonths * 10)

    // Cumprimento de orçamentos (25 pontos)
    score += data.budgetCompliance * 25

    // Consistência financeira (15 pontos)
    score += 15 // Base score para ter dados

    return Math.round(Math.min(100, score))
  }

  // Gerar recomendações baseadas nos dados
  generateLocalRecommendations(data: {
    netIncome: number
    expenseTrend: number
    budgetStatus: any[]
    goalProgress: any[]
  }): string[] {
    const recommendations: string[] = []

    if (data.netIncome < 0) {
      recommendations.push('Sua renda está menor que os gastos. Considere revisar suas despesas.')
    }

    if (data.expenseTrend > 10) {
      recommendations.push('Seus gastos aumentaram significativamente. Verifique onde é possível economizar.')
    }

    const exceededBudgets = data.budgetStatus.filter(b => b.status === 'EXCEEDED')
    if (exceededBudgets.length > 0) {
      recommendations.push(`Você excedeu ${exceededBudgets.length} orçamento(s). Revise seus limites.`)
    }

    const stagnantGoals = data.goalProgress.filter(g => g.progress < 10)
    if (stagnantGoals.length > 0) {
      recommendations.push(`${stagnantGoals.length} meta(s) com pouco progresso. Considere ajustar os valores.`)
    }

    if (recommendations.length === 0) {
      recommendations.push('Parabéns! Sua situação financeira está bem equilibrada.')
    }

    return recommendations
  }

  // Obter cor baseada no score de saúde financeira
  getHealthScoreColor(score: number): string {
    if (score >= 80) return '#10B981' // Verde - Excelente
    if (score >= 60) return '#3B82F6' // Azul - Bom
    if (score >= 40) return '#F59E0B' // Amarelo - Regular
    return '#EF4444' // Vermelho - Ruim
  }

  // Obter texto descritivo do score de saúde
  getHealthScoreText(score: number): string {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bom'
    if (score >= 40) return 'Regular'
    return 'Precisa melhorar'
  }

  // Obter tendência de gastos formatada
  getExpenseTrendText(trend: number): string {
    if (trend > 5) return `Aumento de ${trend.toFixed(1)}%`
    if (trend < -5) return `Redução de ${Math.abs(trend).toFixed(1)}%`
    return 'Estável'
  }

  // Obter cor da tendência de gastos
  getExpenseTrendColor(trend: number): string {
    if (trend > 10) return '#EF4444' // Vermelho - Aumento significativo
    if (trend > 0) return '#F59E0B'  // Amarelo - Aumento moderado
    if (trend < -10) return '#10B981' // Verde - Redução significativa
    if (trend < 0) return '#3B82F6'  // Azul - Redução moderada
    return '#6B7280' // Cinza - Estável
  }

  // Formatir valor monetário
  formatAmount(amount: number, currency: string = 'BRL'): string {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Formatir porcentagem
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`
  }

  // Formatir data
  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj)
  }

  // Formatir data e hora
  formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  }

  // Calcular diferença de dias
  getDaysDifference(startDate: string | Date, endDate: string | Date): number {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Obter saudação baseada no horário
  getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  // Criar dados de exemplo para desenvolvimento
  createMockOverview(): DashboardOverview {
    const now = new Date()
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás

    return {
      period: {
        days: 30,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      },
      financial: {
        totalBalance: 12500.50,
        totalIncome: 8500.00,
        totalExpenses: 5200.30,
        netIncome: 3299.70,
        expenseTrend: {
          percentage: -5.2,
          direction: 'DOWN'
        }
      },
      accounts: {
        total: 3,
        active: 3,
        totalBalance: 12500.50
      },
      transactions: {
        total: 45,
        income: 8,
        expenses: 37,
        avgTransactionAmount: 305.12
      },
      goals: {
        total: 4,
        averageProgress: 67.5,
        completedGoals: 1,
        activeGoals: []
      },
      budgets: {
        total: 6,
        exceeded: 1,
        warning: 2,
        activeBudgets: []
      },
      analytics: {
        topExpenseCategories: [
          { categoryId: '1', categoryName: 'Alimentação', total: 1200.00, count: 15 },
          { categoryId: '2', categoryName: 'Transporte', total: 800.00, count: 8 },
          { categoryId: '3', categoryName: 'Lazer', total: 600.00, count: 6 }
        ],
        monthlyTrend: -5.2,
        financialHealth: {
          score: 78,
          recommendations: [
            'Parabéns! Sua situação financeira está bem equilibrada.',
            'Continue mantendo controle sobre seus gastos.'
          ]
        }
      }
    }
  }
}

// Instância singleton do serviço
export const dashboardService = new DashboardService()

// Exportar tipos para uso em outros arquivos
export type {
  DashboardOverview as DashboardOverviewType,
  QuickStats as QuickStatsType,
  FinancialSummary as FinancialSummaryType,
  FinancialHealth as FinancialHealthType,
  DashboardAnalytics as DashboardAnalyticsType
}
export { DashboardService }
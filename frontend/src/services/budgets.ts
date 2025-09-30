// Budgets Service - Gerenciamento de orçamentos
import { apiService, ApiResponse } from './api'

// Interface para um orçamento
export interface Budget {
  id: string
  name: string
  description?: string
  amount: number
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY'
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXCEEDED' | 'COMPLETED'
  color: string
  categoryId?: string
  userId: string
  createdAt: string
  updatedAt: string
  // Dados calculados
  spent?: number
  remaining?: number
  progress?: number
  daysRemaining?: number
}

// Interface para criação/atualização de orçamento
export interface CreateBudgetData {
  name: string
  description?: string
  amount: number
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY'
  startDate: string
  endDate: string
  status?: string
  color?: string
  categoryId?: string
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {}

// Interface para resumo de orçamentos
export interface BudgetsSummary {
  total: number
  active: number
  exceeded: number
  totalBudget: number
  totalSpent: number
}

// Interface para alertas de orçamento
export interface BudgetAlert {
  type: 'EXCEEDED' | 'WARNING' | 'INFO' | 'TIME_WARNING'
  severity: 'high' | 'medium' | 'low'
  message: string
  details: string
}

// Interface para análise de orçamentos
export interface BudgetAnalytic {
  budgetId: string
  name: string
  planned: number
  spent: number
  variance: number
  efficiency: number
}

// Interface para análise completa
export interface BudgetAnalytics {
  period: { startDate: string; endDate: string }
  summary: {
    totalBudgets: number
    totalPlanned: number
    totalSpent: number
    averageEfficiency: number
    budgetsExceeded: number
  }
  budgets: BudgetAnalytic[]
}

class BudgetsService {
  private readonly basePath = '/budgets'

  // Listar todos os orçamentos do usuário
  async getBudgets(period?: string, status?: string): Promise<ApiResponse<{ budgets: Budget[]; summary: BudgetsSummary }>> {
    const params: any = {}
    if (period) params.period = period
    if (status) params.status = status

    return apiService.get<{ budgets: Budget[]; summary: BudgetsSummary }>(this.basePath, { params })
  }

  // Buscar orçamento específico por ID
  async getBudgetById(id: string): Promise<ApiResponse<Budget>> {
    return apiService.get<Budget>(`${this.basePath}/${id}`)
  }

  // Criar novo orçamento
  async createBudget(data: CreateBudgetData): Promise<ApiResponse<Budget>> {
    return apiService.post<Budget>(this.basePath, data)
  }

  // Atualizar orçamento existente
  async updateBudget(id: string, data: UpdateBudgetData): Promise<ApiResponse<Budget>> {
    return apiService.put<Budget>(`${this.basePath}/${id}`, data)
  }

  // Deletar orçamento
  async deleteBudget(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.basePath}/${id}`)
  }

  // Obter alertas do orçamento
  async getBudgetAlerts(id: string): Promise<ApiResponse<{ budgetId: string; alerts: BudgetAlert[]; currentStatus: any }>> {
    return apiService.get<{ budgetId: string; alerts: BudgetAlert[]; currentStatus: any }>(`${this.basePath}/${id}/alerts`)
  }

  // Obter análise de orçamentos
  async getBudgetAnalytics(startDate?: string, endDate?: string): Promise<ApiResponse<BudgetAnalytics>> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    return apiService.get<BudgetAnalytics>(`${this.basePath}/analytics`, { params })
  }

  // Testar conectividade da API
  async testConnection(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return apiService.get<{ message: string; timestamp: string }>(`${this.basePath}/test`)
  }

  // Métodos auxiliares

  // Validar dados do orçamento
  validateBudgetData(data: CreateBudgetData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome do orçamento é obrigatório')
    }

    if (!data.amount || data.amount <= 0) {
      errors.push('Valor do orçamento deve ser maior que zero')
    }

    if (!data.period || !['MONTHLY', 'WEEKLY', 'YEARLY'].includes(data.period)) {
      errors.push('Período deve ser MONTHLY, WEEKLY ou YEARLY')
    }

    if (!data.startDate) {
      errors.push('Data de início é obrigatória')
    }

    if (!data.endDate) {
      errors.push('Data de fim é obrigatória')
    }

    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)

      if (endDate <= startDate) {
        errors.push('Data de fim deve ser posterior à data de início')
      }
    }

    if (data.color && !this.isValidColor(data.color)) {
      errors.push('Cor deve estar no formato hexadecimal (#RRGGBB)')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar cor hexadecimal
  private isValidColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return hexRegex.test(color)
  }

  // Obter períodos disponíveis
  getAvailablePeriods(): { value: string; label: string; description: string }[] {
    return [
      { value: 'WEEKLY', label: 'Semanal', description: 'Orçamento renovado a cada semana' },
      { value: 'MONTHLY', label: 'Mensal', description: 'Orçamento renovado mensalmente' },
      { value: 'YEARLY', label: 'Anual', description: 'Orçamento renovado anualmente' }
    ]
  }

  // Obter status disponíveis
  getAvailableStatuses(): { value: string; label: string; color: string; description: string }[] {
    return [
      { value: 'ACTIVE', label: 'Ativo', color: 'green', description: 'Orçamento em vigor' },
      { value: 'EXCEEDED', label: 'Excedido', color: 'red', description: 'Valor limite ultrapassado' },
      { value: 'COMPLETED', label: 'Concluído', color: 'blue', description: 'Período do orçamento finalizado' }
    ]
  }

  // Calcular progresso do orçamento
  calculateProgress(spent: number, budget: number): number {
    if (budget <= 0) return 0
    return Math.min(100, (spent / budget) * 100)
  }

  // Calcular valor restante
  calculateRemaining(spent: number, budget: number): number {
    return Math.max(0, budget - spent)
  }

  // Calcular dias restantes
  calculateDaysRemaining(endDate: string): number {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  // Determinar severidade do alerta
  getAlertSeverity(progress: number): 'low' | 'medium' | 'high' {
    if (progress >= 100) return 'high'
    if (progress >= 90) return 'medium'
    if (progress >= 75) return 'low'
    return 'low'
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
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
  }

  // Obter cor baseada no progresso
  getProgressColor(progress: number): string {
    if (progress >= 100) return '#EF4444' // Vermelho
    if (progress >= 90) return '#F59E0B'  // Amarelo
    if (progress >= 75) return '#F97316'  // Laranja
    return '#10B981' // Verde
  }

  // Obter texto do status em português
  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Ativo',
      'EXCEEDED': 'Excedido',
      'COMPLETED': 'Concluído'
    }
    return statusMap[status] || status
  }

  // Obter texto do período em português
  getPeriodText(period: string): string {
    const periodMap: Record<string, string> = {
      'WEEKLY': 'Semanal',
      'MONTHLY': 'Mensal',
      'YEARLY': 'Anual'
    }
    return periodMap[period] || period
  }

  // Gerar datas sugeridas baseadas no período
  generateSuggestedDates(period: 'WEEKLY' | 'MONTHLY' | 'YEARLY'): { startDate: string; endDate: string } {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'WEEKLY':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        break

      case 'MONTHLY':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break

      case 'YEARLY':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break

      default:
        startDate = now
        endDate = now
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }
}

// Instância singleton do serviço
export const budgetsService = new BudgetsService()

// Exportar tipos para uso em outros arquivos
export type {
  Budget,
  CreateBudgetData as CreateBudgetDataType,
  UpdateBudgetData as UpdateBudgetDataType,
  BudgetsSummary as BudgetsSummaryType,
  BudgetAlert as BudgetAlertType,
  BudgetAnalytic as BudgetAnalyticType,
  BudgetAnalytics as BudgetAnalyticsType
}
export { BudgetsService }
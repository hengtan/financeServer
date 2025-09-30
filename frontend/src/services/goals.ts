import { apiService, ApiResponse } from './api'

export interface Goal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  category: string
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  color: string
  userId: string
  createdAt: string
  updatedAt: string
  // Dados calculados
  progress?: number
  remaining?: number
  daysRemaining?: number
}

// Interface para criação/atualização de meta
export interface CreateGoalData {
  title: string
  description?: string
  targetAmount: number
  currentAmount?: number
  deadline?: string
  status?: string
  category?: string
  color?: string
}

export interface UpdateGoalData extends Partial<CreateGoalData> {}

// Interface para resumo de metas
export interface GoalsSummary {
  total: number
  active: number
  completed: number
  totalTarget: number
  totalCurrent: number
}

// Interface para contribuição em meta
export interface GoalContribution {
  amount: number
}

// Interface para progresso detalhado
export interface GoalProgress {
  goalId: string
  title: string
  financial: {
    current: number
    target: number
    remaining: number
    percentage: number
    isCompleted: boolean
  }
  time?: {
    totalDays: number
    daysPassed: number
    daysRemaining: number
    timePercentage: number
    isOverdue: boolean
  }
  recommendations: {
    dailyTarget?: number
    onTrack?: boolean
  }
}

class GoalsService {
  private readonly basePath = '/goals'

  // Listar todas as metas do usuário
  async getGoals(status?: string): Promise<ApiResponse<{ goals: Goal[]; summary: GoalsSummary }>> {
    const params = status ? { status } : {}
    return apiService.get<{ goals: Goal[]; summary: GoalsSummary }>(this.basePath, { params })
  }

  // Buscar meta específica por ID
  async getGoalById(id: string): Promise<ApiResponse<Goal>> {
    return apiService.get<Goal>(`${this.basePath}/${id}`)
  }

  // Criar nova meta
  async createGoal(data: CreateGoalData): Promise<ApiResponse<Goal>> {
    return apiService.post<Goal>(this.basePath, data)
  }

  // Atualizar meta existente
  async updateGoal(id: string, data: UpdateGoalData): Promise<ApiResponse<Goal>> {
    return apiService.put<Goal>(`${this.basePath}/${id}`, data)
  }

  // Deletar meta
  async deleteGoal(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.basePath}/${id}`)
  }

  // Adicionar valor à meta
  async contributeToGoal(id: string, contribution: GoalContribution): Promise<ApiResponse<Goal>> {
    return apiService.post<Goal>(`${this.basePath}/${id}/contribute`, contribution)
  }

  // Obter progresso detalhado da meta
  async getGoalProgress(id: string): Promise<ApiResponse<GoalProgress>> {
    return apiService.get<GoalProgress>(`${this.basePath}/${id}/progress`)
  }

  // Testar conectividade da API
  async testConnection(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return apiService.get<{ message: string; timestamp: string }>(`${this.basePath}/test`)
  }

  // Métodos auxiliares

  // Validar dados da meta
  validateGoalData(data: CreateGoalData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Título da meta é obrigatório')
    }

    if (!data.targetAmount || data.targetAmount <= 0) {
      errors.push('Valor alvo deve ser maior que zero')
    }

    if (data.deadline) {
      const deadline = new Date(data.deadline)
      const now = new Date()
      if (deadline <= now) {
        errors.push('Data limite deve ser no futuro')
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

  // Calcular progresso da meta
  calculateProgress(currentAmount: number, targetAmount: number): number {
    if (targetAmount <= 0) return 0
    return Math.min((currentAmount / targetAmount) * 100, 100)
  }

  // Calcular valor restante
  calculateRemaining(currentAmount: number, targetAmount: number): number {
    return Math.max(targetAmount - currentAmount, 0)
  }

  // Calcular dias restantes
  calculateDaysRemaining(deadline?: string): number | null {
    if (!deadline) return null
    const end = new Date(deadline)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  // Obter status disponíveis
  getAvailableStatuses(): { value: string; label: string; color: string }[] {
    return [
      { value: 'ACTIVE', label: 'Ativo', color: 'green' },
      { value: 'COMPLETED', label: 'Concluído', color: 'blue' },
      { value: 'PAUSED', label: 'Pausado', color: 'orange' }
    ]
  }

  // Obter categorias padrão
  getDefaultCategories(): string[] {
    return [
      'Emergência',
      'Viagem',
      'Casa',
      'Carro',
      'Educação',
      'Aposentadoria',
      'Investimento',
      'Geral'
    ]
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

  // Obter texto do status em português
  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Ativo',
      'COMPLETED': 'Concluído',
      'PAUSED': 'Pausado'
    }
    return statusMap[status] || status
  }

  // Obter cor baseada no progresso
  getProgressColor(progress: number): string {
    if (progress >= 100) return '#10B981' // Verde
    if (progress >= 75) return '#3B82F6'  // Azul
    if (progress >= 50) return '#F59E0B'  // Amarelo
    return '#EF4444' // Vermelho
  }
}

// Instância singleton do serviço
export const goalsService = new GoalsService()

// Exportar tipos para uso em outros arquivos
export type {
  Goal,
  CreateGoalData as CreateGoalDataType,
  UpdateGoalData as UpdateGoalDataType,
  GoalsSummary as GoalsSummaryType,
  GoalContribution as GoalContributionType,
  GoalProgress as GoalProgressType
}
export { GoalsService }
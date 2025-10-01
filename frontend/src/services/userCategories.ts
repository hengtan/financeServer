// User Categories Service - Gerenciamento de categorias de usuário
import { apiService, ApiResponse } from './api'

// Interface para uma categoria de usuário
export interface UserCategory {
  id: string
  userId: string
  categoryTemplateId?: string
  name: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  description?: string
  color?: string
  icon?: string
  parentCategoryId?: string
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  isActive: boolean
  isCustom: boolean
  isDefault: boolean
  sortOrder?: number
  tags: string[]
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

// Interface para criação de categoria de usuário
export interface CreateUserCategoryData {
  name: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  description?: string
  color?: string
  icon?: string
  parentCategoryId?: string
  isDefault?: boolean
  sortOrder?: number
  tags?: string[]
  metadata?: Record<string, any>
}

// Interface para criação a partir de template
export interface CreateFromTemplateData {
  templateId: string
  customizations?: {
    name?: string
    description?: string
    color?: string
    icon?: string
    sortOrder?: number
    isDefault?: boolean
  }
}

export interface UpdateUserCategoryData extends Partial<Omit<CreateUserCategoryData, 'type'>> {}

// Interface para listagem paginada
export interface UserCategoriesResponse {
  categories: UserCategory[]
  total: number
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Interface para estatísticas de uso
export interface CategoryUsageStats {
  transactionCount: number
  budgetCount: number
  lastUsed?: string
}

// Interface para analytics do usuário
export interface UserCategoryAnalytics {
  totalCategories: number
  activeCategoriesCount: number
  customCategoriesCount: number
  templateBasedCount: number
  categoriesByType: Record<'INCOME' | 'EXPENSE' | 'TRANSFER', number>
  mostUsedCategories: Array<{
    categoryId: string
    categoryName: string
    transactionCount: number
    lastUsed?: string
  }>
}

class UserCategoriesService {
  private readonly basePath = '/user-categories'

  // Listar categorias do usuário
  async getUserCategories(filters?: {
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    isActive?: boolean
    isDefault?: boolean
    isCustom?: boolean
    parentCategoryId?: string
    searchTerm?: string
    sortBy?: 'name' | 'createdAt' | 'sortOrder'
    sortOrder?: 'ASC' | 'DESC'
    limit?: number
    offset?: number
  }): Promise<ApiResponse<UserCategoriesResponse>> {
    return apiService.get<UserCategoriesResponse>(this.basePath, { params: filters })
  }

  // Buscar categoria específica por ID
  async getUserCategoryById(id: string): Promise<ApiResponse<UserCategory>> {
    return apiService.get<UserCategory>(`${this.basePath}/${id}`)
  }

  // Buscar categorias ativas do usuário
  async getActiveUserCategories(type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'): Promise<ApiResponse<UserCategory[]>> {
    const params = type ? { type } : {}
    return apiService.get<UserCategory[]>(`${this.basePath}/active`, { params })
  }

  // Buscar categorias por tipo
  async getUserCategoriesByType(type: 'INCOME' | 'EXPENSE' | 'TRANSFER', options?: {
    isActive?: boolean
    isDefault?: boolean
    sortBy?: 'name' | 'sortOrder'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<ApiResponse<UserCategory[]>> {
    return apiService.get<UserCategory[]>(`${this.basePath}/type/${type}`, { params: options })
  }

  // Buscar apenas categorias padrão do usuário
  async getDefaultUserCategories(type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'): Promise<ApiResponse<UserCategory[]>> {
    const params = type ? { type } : {}
    return apiService.get<UserCategory[]>(`${this.basePath}/default`, { params })
  }

  // Buscar apenas categorias customizadas do usuário
  async getCustomUserCategories(options?: {
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    isActive?: boolean
    sortBy?: 'name' | 'createdAt'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<ApiResponse<UserCategory[]>> {
    return apiService.get<UserCategory[]>(`${this.basePath}/custom`, { params: options })
  }

  // Criar nova categoria customizada
  async createUserCategory(data: CreateUserCategoryData): Promise<ApiResponse<UserCategory>> {
    return apiService.post<UserCategory>(this.basePath, data)
  }

  // Criar categoria a partir de template
  async createFromTemplate(data: CreateFromTemplateData): Promise<ApiResponse<UserCategory>> {
    return apiService.post<UserCategory>(`${this.basePath}/from-template`, data)
  }

  // Atualizar categoria
  async updateUserCategory(id: string, data: UpdateUserCategoryData): Promise<ApiResponse<UserCategory>> {
    return apiService.put<UserCategory>(`${this.basePath}/${id}`, data)
  }

  // Arquivar categoria
  async archiveUserCategory(id: string): Promise<ApiResponse<UserCategory>> {
    return apiService.patch<UserCategory>(`${this.basePath}/${id}/archive`)
  }

  // Ativar categoria
  async activateUserCategory(id: string): Promise<ApiResponse<UserCategory>> {
    return apiService.patch<UserCategory>(`${this.basePath}/${id}/activate`)
  }

  // Deletar categoria
  async deleteUserCategory(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.basePath}/${id}`)
  }

  // Configurar categorias padrão para usuário
  async setupDefaultCategories(): Promise<ApiResponse<UserCategory[]>> {
    return apiService.post<UserCategory[]>(`${this.basePath}/setup-defaults`)
  }

  // Sincronizar com template
  async syncWithTemplate(categoryId: string): Promise<ApiResponse<UserCategory>> {
    return apiService.patch<UserCategory>(`${this.basePath}/${categoryId}/sync`)
  }

  // Obter estatísticas de uso da categoria
  async getCategoryUsageStats(categoryId: string): Promise<ApiResponse<CategoryUsageStats>> {
    return apiService.get<CategoryUsageStats>(`${this.basePath}/${categoryId}/usage`)
  }

  // Obter analytics do usuário
  async getUserCategoryAnalytics(): Promise<ApiResponse<UserCategoryAnalytics>> {
    return apiService.get<UserCategoryAnalytics>(`${this.basePath}/analytics`)
  }

  // Buscar categorias
  async searchUserCategories(query: string, filters?: {
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    isActive?: boolean
    isCustom?: boolean
    limit?: number
  }): Promise<ApiResponse<{
    query: string
    filters: any
    categories: UserCategory[]
    total: number
  }>> {
    const params = { q: query, ...filters }
    return apiService.get(`${this.basePath}/search`, { params })
  }

  // Testar conectividade da API
  async testConnection(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return apiService.get<{ message: string; timestamp: string }>(`${this.basePath}/test`)
  }

  // Métodos auxiliares

  // Validar dados da categoria
  validateCategoryData(data: CreateUserCategoryData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome da categoria é obrigatório')
    }

    if (!data.type || !['INCOME', 'EXPENSE', 'TRANSFER'].includes(data.type)) {
      errors.push('Tipo da categoria deve ser INCOME, EXPENSE ou TRANSFER')
    }

    if (data.color && !this.isValidColor(data.color)) {
      errors.push('Cor deve estar no formato hexadecimal (#RRGGBB)')
    }

    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      errors.push('Ordem de classificação deve ser um número positivo')
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

  // Filtrar categorias por tipo
  filterCategoriesByType(categories: UserCategory[], type: 'INCOME' | 'EXPENSE' | 'TRANSFER'): UserCategory[] {
    return categories.filter(category => category.type === type)
  }

  // Separar categorias por origem
  separateCategories(categories: UserCategory[]): {
    default: UserCategory[]
    custom: UserCategory[]
    templateBased: UserCategory[]
  } {
    return {
      default: categories.filter(category => category.isDefault),
      custom: categories.filter(category => category.isCustom),
      templateBased: categories.filter(category => category.categoryTemplateId && !category.isCustom)
    }
  }

  // Obter categorias agrupadas por tipo
  groupCategoriesByType(categories: UserCategory[]): {
    INCOME: UserCategory[]
    EXPENSE: UserCategory[]
    TRANSFER: UserCategory[]
  } {
    return {
      INCOME: categories.filter(c => c.type === 'INCOME'),
      EXPENSE: categories.filter(c => c.type === 'EXPENSE'),
      TRANSFER: categories.filter(c => c.type === 'TRANSFER')
    }
  }

  // Obter categorias ordenadas por sortOrder
  sortCategoriesByOrder(categories: UserCategory[]): UserCategory[] {
    return categories.sort((a, b) => {
      const orderA = a.sortOrder ?? 999
      const orderB = b.sortOrder ?? 999
      return orderA - orderB
    })
  }

  // Obter categorias ativas apenas
  getActiveCategories(categories: UserCategory[]): UserCategory[] {
    return categories.filter(category => category.isActive && category.status === 'ACTIVE')
  }

  // Verificar se categoria pode ser deletada
  canDeleteCategory(category: UserCategory, usageStats?: CategoryUsageStats): boolean {
    if (!category.isCustom && category.isDefault) {
      return false // Não pode deletar categorias padrão
    }

    if (usageStats && (usageStats.transactionCount > 0 || usageStats.budgetCount > 0)) {
      return false // Não pode deletar se estiver sendo usada
    }

    return true
  }

  // Obter cor baseada no tipo da categoria
  getTypeColor(type: 'INCOME' | 'EXPENSE' | 'TRANSFER'): string {
    switch (type) {
      case 'INCOME':
        return '#10B981'
      case 'EXPENSE':
        return '#EF4444'
      case 'TRANSFER':
        return '#6366F1'
      default:
        return '#6B7280'
    }
  }

  // Obter texto de descrição baseado no tipo
  getTypeDescription(type: 'INCOME' | 'EXPENSE' | 'TRANSFER'): string {
    switch (type) {
      case 'INCOME':
        return 'Receita'
      case 'EXPENSE':
        return 'Despesa'
      case 'TRANSFER':
        return 'Transferência'
      default:
        return 'Desconhecido'
    }
  }

  // Obter dados padrão da categoria por tipo
  getDefaultCategoryData(type: 'INCOME' | 'EXPENSE' | 'TRANSFER'): Partial<CreateUserCategoryData> {
    return {
      type,
      color: this.getTypeColor(type),
      icon: this.getDefaultIcon(type),
      tags: []
    }
  }

  // Obter ícone padrão por tipo
  private getDefaultIcon(type: 'INCOME' | 'EXPENSE' | 'TRANSFER'): string {
    switch (type) {
      case 'INCOME':
        return '💰'
      case 'EXPENSE':
        return '📂'
      case 'TRANSFER':
        return '↔️'
      default:
        return '📁'
    }
  }

  // Verificar se categoria é baseada em template
  isTemplateBasedCategory(category: UserCategory): boolean {
    return !!category.categoryTemplateId && !category.isCustom
  }

  // Verificar se categoria pode ser sincronizada
  canSyncWithTemplate(category: UserCategory): boolean {
    return this.isTemplateBasedCategory(category)
  }
}

// Instância singleton do serviço
export const userCategoriesService = new UserCategoriesService()

// Exportar tipos para uso em outros arquivos
export type {
  UserCategory as UserCategoryType,
  CreateUserCategoryData as CreateUserCategoryDataType,
  CreateFromTemplateData as CreateFromTemplateDataType,
  UpdateUserCategoryData as UpdateUserCategoryDataType,
  UserCategoriesResponse as UserCategoriesResponseType,
  CategoryUsageStats as CategoryUsageStatsType,
  UserCategoryAnalytics as UserCategoryAnalyticsType
}
export { UserCategoriesService }
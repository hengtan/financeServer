// Category Templates Service - Gerenciamento de templates de categorias
import { apiService, ApiResponse } from './api'

// Interface para um template de categoria
export interface CategoryTemplate {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  description?: string
  color: string
  icon: string
  isDefault: boolean
  isSystem: boolean
  sortOrder?: number
  tags: string[]
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

// Interface para criação/atualização de template
export interface CreateCategoryTemplateData {
  name: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  description?: string
  color?: string
  icon?: string
  isDefault?: boolean
  isSystem?: boolean
  sortOrder?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateCategoryTemplateData extends Partial<Omit<CreateCategoryTemplateData, 'name' | 'type'>> {}

// Interface para listagem paginada
export interface CategoryTemplatesResponse {
  templates: CategoryTemplate[]
  total: number
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Interface para estatísticas de uso
export interface TemplateUsageStats {
  userCategoryCount: number
  activeUserCategoryCount: number
  mostUsedBy?: {
    userId: string
    categoryName: string
    usageCount: number
  }
}

class CategoryTemplatesService {
  private readonly basePath = '/category-templates'

  // Listar todos os templates
  async getTemplates(filters?: {
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    isDefault?: boolean
    isSystem?: boolean
    sortOrder?: 'ASC' | 'DESC'
    limit?: number
    offset?: number
  }): Promise<ApiResponse<CategoryTemplatesResponse>> {
    return apiService.get<CategoryTemplatesResponse>(this.basePath, { params: filters })
  }

  // Buscar template específico por ID
  async getTemplateById(id: string): Promise<ApiResponse<CategoryTemplate>> {
    return apiService.get<CategoryTemplate>(`${this.basePath}/${id}`)
  }

  // Buscar templates por tipo
  async getTemplatesByType(type: 'INCOME' | 'EXPENSE' | 'TRANSFER', options?: {
    isDefault?: boolean
    isSystem?: boolean
    sortOrder?: 'ASC' | 'DESC'
    limit?: number
  }): Promise<ApiResponse<{
    type: string
    templates: CategoryTemplate[]
    total: number
  }>> {
    return apiService.get<{
      type: string
      templates: CategoryTemplate[]
      total: number
    }>(`${this.basePath}/type/${type}`, { params: options })
  }

  // Buscar apenas templates padrão
  async getDefaultTemplates(options?: {
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<ApiResponse<{
    templates: CategoryTemplate[]
    total: number
    groupedByType: {
      INCOME: CategoryTemplate[]
      EXPENSE: CategoryTemplate[]
      TRANSFER: CategoryTemplate[]
    }
  }>> {
    return apiService.get(`${this.basePath}/default`, { params: options })
  }

  // Criar novo template (Admin only)
  async createTemplate(data: CreateCategoryTemplateData): Promise<ApiResponse<CategoryTemplate>> {
    return apiService.post<CategoryTemplate>(this.basePath, data)
  }

  // Atualizar template (Admin only)
  async updateTemplate(id: string, data: UpdateCategoryTemplateData): Promise<ApiResponse<CategoryTemplate>> {
    return apiService.put<CategoryTemplate>(`${this.basePath}/${id}`, data)
  }

  // Deletar template (Admin only)
  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.basePath}/${id}`)
  }

  // Obter estatísticas de uso do template
  async getUsageStats(id: string): Promise<ApiResponse<{
    templateId: string
    usage: TemplateUsageStats
  }>> {
    return apiService.get(`${this.basePath}/${id}/usage`)
  }

  // Buscar templates
  async searchTemplates(query: string, filters?: {
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    isDefault?: boolean
    isSystem?: boolean
    limit?: number
  }): Promise<ApiResponse<{
    query: string
    filters: any
    templates: CategoryTemplate[]
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

  // Validar dados do template
  validateTemplateData(data: CreateCategoryTemplateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome do template é obrigatório')
    }

    if (!data.type || !['INCOME', 'EXPENSE', 'TRANSFER'].includes(data.type)) {
      errors.push('Tipo do template deve ser INCOME, EXPENSE ou TRANSFER')
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

  // Filtrar templates por tipo
  filterTemplatesByType(templates: CategoryTemplate[], type: 'INCOME' | 'EXPENSE' | 'TRANSFER'): CategoryTemplate[] {
    return templates.filter(template => template.type === type)
  }

  // Separar templates padrão e do sistema
  separateTemplates(templates: CategoryTemplate[]): {
    default: CategoryTemplate[]
    system: CategoryTemplate[]
    custom: CategoryTemplate[]
  } {
    return {
      default: templates.filter(template => template.isDefault),
      system: templates.filter(template => template.isSystem),
      custom: templates.filter(template => !template.isSystem)
    }
  }

  // Obter templates agrupados por tipo
  groupTemplatesByType(templates: CategoryTemplate[]): {
    INCOME: CategoryTemplate[]
    EXPENSE: CategoryTemplate[]
    TRANSFER: CategoryTemplate[]
  } {
    return {
      INCOME: templates.filter(t => t.type === 'INCOME'),
      EXPENSE: templates.filter(t => t.type === 'EXPENSE'),
      TRANSFER: templates.filter(t => t.type === 'TRANSFER')
    }
  }

  // Obter cor baseada no tipo do template
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

  // Obter template padrão por tipo
  getDefaultTemplateData(type: 'INCOME' | 'EXPENSE' | 'TRANSFER'): Partial<CreateCategoryTemplateData> {
    return {
      type,
      color: this.getTypeColor(type),
      icon: this.getDefaultIcon(type),
      isDefault: false,
      isSystem: true,
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
}

// Instância singleton do serviço
export const categoryTemplatesService = new CategoryTemplatesService()

// Exportar tipos para uso em outros arquivos
export type {
  CategoryTemplate,
  CreateCategoryTemplateData as CreateCategoryTemplateDataType,
  UpdateCategoryTemplateData as UpdateCategoryTemplateDataType,
  CategoryTemplatesResponse as CategoryTemplatesResponseType,
  TemplateUsageStats as TemplateUsageStatsType
}
export { CategoryTemplatesService }
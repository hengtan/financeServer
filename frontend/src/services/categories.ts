// Categories Service - Gerenciamento de categorias
import { apiService, ApiResponse } from './api'

// Interface para uma categoria
export interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  description?: string
  color: string
  icon: string
  isSystem: boolean
  userId?: string
  createdAt: string
  updatedAt: string
}

// Interface para criação/atualização de categoria
export interface CreateCategoryData {
  name: string
  type: 'INCOME' | 'EXPENSE'
  description?: string
  color?: string
  icon?: string
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

// Interface para resumo de categorias
export interface CategoriesSummary {
  total: number
  system: number
  user: number
  byType: {
    income: number
    expense: number
  }
}

// Interface para uso de categoria
export interface CategoryUsage {
  categoryId: string
  categoryName: string
  type: 'INCOME' | 'EXPENSE'
  transactionCount: number
  totalAmount: number
  averageAmount: number
  lastUsed: string
}

class CategoriesService {
  private readonly basePath = '/categories'

  // Listar todas as categorias (sistema + usuário)
  async getCategories(type?: 'INCOME' | 'EXPENSE'): Promise<ApiResponse<{ categories: Category[]; summary: CategoriesSummary }>> {
    const params = type ? { type } : {}
    return apiService.get<{ categories: Category[]; summary: CategoriesSummary }>(this.basePath, { params })
  }

  // Buscar categoria específica por ID
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return apiService.get<Category>(`${this.basePath}/${id}`)
  }

  // Criar nova categoria personalizada
  async createCategory(data: CreateCategoryData): Promise<ApiResponse<Category>> {
    return apiService.post<Category>(this.basePath, data)
  }

  // Atualizar categoria personalizada
  async updateCategory(id: string, data: UpdateCategoryData): Promise<ApiResponse<Category>> {
    return apiService.put<Category>(`${this.basePath}/${id}`, data)
  }

  // Deletar categoria personalizada
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.basePath}/${id}`)
  }

  // Listar apenas categorias do sistema
  async getSystemCategories(type?: 'INCOME' | 'EXPENSE'): Promise<ApiResponse<Category[]>> {
    const params = type ? { type } : {}
    return apiService.get<Category[]>(`${this.basePath}/system`, { params })
  }

  // Obter estatísticas de uso das categorias
  async getCategoryUsage(startDate?: string, endDate?: string): Promise<ApiResponse<{ period: { startDate: string; endDate: string }; usage: CategoryUsage[] }>> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    return apiService.get<{ period: { startDate: string; endDate: string }; usage: CategoryUsage[] }>(`${this.basePath}/usage`, { params })
  }

  // Testar conectividade da API
  async testConnection(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return apiService.get<{ message: string; timestamp: string }>(`${this.basePath}/test`)
  }

  // Métodos auxiliares

  // Validar dados da categoria
  validateCategoryData(data: CreateCategoryData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome da categoria é obrigatório')
    }

    if (!data.type || !['INCOME', 'EXPENSE'].includes(data.type)) {
      errors.push('Tipo da categoria deve ser INCOME ou EXPENSE')
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

  // Obter cores predefinidas para categorias
  getPredefinedColors(): { name: string; value: string }[] {
    return [
      { name: 'Azul', value: '#3B82F6' },
      { name: 'Verde', value: '#10B981' },
      { name: 'Vermelho', value: '#EF4444' },
      { name: 'Amarelo', value: '#F59E0B' },
      { name: 'Roxo', value: '#8B5CF6' },
      { name: 'Rosa', value: '#EC4899' },
      { name: 'Indigo', value: '#6366F1' },
      { name: 'Laranja', value: '#F97316' },
      { name: 'Teal', value: '#14B8A6' },
      { name: 'Cinza', value: '#6B7280' }
    ]
  }

  // Obter ícones predefinidos para categorias
  getPredefinedIcons(): { category: string; icon: string; type: 'INCOME' | 'EXPENSE' }[] {
    return [
      // Receitas
      { category: 'Salário', icon: '💰', type: 'INCOME' },
      { category: 'Freelance', icon: '💼', type: 'INCOME' },
      { category: 'Investimentos', icon: '📈', type: 'INCOME' },
      { category: 'Vendas', icon: '💵', type: 'INCOME' },
      { category: 'Presentes', icon: '🎁', type: 'INCOME' },
      { category: 'Outros', icon: '💳', type: 'INCOME' },

      // Despesas
      { category: 'Alimentação', icon: '🍽️', type: 'EXPENSE' },
      { category: 'Transporte', icon: '🚗', type: 'EXPENSE' },
      { category: 'Moradia', icon: '🏠', type: 'EXPENSE' },
      { category: 'Saúde', icon: '🏥', type: 'EXPENSE' },
      { category: 'Educação', icon: '📚', type: 'EXPENSE' },
      { category: 'Lazer', icon: '🎬', type: 'EXPENSE' },
      { category: 'Compras', icon: '🛒', type: 'EXPENSE' },
      { category: 'Contas', icon: '📄', type: 'EXPENSE' },
      { category: 'Viagem', icon: '✈️', type: 'EXPENSE' },
      { category: 'Pets', icon: '🐕', type: 'EXPENSE' },
      { category: 'Vestuário', icon: '👕', type: 'EXPENSE' },
      { category: 'Tecnologia', icon: '💻', type: 'EXPENSE' },
      { category: 'Outros', icon: '📂', type: 'EXPENSE' }
    ]
  }

  // Obter categoria padrão por tipo
  getDefaultCategory(type: 'INCOME' | 'EXPENSE'): Partial<CreateCategoryData> {
    return {
      type,
      color: type === 'INCOME' ? '#10B981' : '#EF4444',
      icon: type === 'INCOME' ? '💰' : '📂'
    }
  }

  // Filtrar categorias por tipo
  filterCategoriesByType(categories: Category[], type: 'INCOME' | 'EXPENSE'): Category[] {
    return categories.filter(category => category.type === type)
  }

  // Separar categorias do sistema e do usuário
  separateCategories(categories: Category[]): { system: Category[]; user: Category[] } {
    return {
      system: categories.filter(category => category.isSystem),
      user: categories.filter(category => !category.isSystem)
    }
  }

  // Formatir valor monetário para exibição
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

  // Obter cor baseada no tipo da categoria
  getTypeColor(type: 'INCOME' | 'EXPENSE'): string {
    return type === 'INCOME' ? '#10B981' : '#EF4444'
  }

  // Obter texto de descrição baseado no tipo
  getTypeDescription(type: 'INCOME' | 'EXPENSE'): string {
    return type === 'INCOME' ? 'Receita' : 'Despesa'
  }
}

// Instância singleton do serviço
export const categoriesService = new CategoriesService()

// Exportar tipos para uso em outros arquivos
export type {
  Category,
  CreateCategoryData as CreateCategoryDataType,
  UpdateCategoryData as UpdateCategoryDataType,
  CategoriesSummary as CategoriesSummaryType,
  CategoryUsage as CategoryUsageType
}
export { CategoriesService }
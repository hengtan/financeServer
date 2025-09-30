import { UserCategory } from '../../entities/UserCategory'
import { CategoryType, CategoryStatus } from '../../entities/Category'

export interface IUserCategoryRepository {
  findById(id: string): Promise<UserCategory | null>

  findByUserId(userId: string, filters?: {
    type?: CategoryType
    status?: CategoryStatus
    isActive?: boolean
    isDefault?: boolean
    isCustom?: boolean
    categoryTemplateId?: string
    parentCategoryId?: string
    searchTerm?: string
    sortBy?: 'name' | 'createdAt' | 'sortOrder'
    sortOrder?: 'ASC' | 'DESC'
    limit?: number
    offset?: number
  }): Promise<{
    categories: UserCategory[]
    total: number
  }>

  findByUserIdAndType(userId: string, type: CategoryType, options?: {
    isActive?: boolean
    isDefault?: boolean
    sortBy?: 'name' | 'sortOrder'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<UserCategory[]>

  findByUserIdAndName(userId: string, name: string): Promise<UserCategory | null>

  findActiveByUserId(userId: string, options?: {
    type?: CategoryType
    isDefault?: boolean
    sortBy?: 'name' | 'sortOrder'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<UserCategory[]>

  findDefaultByUserId(userId: string, type?: CategoryType): Promise<UserCategory[]>

  findCustomByUserId(userId: string, options?: {
    type?: CategoryType
    isActive?: boolean
    sortBy?: 'name' | 'createdAt'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<UserCategory[]>

  findByTemplateId(categoryTemplateId: string, options?: {
    userId?: string
    isActive?: boolean
    limit?: number
  }): Promise<UserCategory[]>

  findChildCategories(parentCategoryId: string, userId: string): Promise<UserCategory[]>

  create(category: UserCategory): Promise<UserCategory>

  update(category: UserCategory): Promise<UserCategory>

  delete(id: string): Promise<void>

  softDelete(id: string): Promise<void>

  existsByUserIdAndName(userId: string, name: string, excludeId?: string): Promise<boolean>

  bulkCreate(categories: UserCategory[]): Promise<UserCategory[]>

  bulkUpdate(categories: UserCategory[]): Promise<UserCategory[]>

  // Analytics methods
  countByUserId(userId: string, filters?: {
    type?: CategoryType
    status?: CategoryStatus
    isActive?: boolean
    isCustom?: boolean
  }): Promise<number>

  getUsageStats(userId: string, categoryId: string): Promise<{
    transactionCount: number
    budgetCount: number
    lastUsed?: Date
  }>

  // Template-based operations
  createFromTemplate(userId: string, templateId: string, customizations?: {
    name?: string
    description?: string
    color?: string
    icon?: string
    sortOrder?: number
    isDefault?: boolean
  }): Promise<UserCategory>

  syncWithTemplate(userCategoryId: string, templateId: string): Promise<UserCategory>
}
import { Category } from '../../entities/Category'

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>
  findByUserId(userId: string, filters?: {
    type?: string
    status?: string
    isDefault?: boolean
    parentCategoryId?: string
    limit?: number
    offset?: number
  }): Promise<{
    categories: Category[]
    total: number
  }>
  create(category: Category): Promise<Category>
  update(category: Category): Promise<Category>
  delete(id: string): Promise<void>
  existsByUserIdAndName(userId: string, name: string): Promise<boolean>
  findDefaultCategories(userId: string): Promise<Category[]>
}
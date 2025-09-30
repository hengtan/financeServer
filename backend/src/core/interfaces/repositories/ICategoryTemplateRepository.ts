import { CategoryTemplate } from '../../entities/CategoryTemplate'
import { CategoryType } from '../../entities/Category'

export interface ICategoryTemplateRepository {
  findById(id: string): Promise<CategoryTemplate | null>

  findAll(filters?: {
    type?: CategoryType
    isDefault?: boolean
    isSystem?: boolean
    sortOrder?: 'ASC' | 'DESC'
    limit?: number
    offset?: number
  }): Promise<{
    templates: CategoryTemplate[]
    total: number
  }>

  findByType(type: CategoryType, options?: {
    isDefault?: boolean
    isSystem?: boolean
    sortOrder?: 'ASC' | 'DESC'
    limit?: number
  }): Promise<CategoryTemplate[]>

  findDefault(options?: {
    type?: CategoryType
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<CategoryTemplate[]>

  create(template: CategoryTemplate): Promise<CategoryTemplate>

  update(template: CategoryTemplate): Promise<CategoryTemplate>

  delete(id: string): Promise<void>

  existsByNameAndType(name: string, type: CategoryType): Promise<boolean>

  bulkCreate(templates: CategoryTemplate[]): Promise<CategoryTemplate[]>
}
import { Service, Inject } from 'typedi'
import { ICategoryTemplateRepository } from '../core/interfaces/repositories/ICategoryTemplateRepository'
import { CategoryTemplate } from '../core/entities/CategoryTemplate'
import { CategoryType } from '../core/entities/Category'
import { RedisService } from '../infrastructure/cache/RedisService'

@Service()
export class CategoryTemplateService {
  constructor(
    @Inject('ICategoryTemplateRepository') private templateRepository: ICategoryTemplateRepository,
    private redisService: RedisService
  ) {}

  async createTemplate(data: {
    name: string
    description?: string
    type: CategoryType
    color?: string
    icon?: string
    isDefault?: boolean
    isSystem?: boolean
    sortOrder?: number
    tags?: string[]
    metadata?: Record<string, any>
  }): Promise<CategoryTemplate> {
    // Validate unique name and type combination
    const existsAlready = await this.templateRepository.existsByNameAndType(data.name, data.type)
    if (existsAlready) {
      throw new Error(`Category template with name "${data.name}" and type "${data.type}" already exists`)
    }

    const template = new CategoryTemplate({
      name: data.name,
      description: data.description,
      type: data.type,
      color: data.color,
      icon: data.icon,
      isDefault: data.isDefault ?? false,
      isSystem: data.isSystem ?? false,
      sortOrder: data.sortOrder,
      tags: data.tags || [],
      metadata: data.metadata
    })

    const created = await this.templateRepository.create(template)

    // Clear relevant caches
    await this.clearCache()

    return created
  }

  async getTemplateById(id: string): Promise<CategoryTemplate | null> {
    const cacheKey = `category-template:${id}`

    // Try cache first
    const cached = await this.redisService.get<CategoryTemplate>(cacheKey)
    if (cached && cached.id) {
      return cached
    }

    const template = await this.templateRepository.findById(id)

    if (template) {
      // Cache for 1 hour
      await this.redisService.set(cacheKey, template, 3600)
    }

    return template
  }

  async getAllTemplates(filters?: {
    type?: CategoryType
    isDefault?: boolean
    isSystem?: boolean
    sortOrder?: 'ASC' | 'DESC'
    limit?: number
    offset?: number
  }): Promise<{
    templates: CategoryTemplate[]
    total: number
  }> {
    const cacheKey = `category-templates:${JSON.stringify(filters || {})}`

    // Try cache first
    const cached = await this.redisService.get<{ templates: CategoryTemplate[], total: number }>(cacheKey)
    if (cached && cached.templates) {
      return cached
    }

    const result = await this.templateRepository.findAll(filters)

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, result, 1800)

    return result
  }

  async getTemplatesByType(type: CategoryType, options?: {
    isDefault?: boolean
    isSystem?: boolean
    sortOrder?: 'ASC' | 'DESC'
    limit?: number
  }): Promise<CategoryTemplate[]> {
    const cacheKey = `category-templates:type:${type}:${JSON.stringify(options || {})}`

    // Try cache first
    const cached = await this.redisService.get<CategoryTemplate[]>(cacheKey)
    if (cached && Array.isArray(cached)) {
      return cached
    }

    const templates = await this.templateRepository.findByType(type, options)

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, templates, 1800)

    return templates
  }

  async getDefaultTemplates(options?: {
    type?: CategoryType
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<CategoryTemplate[]> {
    const cacheKey = `category-templates:default:${JSON.stringify(options || {})}`

    // Try cache first
    const cached = await this.redisService.get<CategoryTemplate[]>(cacheKey)
    if (cached && Array.isArray(cached)) {
      return cached
    }

    const templates = await this.templateRepository.findDefault(options)

    // Cache for 1 hour (default templates don't change often)
    await this.redisService.set(cacheKey, templates, 3600)

    return templates
  }

  async updateTemplate(id: string, data: Partial<{
    description: string
    color: string
    icon: string
    isDefault: boolean
    sortOrder: number
    tags: string[]
    metadata: Record<string, any>
  }>): Promise<CategoryTemplate> {
    const existing = await this.templateRepository.findById(id)
    if (!existing) {
      throw new Error('Category template not found')
    }

    // System templates can only be updated by system
    if (existing.isSystem && !data.hasOwnProperty('isSystem')) {
      throw new Error('System category templates cannot be modified')
    }

    const updated = Object.assign(existing, {
      ...data,
      updatedAt: new Date()
    })

    const result = await this.templateRepository.update(updated)

    // Clear caches
    await this.clearCache()
    await this.redisService.del(`category-template:${id}`)

    return result
  }

  async deleteTemplate(id: string): Promise<void> {
    const existing = await this.templateRepository.findById(id)
    if (!existing) {
      throw new Error('Category template not found')
    }

    if (existing.isSystem) {
      throw new Error('System category templates cannot be deleted')
    }

    await this.templateRepository.delete(id)

    // Clear caches
    await this.clearCache()
    await this.redisService.del(`category-template:${id}`)
  }

  async bulkCreateTemplates(templates: {
    name: string
    description?: string
    type: CategoryType
    color?: string
    icon?: string
    isDefault?: boolean
    isSystem?: boolean
    sortOrder?: number
    tags?: string[]
    metadata?: Record<string, any>
  }[]): Promise<CategoryTemplate[]> {
    const templateEntities = templates.map(data => new CategoryTemplate({
      name: data.name,
      description: data.description,
      type: data.type,
      color: data.color,
      icon: data.icon,
      isDefault: data.isDefault ?? false,
      isSystem: data.isSystem ?? false,
      sortOrder: data.sortOrder,
      tags: data.tags || [],
      metadata: data.metadata
    }))

    const created = await this.templateRepository.bulkCreate(templateEntities)

    // Clear caches
    await this.clearCache()

    return created
  }

  async getUsageStats(templateId: string): Promise<{
    userCategoryCount: number
    activeUserCategoryCount: number
    mostUsedBy?: {
      userId: string
      categoryName: string
      usageCount: number
    }
  }> {
    const cacheKey = `template-usage-stats:${templateId}`

    const cached = await this.redisService.get(cacheKey)
    if (cached && typeof cached === 'object') {
      return cached as any
    }

    // This would need to be implemented in the UserCategoryRepository
    // For now, return a placeholder
    const stats = {
      userCategoryCount: 0,
      activeUserCategoryCount: 0,
      mostUsedBy: undefined
    }

    // Cache for 1 hour
    await this.redisService.set(cacheKey, stats, 3600)

    return stats
  }

  async searchTemplates(query: string, filters?: {
    type?: CategoryType
    isDefault?: boolean
    isSystem?: boolean
    limit?: number
  }): Promise<CategoryTemplate[]> {
    // For now, we'll implement a simple search
    // In a real implementation, you might want to use full-text search
    const allTemplates = await this.templateRepository.findAll({
      type: filters?.type,
      isDefault: filters?.isDefault,
      isSystem: filters?.isSystem,
      limit: filters?.limit || 50
    })

    const filtered = allTemplates.templates.filter(template =>
      template.name.toLowerCase().includes(query.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(query.toLowerCase())) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    )

    return filtered
  }

  private async clearCache(): Promise<void> {
    const patterns = [
      'category-templates:*',
      'template-usage-stats:*'
    ]

    for (const pattern of patterns) {
      await this.redisService.invalidatePattern(pattern)
    }
  }
}
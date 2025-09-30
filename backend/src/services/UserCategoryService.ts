import { Service, Inject } from 'typedi'
import { IUserCategoryRepository } from '../core/interfaces/repositories/IUserCategoryRepository'
import { ICategoryTemplateRepository } from '../core/interfaces/repositories/ICategoryTemplateRepository'
import { UserCategory } from '../core/entities/UserCategory'
import { CategoryType, CategoryStatus } from '../core/entities/Category'
import { RedisService } from '../infrastructure/cache/RedisService'

@Service()
export class UserCategoryService {
  constructor(
    @Inject('IUserCategoryRepository') private userCategoryRepository: IUserCategoryRepository,
    @Inject('ICategoryTemplateRepository') private templateRepository: ICategoryTemplateRepository,
    private redisService: RedisService
  ) {}

  async createUserCategory(data: {
    userId: string
    name: string
    description?: string
    type: CategoryType
    color?: string
    icon?: string
    parentCategoryId?: string
    isDefault?: boolean
    sortOrder?: number
    tags?: string[]
    metadata?: Record<string, any>
  }): Promise<UserCategory> {
    // Validate unique name per user
    const existsAlready = await this.userCategoryRepository.existsByUserIdAndName(data.userId, data.name)
    if (existsAlready) {
      throw new Error(`Category with name "${data.name}" already exists for this user`)
    }

    // Validate parent category belongs to same user
    if (data.parentCategoryId) {
      const parentCategory = await this.userCategoryRepository.findById(data.parentCategoryId)
      if (!parentCategory || parentCategory.userId !== data.userId) {
        throw new Error('Parent category not found or does not belong to user')
      }
    }

    const userCategory = new UserCategory({
      userId: data.userId,
      categoryTemplateId: undefined, // Custom category, not based on template
      name: data.name,
      description: data.description,
      type: data.type,
      color: data.color,
      icon: data.icon,
      parentCategoryId: data.parentCategoryId,
      status: CategoryStatus.ACTIVE,
      isActive: true,
      isCustom: true, // User-created category
      isDefault: data.isDefault ?? false,
      sortOrder: data.sortOrder,
      tags: data.tags || [],
      metadata: data.metadata
    })

    const created = await this.userCategoryRepository.create(userCategory)

    // Clear user cache
    await this.clearUserCache(data.userId)

    return created
  }

  async createFromTemplate(
    userId: string,
    templateId: string,
    customizations?: {
      name?: string
      description?: string
      color?: string
      icon?: string
      sortOrder?: number
      isDefault?: boolean
    }
  ): Promise<UserCategory> {
    // Validate template exists
    const template = await this.templateRepository.findById(templateId)
    if (!template) {
      throw new Error('Category template not found')
    }

    const categoryName = customizations?.name || template.name

    // Validate unique name per user
    const existsAlready = await this.userCategoryRepository.existsByUserIdAndName(userId, categoryName)
    if (existsAlready) {
      throw new Error(`Category with name "${categoryName}" already exists for this user`)
    }

    const created = await this.userCategoryRepository.createFromTemplate(userId, templateId, customizations)

    // Clear user cache
    await this.clearUserCache(userId)

    return created
  }

  async getUserCategoryById(id: string, userId?: string): Promise<UserCategory | null> {
    const cacheKey = `user-category:${id}`

    // Try cache first
    const cached = await this.redisService.get<UserCategory>(cacheKey)
    if (cached && cached.id) {
      // If userId is provided, validate ownership
      if (userId && cached.userId !== userId) {
        return null
      }
      return cached
    }

    const category = await this.userCategoryRepository.findById(id)

    // If userId is provided, validate ownership
    if (category && userId && category.userId !== userId) {
      return null
    }

    if (category) {
      // Cache for 30 minutes
      await this.redisService.set(cacheKey, category, 1800)
    }

    return category
  }

  async getUserCategories(
    userId: string,
    filters?: {
      type?: CategoryType
      status?: CategoryStatus
      isActive?: boolean
      isDefault?: boolean
      isCustom?: boolean
      parentCategoryId?: string
      searchTerm?: string
      sortBy?: 'name' | 'createdAt' | 'sortOrder'
      sortOrder?: 'ASC' | 'DESC'
      limit?: number
      offset?: number
    }
  ): Promise<{
    categories: UserCategory[]
    total: number
  }> {
    const cacheKey = `user-categories:${userId}:${JSON.stringify(filters || {})}`

    // Try cache first
    const cached = await this.redisService.get<{ categories: UserCategory[], total: number }>(cacheKey)
    if (cached && cached.categories) {
      return cached
    }

    const result = await this.userCategoryRepository.findByUserId(userId, filters)

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, result, 300)

    return result
  }

  async getActiveUserCategories(
    userId: string,
    type?: CategoryType
  ): Promise<UserCategory[]> {
    const cacheKey = `user-categories:active:${userId}:${type || 'all'}`

    // Try cache first
    const cached = await this.redisService.get<UserCategory[]>(cacheKey)
    if (cached && Array.isArray(cached)) {
      return cached
    }

    const categories = await this.userCategoryRepository.findActiveByUserId(userId, {
      type,
      sortBy: 'sortOrder',
      sortOrder: 'ASC'
    })

    // Cache for 10 minutes
    await this.redisService.set(cacheKey, categories, 600)

    return categories
  }

  async getUserCategoriesByType(
    userId: string,
    type: CategoryType,
    options?: {
      isActive?: boolean
      isDefault?: boolean
      sortBy?: 'name' | 'sortOrder'
      sortOrder?: 'ASC' | 'DESC'
    }
  ): Promise<UserCategory[]> {
    const cacheKey = `user-categories:type:${userId}:${type}:${JSON.stringify(options || {})}`

    // Try cache first
    const cached = await this.redisService.get<UserCategory[]>(cacheKey)
    if (cached && Array.isArray(cached)) {
      return cached
    }

    const categories = await this.userCategoryRepository.findByUserIdAndType(userId, type, options)

    // Cache for 10 minutes
    await this.redisService.set(cacheKey, categories, 600)

    return categories
  }

  async updateUserCategory(
    id: string,
    userId: string,
    data: Partial<{
      name: string
      description: string
      color: string
      icon: string
      sortOrder: number
      isDefault: boolean
      tags: string[]
      metadata: Record<string, any>
    }>
  ): Promise<UserCategory> {
    const existing = await this.userCategoryRepository.findById(id)
    if (!existing || existing.userId !== userId) {
      throw new Error('User category not found or does not belong to user')
    }

    // Validate unique name if changing name
    if (data.name && data.name !== existing.name) {
      const nameExists = await this.userCategoryRepository.existsByUserIdAndName(userId, data.name, id)
      if (nameExists) {
        throw new Error(`Category with name "${data.name}" already exists for this user`)
      }
    }

    const updated = Object.assign(existing, {
      ...data,
      updatedAt: new Date()
    })

    const result = await this.userCategoryRepository.update(updated)

    // Clear caches
    await this.clearUserCache(userId)
    await this.redisService.del(`user-category:${id}`)

    return result
  }

  async deleteUserCategory(id: string, userId: string): Promise<void> {
    const existing = await this.userCategoryRepository.findById(id)
    if (!existing || existing.userId !== userId) {
      throw new Error('User category not found or does not belong to user')
    }

    // Check if category is being used in transactions or budgets
    const usage = await this.userCategoryRepository.getUsageStats(userId, id)
    if (usage.transactionCount > 0 || usage.budgetCount > 0) {
      throw new Error('Cannot delete category that is being used in transactions or budgets. Archive it instead.')
    }

    await this.userCategoryRepository.delete(id)

    // Clear caches
    await this.clearUserCache(userId)
    await this.redisService.del(`user-category:${id}`)
  }

  async archiveUserCategory(id: string, userId: string): Promise<UserCategory> {
    const existing = await this.userCategoryRepository.findById(id)
    if (!existing || existing.userId !== userId) {
      throw new Error('User category not found or does not belong to user')
    }

    existing.archive()
    const result = await this.userCategoryRepository.update(existing)

    // Clear caches
    await this.clearUserCache(userId)
    await this.redisService.del(`user-category:${id}`)

    return result
  }

  async activateUserCategory(id: string, userId: string): Promise<UserCategory> {
    const existing = await this.userCategoryRepository.findById(id)
    if (!existing || existing.userId !== userId) {
      throw new Error('User category not found or does not belong to user')
    }

    existing.activate()
    const result = await this.userCategoryRepository.update(existing)

    // Clear caches
    await this.clearUserCache(userId)
    await this.redisService.del(`user-category:${id}`)

    return result
  }

  async setupDefaultCategoriesForUser(userId: string): Promise<UserCategory[]> {
    // Get default templates
    const defaultTemplates = await this.templateRepository.findDefault({
      sortOrder: 'ASC'
    })

    if (defaultTemplates.length === 0) {
      throw new Error('No default category templates found')
    }

    // Create user categories from templates
    const userCategories: UserCategory[] = []

    for (const template of defaultTemplates) {
      try {
        // Check if user already has this category
        const existing = await this.userCategoryRepository.findByUserIdAndName(userId, template.name)
        if (!existing) {
          const userCategory = await this.userCategoryRepository.createFromTemplate(userId, template.id, {
            isDefault: true
          })
          userCategories.push(userCategory)
        }
      } catch (error) {
        // Log error but continue with other templates
        console.error(`Failed to create category ${template.name} for user ${userId}:`, error)
      }
    }

    // Clear user cache
    await this.clearUserCache(userId)

    return userCategories
  }

  async syncWithTemplate(userCategoryId: string, userId: string): Promise<UserCategory> {
    const userCategory = await this.userCategoryRepository.findById(userCategoryId)
    if (!userCategory || userCategory.userId !== userId) {
      throw new Error('User category not found or does not belong to user')
    }

    if (!userCategory.categoryTemplateId) {
      throw new Error('User category is not based on a template')
    }

    const updated = await this.userCategoryRepository.syncWithTemplate(userCategoryId, userCategory.categoryTemplateId)

    // Clear caches
    await this.clearUserCache(userId)
    await this.redisService.del(`user-category:${userCategoryId}`)

    return updated
  }

  async getCategoryUsageStats(categoryId: string, userId: string): Promise<{
    transactionCount: number
    budgetCount: number
    lastUsed?: Date
  }> {
    const category = await this.userCategoryRepository.findById(categoryId)
    if (!category || category.userId !== userId) {
      throw new Error('User category not found or does not belong to user')
    }

    const cacheKey = `category-usage:${categoryId}`

    const cached = await this.redisService.get(cacheKey)
    if (cached && typeof cached === 'object') {
      return cached as any
    }

    const stats = await this.userCategoryRepository.getUsageStats(userId, categoryId)

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, stats, 1800)

    return stats
  }

  async getUserCategoryAnalytics(userId: string): Promise<{
    totalCategories: number
    activeCategoriesCount: number
    customCategoriesCount: number
    templateBasedCount: number
    categoriesByType: Record<CategoryType, number>
    mostUsedCategories: Array<{
      categoryId: string
      categoryName: string
      transactionCount: number
      lastUsed?: Date
    }>
  }> {
    const cacheKey = `user-category-analytics:${userId}`

    const cached = await this.redisService.get(cacheKey)
    if (cached && typeof cached === 'object') {
      return cached as any
    }

    const [allCategories, categoryUsage] = await Promise.all([
      this.userCategoryRepository.findByUserId(userId),
      // We would implement this method to get usage statistics
      Promise.resolve([]) // Placeholder
    ])

    const categoriesByType: Record<CategoryType, number> = {
      [CategoryType.INCOME]: 0,
      [CategoryType.EXPENSE]: 0,
      [CategoryType.TRANSFER]: 0
    }

    let activeCategoriesCount = 0
    let customCategoriesCount = 0
    let templateBasedCount = 0

    allCategories.categories.forEach(category => {
      categoriesByType[category.type]++

      if (category.isActive) activeCategoriesCount++
      if (category.isCustom) customCategoriesCount++
      if (category.categoryTemplateId) templateBasedCount++
    })

    const analytics = {
      totalCategories: allCategories.total,
      activeCategoriesCount,
      customCategoriesCount,
      templateBasedCount,
      categoriesByType,
      mostUsedCategories: [] // Would be populated with usage data
    }

    // Cache for 1 hour
    await this.redisService.set(cacheKey, analytics, 3600)

    return analytics
  }

  private async clearUserCache(userId: string): Promise<void> {
    const patterns = [
      `user-categories:${userId}:*`,
      `user-categories:active:${userId}:*`,
      `user-categories:type:${userId}:*`,
      `user-category-analytics:${userId}`,
      `category-usage:*` // Could be more specific if needed
    ]

    for (const pattern of patterns) {
      await this.redisService.invalidatePattern(pattern)
    }
  }
}
import { PrismaClient } from '@prisma/client'
import { IUserCategoryRepository } from '../../core/interfaces/repositories/IUserCategoryRepository'
import { ICategoryTemplateRepository } from '../../core/interfaces/repositories/ICategoryTemplateRepository'
import { UserCategory } from '../../core/entities/UserCategory'
import { CategoryType, CategoryStatus } from '../../core/entities/Category'

export class PrismaUserCategoryRepository implements IUserCategoryRepository {
  constructor(
    private prisma: PrismaClient,
    private categoryTemplateRepository: ICategoryTemplateRepository
  ) {}

  async findById(id: string): Promise<UserCategory | null> {
    const category = await this.prisma.userCategory.findUnique({
      where: { id },
      include: {
        categoryTemplate: true
      }
    })

    return category ? this.toDomain(category) : null
  }

  async findByUserId(userId: string, filters?: {
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
  }> {
    const where: any = { userId }

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.isDefault !== undefined) {
      where.isDefault = filters.isDefault
    }

    if (filters?.isCustom !== undefined) {
      where.isCustom = filters.isCustom
    }

    if (filters?.categoryTemplateId) {
      where.categoryTemplateId = filters.categoryTemplateId
    }

    if (filters?.parentCategoryId) {
      where.parentCategoryId = filters.parentCategoryId
    }

    if (filters?.searchTerm) {
      where.name = {
        contains: filters.searchTerm,
        mode: 'insensitive'
      }
    }

    const orderBy: any = {}
    const sortBy = filters?.sortBy || 'name'
    const sortOrder = (filters?.sortOrder || 'ASC').toLowerCase()
    orderBy[sortBy] = sortOrder

    const [categories, total] = await Promise.all([
      this.prisma.userCategory.findMany({
        where,
        orderBy,
        take: filters?.limit,
        skip: filters?.offset,
        include: {
          categoryTemplate: true
        }
      }),
      this.prisma.userCategory.count({ where })
    ])

    return {
      categories: categories.map(category => this.toDomain(category)),
      total
    }
  }

  async findByUserIdAndType(userId: string, type: CategoryType, options?: {
    isActive?: boolean
    isDefault?: boolean
    sortBy?: 'name' | 'sortOrder'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<UserCategory[]> {
    const where: any = { userId, type }

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive
    }

    if (options?.isDefault !== undefined) {
      where.isDefault = options.isDefault
    }

    const orderBy: any = {}
    const sortBy = options?.sortBy || 'name'
    const sortOrder = (options?.sortOrder || 'ASC').toLowerCase()
    orderBy[sortBy] = sortOrder

    const categories = await this.prisma.userCategory.findMany({
      where,
      orderBy,
      include: {
        categoryTemplate: true
      }
    })

    return categories.map(category => this.toDomain(category))
  }

  async findByUserIdAndName(userId: string, name: string): Promise<UserCategory | null> {
    const category = await this.prisma.userCategory.findFirst({
      where: { userId, name },
      include: {
        categoryTemplate: true
      }
    })

    return category ? this.toDomain(category) : null
  }

  async findActiveByUserId(userId: string, options?: {
    type?: CategoryType
    isDefault?: boolean
    sortBy?: 'name' | 'sortOrder'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<UserCategory[]> {
    const where: any = { userId, isActive: true }

    if (options?.type) {
      where.type = options.type
    }

    if (options?.isDefault !== undefined) {
      where.isDefault = options.isDefault
    }

    const orderBy: any = {}
    const sortBy = options?.sortBy || 'name'
    const sortOrder = (options?.sortOrder || 'ASC').toLowerCase()
    orderBy[sortBy] = sortOrder

    const categories = await this.prisma.userCategory.findMany({
      where,
      orderBy,
      include: {
        categoryTemplate: true
      }
    })

    return categories.map(category => this.toDomain(category))
  }

  async findDefaultByUserId(userId: string, type?: CategoryType): Promise<UserCategory[]> {
    const where: any = { userId, isDefault: true }

    if (type) {
      where.type = type
    }

    const categories = await this.prisma.userCategory.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        categoryTemplate: true
      }
    })

    return categories.map(category => this.toDomain(category))
  }

  async findCustomByUserId(userId: string, options?: {
    type?: CategoryType
    isActive?: boolean
    sortBy?: 'name' | 'createdAt'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<UserCategory[]> {
    const where: any = { userId, isCustom: true }

    if (options?.type) {
      where.type = options.type
    }

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive
    }

    const orderBy: any = {}
    const sortBy = options?.sortBy || 'name'
    const sortOrder = (options?.sortOrder || 'ASC').toLowerCase()
    orderBy[sortBy] = sortOrder

    const categories = await this.prisma.userCategory.findMany({
      where,
      orderBy,
      include: {
        categoryTemplate: true
      }
    })

    return categories.map(category => this.toDomain(category))
  }

  async findByTemplateId(categoryTemplateId: string, options?: {
    userId?: string
    isActive?: boolean
    limit?: number
  }): Promise<UserCategory[]> {
    const where: any = { categoryTemplateId }

    if (options?.userId) {
      where.userId = options.userId
    }

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive
    }

    const categories = await this.prisma.userCategory.findMany({
      where,
      take: options?.limit,
      include: {
        categoryTemplate: true
      }
    })

    return categories.map(category => this.toDomain(category))
  }

  async findChildCategories(parentCategoryId: string, userId: string): Promise<UserCategory[]> {
    const categories = await this.prisma.userCategory.findMany({
      where: { parentCategoryId, userId },
      orderBy: { sortOrder: 'asc' },
      include: {
        categoryTemplate: true
      }
    })

    return categories.map(category => this.toDomain(category))
  }

  async create(category: UserCategory): Promise<UserCategory> {
    const created = await this.prisma.userCategory.create({
      data: this.toPersistence(category),
      include: {
        categoryTemplate: true
      }
    })

    return this.toDomain(created)
  }

  async update(category: UserCategory): Promise<UserCategory> {
    const updated = await this.prisma.userCategory.update({
      where: { id: category.id },
      data: {
        ...this.toPersistence(category),
        updatedAt: new Date()
      },
      include: {
        categoryTemplate: true
      }
    })

    return this.toDomain(updated)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userCategory.delete({
      where: { id }
    })
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.userCategory.update({
      where: { id },
      data: {
        status: CategoryStatus.ARCHIVED,
        isActive: false,
        updatedAt: new Date()
      }
    })
  }

  async existsByUserIdAndName(userId: string, name: string, excludeId?: string): Promise<boolean> {
    const where: any = { userId, name }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const count = await this.prisma.userCategory.count({ where })
    return count > 0
  }

  async bulkCreate(categories: UserCategory[]): Promise<UserCategory[]> {
    const data = categories.map(category => this.toPersistence(category))

    await this.prisma.userCategory.createMany({
      data,
      skipDuplicates: true
    })

    // Buscar as categorias criadas
    const categoryIds = categories.map(c => c.id)
    const created = await this.prisma.userCategory.findMany({
      where: {
        id: { in: categoryIds }
      },
      include: {
        categoryTemplate: true
      }
    })

    return created.map(category => this.toDomain(category))
  }

  async bulkUpdate(categories: UserCategory[]): Promise<UserCategory[]> {
    const updates = categories.map(category =>
      this.prisma.userCategory.update({
        where: { id: category.id },
        data: {
          ...this.toPersistence(category),
          updatedAt: new Date()
        },
        include: {
          categoryTemplate: true
        }
      })
    )

    const updated = await Promise.all(updates)
    return updated.map(category => this.toDomain(category))
  }

  async countByUserId(userId: string, filters?: {
    type?: CategoryType
    status?: CategoryStatus
    isActive?: boolean
    isCustom?: boolean
  }): Promise<number> {
    const where: any = { userId }

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.isCustom !== undefined) {
      where.isCustom = filters.isCustom
    }

    return await this.prisma.userCategory.count({ where })
  }

  async getUsageStats(userId: string, categoryId: string): Promise<{
    transactionCount: number
    budgetCount: number
    lastUsed?: Date
  }> {
    const [transactionCount, budgetCount, lastTransaction] = await Promise.all([
      this.prisma.transaction.count({
        where: { userId, userCategoryId: categoryId }
      }),
      this.prisma.budget.count({
        where: { userId, userCategoryId: categoryId }
      }),
      this.prisma.transaction.findFirst({
        where: { userId, userCategoryId: categoryId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ])

    return {
      transactionCount,
      budgetCount,
      lastUsed: lastTransaction?.createdAt
    }
  }

  async createFromTemplate(userId: string, templateId: string, customizations?: {
    name?: string
    description?: string
    color?: string
    icon?: string
    sortOrder?: number
    isDefault?: boolean
  }): Promise<UserCategory> {
    const template = await this.categoryTemplateRepository.findById(templateId)
    if (!template) {
      throw new Error('Category template not found')
    }

    const userCategory = new UserCategory({
      userId,
      categoryTemplateId: templateId,
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      type: template.type,
      color: customizations?.color || template.color,
      icon: customizations?.icon || template.icon,
      sortOrder: customizations?.sortOrder || template.sortOrder,
      isDefault: customizations?.isDefault ?? template.isDefault,
      isCustom: false,
      status: CategoryStatus.ACTIVE,
      isActive: true,
      tags: template.tags,
      metadata: template.metadata
    })

    return await this.create(userCategory)
  }

  async syncWithTemplate(userCategoryId: string, templateId: string): Promise<UserCategory> {
    const [userCategory, template] = await Promise.all([
      this.findById(userCategoryId),
      this.categoryTemplateRepository.findById(templateId)
    ])

    if (!userCategory) {
      throw new Error('User category not found')
    }

    if (!template) {
      throw new Error('Category template not found')
    }

    // Sync only non-customized fields
    const synced = new UserCategory({
      id: userCategory.id,
      userId: userCategory.userId,
      name: userCategory.name,
      type: userCategory.type,
      categoryTemplateId: templateId,
      description: template.description,
      color: template.color,
      icon: template.icon,
      parentCategoryId: userCategory.parentCategoryId,
      status: userCategory.status,
      isActive: userCategory.isActive,
      isCustom: userCategory.isCustom,
      isDefault: userCategory.isDefault,
      sortOrder: userCategory.sortOrder,
      tags: template.tags,
      createdAt: userCategory.createdAt,
      updatedAt: new Date(),
      metadata: template.metadata
    })

    return await this.update(synced)
  }

  private toDomain(prismaUserCategory: any): UserCategory {
    return new UserCategory({
      id: prismaUserCategory.id,
      userId: prismaUserCategory.userId,
      categoryTemplateId: prismaUserCategory.categoryTemplateId,
      name: prismaUserCategory.name,
      description: prismaUserCategory.description,
      type: prismaUserCategory.type as CategoryType,
      color: prismaUserCategory.color,
      icon: prismaUserCategory.icon,
      parentCategoryId: prismaUserCategory.parentCategoryId,
      status: prismaUserCategory.status as CategoryStatus,
      isActive: prismaUserCategory.isActive,
      isCustom: prismaUserCategory.isCustom,
      isDefault: prismaUserCategory.isDefault,
      sortOrder: prismaUserCategory.sortOrder,
      tags: prismaUserCategory.tags || [],
      createdAt: prismaUserCategory.createdAt,
      updatedAt: prismaUserCategory.updatedAt,
      metadata: prismaUserCategory.metadata
    })
  }

  private toPersistence(category: UserCategory): any {
    return {
      id: category.id,
      userId: category.userId,
      categoryTemplateId: category.categoryTemplateId,
      name: category.name,
      description: category.description,
      type: category.type,
      color: category.color,
      icon: category.icon,
      parentCategoryId: category.parentCategoryId,
      status: category.status,
      isActive: category.isActive,
      isCustom: category.isCustom,
      isDefault: category.isDefault,
      sortOrder: category.sortOrder,
      tags: category.tags || [],
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      metadata: category.metadata
    }
  }
}
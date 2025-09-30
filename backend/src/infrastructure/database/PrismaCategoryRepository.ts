import { PrismaClient, Category as PrismaCategory, CategoryType, CategoryStatus } from '@prisma/client'
import { ICategoryRepository } from '../../core/interfaces/repositories/ICategoryRepository'
import { Category } from '../../core/entities/Category'
import { Service, Inject } from 'typedi'

@Service()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(@Inject('PrismaClient') private prisma: PrismaClient) {}

  async create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const created = await this.prisma.category.create({
      data: {
        userId: category.userId,
        name: category.name,
        description: category.description,
        type: category.type as CategoryType,
        color: category.color,
        icon: category.icon,
        parentCategoryId: category.parentCategoryId,
        status: category.status as CategoryStatus,
        isDefault: category.isDefault,
        isSystem: category.isSystem,
        tags: category.tags,
        metadata: category.metadata
      }
    })

    return this.toDomainEntity(created)
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parentCategory: true,
        subcategories: true
      }
    })

    return category ? this.toDomainEntity(category) : null
  }

  async findByUserId(userId: string, filters?: {
    type?: string
    status?: string
    isDefault?: boolean
    parentCategoryId?: string
    limit?: number
    offset?: number
  }): Promise<{
    categories: Category[]
    total: number
  }> {
    const where: any = {
      OR: [
        { userId },
        { isSystem: true }
      ]
    }

    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.isDefault !== undefined) where.isDefault = filters.isDefault
    if (filters?.parentCategoryId) where.parentCategoryId = filters.parentCategoryId

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: {
          parentCategory: true,
          subcategories: true
        },
        orderBy: [
          { isSystem: 'desc' },
          { isDefault: 'desc' },
          { name: 'asc' }
        ],
        take: filters?.limit,
        skip: filters?.offset
      }),
      this.prisma.category.count({ where })
    ])

    return {
      categories: categories.map(c => this.toDomainEntity(c)),
      total
    }
  }

  async findByUserIdAndType(userId: string, type: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          { userId, type: type as CategoryType },
          { isSystem: true, type: type as CategoryType }
        ]
      },
      include: {
        parentCategory: true,
        subcategories: true
      },
      orderBy: [
        { isSystem: 'desc' },
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    })

    return categories.map(c => this.toDomainEntity(c))
  }

  async findByParentId(parentId: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentCategoryId: parentId },
      include: {
        parentCategory: true,
        subcategories: true
      },
      orderBy: { name: 'asc' }
    })

    return categories.map(c => this.toDomainEntity(c))
  }

  async findRootCategories(userId: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          { userId, parentCategoryId: null },
          { isSystem: true, parentCategoryId: null }
        ]
      },
      include: {
        subcategories: {
          include: {
            subcategories: true
          }
        }
      },
      orderBy: [
        { isSystem: 'desc' },
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    })

    return categories.map(c => this.toDomainEntity(c))
  }

  async update(category: Category): Promise<Category> {
    const updateData: any = {
      name: category.name,
      description: category.description,
      type: category.type as any,
      color: category.color,
      icon: category.icon,
      parentCategoryId: category.parentCategoryId,
      status: category.status as any,
      isDefault: category.isDefault,
      tags: category.tags,
      metadata: category.metadata
    }

    const updated = await this.prisma.category.update({
      where: { id: category.id },
      data: updateData,
      include: {
        parentCategory: true,
        subcategories: true
      }
    })

    return this.toDomainEntity(updated)
  }

  async delete(id: string): Promise<void> {
    // Check if category has subcategories
    const subcategories = await this.prisma.category.findMany({
      where: { parentCategoryId: id }
    })

    if (subcategories.length > 0) {
      throw new Error('Cannot delete category with subcategories')
    }

    // Check if category has transactions
    const transactionCount = await this.prisma.transaction.count({
      where: { categoryId: id }
    })

    if (transactionCount > 0) {
      // Instead of deleting, mark as archived
      await this.prisma.category.update({
        where: { id },
        data: { status: 'ARCHIVED' }
      })
    } else {
      await this.prisma.category.delete({
        where: { id }
      })
    }
  }

  async existsByUserIdAndName(userId: string, name: string): Promise<boolean> {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [
          { userId, name },
          { isSystem: true, name }
        ]
      }
    })
    return !!category
  }

  async findDefaultCategories(userId: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          { userId, isDefault: true },
          { isSystem: true, isDefault: true }
        ],
        status: 'ACTIVE'
      },
      include: {
        parentCategory: true,
        subcategories: true
      },
      orderBy: [
        { isSystem: 'desc' },
        { name: 'asc' }
      ]
    })

    return categories.map(c => this.toDomainEntity(c))
  }

  async searchByName(userId: string, searchTerm: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          { userId },
          { isSystem: true }
        ],
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        },
        status: 'ACTIVE'
      },
      include: {
        parentCategory: true,
        subcategories: true
      },
      orderBy: { name: 'asc' }
    })

    return categories.map(c => this.toDomainEntity(c))
  }

  async getCategoryUsageStats(userId: string): Promise<Array<{ categoryId: string; categoryName: string; transactionCount: number; totalAmount: number }>> {
    const result = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        status: 'COMPLETED'
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })

    // Get category names
    const categoryIds = result.map(r => r.categoryId)
    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    const categoryMap = new Map(categories.map(c => [c.id, c.name]))

    return result.map(r => ({
      categoryId: r.categoryId,
      categoryName: categoryMap.get(r.categoryId) || 'Unknown',
      transactionCount: r._count.id,
      totalAmount: Number(r._sum.amount || 0)
    }))
  }

  private toDomainEntity(prismaCategory: any): Category {
    return new Category({
      id: prismaCategory.id,
      userId: prismaCategory.userId,
      name: prismaCategory.name,
      description: prismaCategory.description,
      type: prismaCategory.type,
      color: prismaCategory.color,
      icon: prismaCategory.icon,
      parentCategoryId: prismaCategory.parentCategoryId,
      status: prismaCategory.status,
      isDefault: prismaCategory.isDefault,
      isSystem: prismaCategory.isSystem,
      tags: prismaCategory.tags,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
      metadata: prismaCategory.metadata
    })
  }
}
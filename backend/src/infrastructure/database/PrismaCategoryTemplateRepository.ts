import { PrismaClient } from '@prisma/client'
import { ICategoryTemplateRepository } from '../../core/interfaces/repositories/ICategoryTemplateRepository'
import { CategoryTemplate } from '../../core/entities/CategoryTemplate'
import { CategoryType } from '../../core/entities/Category'

export class PrismaCategoryTemplateRepository implements ICategoryTemplateRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<CategoryTemplate | null> {
    const template = await this.prisma.categoryTemplate.findUnique({
      where: { id }
    })

    return template ? this.toDomain(template) : null
  }

  async findAll(filters?: {
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
    const where: any = {}

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.isDefault !== undefined) {
      where.isDefault = filters.isDefault
    }

    if (filters?.isSystem !== undefined) {
      where.isSystem = filters.isSystem
    }

    const orderBy: any = {}
    if (filters?.sortOrder) {
      orderBy.sortOrder = filters.sortOrder.toLowerCase()
    } else {
      orderBy.sortOrder = 'asc'
    }

    const [templates, total] = await Promise.all([
      this.prisma.categoryTemplate.findMany({
        where,
        orderBy,
        take: filters?.limit,
        skip: filters?.offset
      }),
      this.prisma.categoryTemplate.count({ where })
    ])

    return {
      templates: templates.map(template => this.toDomain(template)),
      total
    }
  }

  async findByType(type: CategoryType, options?: {
    isDefault?: boolean
    isSystem?: boolean
    sortOrder?: 'ASC' | 'DESC'
    limit?: number
  }): Promise<CategoryTemplate[]> {
    const where: any = { type }

    if (options?.isDefault !== undefined) {
      where.isDefault = options.isDefault
    }

    if (options?.isSystem !== undefined) {
      where.isSystem = options.isSystem
    }

    const orderBy: any = {}
    if (options?.sortOrder) {
      orderBy.sortOrder = options.sortOrder.toLowerCase()
    } else {
      orderBy.sortOrder = 'asc'
    }

    const templates = await this.prisma.categoryTemplate.findMany({
      where,
      orderBy,
      take: options?.limit
    })

    return templates.map(template => this.toDomain(template))
  }

  async findDefault(options?: {
    type?: CategoryType
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<CategoryTemplate[]> {
    const where: any = { isDefault: true }

    if (options?.type) {
      where.type = options.type
    }

    const orderBy: any = {}
    if (options?.sortOrder) {
      orderBy.sortOrder = options.sortOrder.toLowerCase()
    } else {
      orderBy.sortOrder = 'asc'
    }

    const templates = await this.prisma.categoryTemplate.findMany({
      where,
      orderBy
    })

    return templates.map(template => this.toDomain(template))
  }

  async create(template: CategoryTemplate): Promise<CategoryTemplate> {
    const created = await this.prisma.categoryTemplate.create({
      data: this.toPersistence(template)
    })

    return this.toDomain(created)
  }

  async update(template: CategoryTemplate): Promise<CategoryTemplate> {
    const updated = await this.prisma.categoryTemplate.update({
      where: { id: template.id },
      data: {
        ...this.toPersistence(template),
        updatedAt: new Date()
      }
    })

    return this.toDomain(updated)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.categoryTemplate.delete({
      where: { id }
    })
  }

  async existsByNameAndType(name: string, type: CategoryType): Promise<boolean> {
    const count = await this.prisma.categoryTemplate.count({
      where: {
        name,
        type
      }
    })

    return count > 0
  }

  async bulkCreate(templates: CategoryTemplate[]): Promise<CategoryTemplate[]> {
    const data = templates.map(template => this.toPersistence(template))

    await this.prisma.categoryTemplate.createMany({
      data,
      skipDuplicates: true
    })

    // Buscar os templates criados
    const templateIds = templates.map(t => t.id)
    const created = await this.prisma.categoryTemplate.findMany({
      where: {
        id: { in: templateIds }
      }
    })

    return created.map(template => this.toDomain(template))
  }

  private toDomain(prismaTemplate: any): CategoryTemplate {
    return new CategoryTemplate({
      id: prismaTemplate.id,
      name: prismaTemplate.name,
      description: prismaTemplate.description,
      type: prismaTemplate.type as CategoryType,
      color: prismaTemplate.color,
      icon: prismaTemplate.icon,
      isDefault: prismaTemplate.isDefault,
      isSystem: prismaTemplate.isSystem,
      sortOrder: prismaTemplate.sortOrder,
      tags: prismaTemplate.tags || [],
      createdAt: prismaTemplate.createdAt,
      updatedAt: prismaTemplate.updatedAt,
      metadata: prismaTemplate.metadata
    })
  }

  private toPersistence(template: CategoryTemplate): any {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      color: template.color,
      icon: template.icon,
      isDefault: template.isDefault,
      isSystem: template.isSystem,
      sortOrder: template.sortOrder,
      tags: template.tags || [],
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      metadata: template.metadata
    }
  }
}
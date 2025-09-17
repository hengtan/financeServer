import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDate, IsBoolean } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export class Category {
  @IsUUID(4)
  public readonly id: string

  @IsUUID(4)
  @IsNotEmpty()
  public readonly userId: string

  @IsNotEmpty()
  public readonly name: string

  @IsOptional()
  public readonly description?: string

  @IsEnum(CategoryType)
  public readonly type: CategoryType

  @IsOptional()
  public readonly color?: string

  @IsOptional()
  public readonly icon?: string

  @IsOptional()
  @IsUUID(4)
  public readonly parentCategoryId?: string

  @IsEnum(CategoryStatus)
  public status: CategoryStatus

  @IsBoolean()
  public readonly isDefault: boolean

  @IsBoolean()
  public readonly isSystem: boolean

  @IsOptional()
  public readonly tags?: string[]

  @IsDate()
  public readonly createdAt: Date

  @IsDate()
  public updatedAt: Date

  @IsOptional()
  public readonly metadata?: Record<string, any>

  constructor(props: {
    id?: string
    userId: string
    name: string
    description?: string
    type: CategoryType
    color?: string
    icon?: string
    parentCategoryId?: string
    status?: CategoryStatus
    isDefault?: boolean
    isSystem?: boolean
    tags?: string[]
    createdAt?: Date
    updatedAt?: Date
    metadata?: Record<string, any>
  }) {
    this.id = props.id || uuidv4()
    this.userId = props.userId
    this.name = props.name
    this.description = props.description
    this.type = props.type
    this.color = props.color
    this.icon = props.icon
    this.parentCategoryId = props.parentCategoryId
    this.status = props.status || CategoryStatus.ACTIVE
    this.isDefault = props.isDefault || false
    this.isSystem = props.isSystem || false
    this.tags = props.tags
    this.createdAt = props.createdAt || new Date()
    this.updatedAt = props.updatedAt || new Date()
    this.metadata = props.metadata

    this.validate()
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 1) {
      throw new Error('Category name is required')
    }

    if (!this.userId) {
      throw new Error('User ID is required')
    }

    if (this.parentCategoryId === this.id) {
      throw new Error('Category cannot be its own parent')
    }

    if (this.color && !/^#[0-9A-F]{6}$/i.test(this.color)) {
      throw new Error('Color must be a valid hex color code')
    }
  }

  public static createDefaultCategories(userId: string): Category[] {
    const defaultCategories = [
      // Income categories
      { name: 'Salary', type: CategoryType.INCOME, color: '#22c55e', icon: '💰' },
      { name: 'Freelance', type: CategoryType.INCOME, color: '#3b82f6', icon: '💼' },
      { name: 'Investment', type: CategoryType.INCOME, color: '#8b5cf6', icon: '📈' },
      { name: 'Other Income', type: CategoryType.INCOME, color: '#06b6d4', icon: '💵' },

      // Expense categories
      { name: 'Food & Dining', type: CategoryType.EXPENSE, color: '#ef4444', icon: '🍽️' },
      { name: 'Transportation', type: CategoryType.EXPENSE, color: '#f97316', icon: '🚗' },
      { name: 'Shopping', type: CategoryType.EXPENSE, color: '#ec4899', icon: '🛒' },
      { name: 'Entertainment', type: CategoryType.EXPENSE, color: '#8b5cf6', icon: '🎬' },
      { name: 'Bills & Utilities', type: CategoryType.EXPENSE, color: '#dc2626', icon: '⚡' },
      { name: 'Healthcare', type: CategoryType.EXPENSE, color: '#059669', icon: '🏥' },
      { name: 'Education', type: CategoryType.EXPENSE, color: '#0ea5e9', icon: '📚' },
      { name: 'Travel', type: CategoryType.EXPENSE, color: '#7c3aed', icon: '✈️' },
      { name: 'Home & Garden', type: CategoryType.EXPENSE, color: '#16a34a', icon: '🏠' },
      { name: 'Personal Care', type: CategoryType.EXPENSE, color: '#db2777', icon: '💅' },
      { name: 'Other Expenses', type: CategoryType.EXPENSE, color: '#6b7280', icon: '📝' },

      // Transfer category
      { name: 'Transfer', type: CategoryType.TRANSFER, color: '#4f46e5', icon: '↔️' }
    ]

    return defaultCategories.map(cat => new Category({
      userId,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
      isDefault: true,
      isSystem: true
    }))
  }

  public archive(): void {
    if (this.status === CategoryStatus.ARCHIVED) {
      throw new Error('Category is already archived')
    }

    if (this.isSystem) {
      throw new Error('System categories cannot be archived')
    }

    Object.assign(this, {
      status: CategoryStatus.ARCHIVED,
      updatedAt: new Date()
    })
  }

  public activate(): void {
    if (this.status === CategoryStatus.ACTIVE) {
      throw new Error('Category is already active')
    }

    Object.assign(this, {
      status: CategoryStatus.ACTIVE,
      updatedAt: new Date()
    })
  }

  public deactivate(): void {
    if (this.status === CategoryStatus.INACTIVE) {
      throw new Error('Category is already inactive')
    }

    if (this.isSystem) {
      throw new Error('System categories cannot be deactivated')
    }

    Object.assign(this, {
      status: CategoryStatus.INACTIVE,
      updatedAt: new Date()
    })
  }

  public updateName(newName: string): void {
    if (!newName || newName.trim().length < 1) {
      throw new Error('Category name is required')
    }

    if (this.isSystem) {
      throw new Error('System categories cannot be renamed')
    }

    Object.assign(this, {
      name: newName.trim(),
      updatedAt: new Date()
    })
  }

  public updateDescription(description: string): void {
    Object.assign(this, {
      description,
      updatedAt: new Date()
    })
  }

  public updateColor(color: string): void {
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      throw new Error('Color must be a valid hex color code')
    }

    Object.assign(this, {
      color,
      updatedAt: new Date()
    })
  }

  public updateIcon(icon: string): void {
    Object.assign(this, {
      icon,
      updatedAt: new Date()
    })
  }

  public addTag(tag: string): void {
    if (!tag || tag.trim().length < 1) {
      throw new Error('Tag cannot be empty')
    }

    const currentTags = this.tags || []
    if (currentTags.includes(tag)) {
      throw new Error('Tag already exists')
    }

    Object.assign(this, {
      tags: [...currentTags, tag],
      updatedAt: new Date()
    })
  }

  public removeTag(tag: string): void {
    const currentTags = this.tags || []
    if (!currentTags.includes(tag)) {
      throw new Error('Tag does not exist')
    }

    Object.assign(this, {
      tags: currentTags.filter(t => t !== tag),
      updatedAt: new Date()
    })
  }

  public isActive(): boolean {
    return this.status === CategoryStatus.ACTIVE
  }

  public isIncomeCategory(): boolean {
    return this.type === CategoryType.INCOME
  }

  public isExpenseCategory(): boolean {
    return this.type === CategoryType.EXPENSE
  }

  public isTransferCategory(): boolean {
    return this.type === CategoryType.TRANSFER
  }

  public hasParent(): boolean {
    return this.parentCategoryId !== undefined
  }

  public toAuditLog(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      type: this.type,
      status: this.status,
      isDefault: this.isDefault,
      isSystem: this.isSystem,
      parentCategoryId: this.parentCategoryId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      description: this.description,
      type: this.type,
      color: this.color,
      icon: this.icon,
      parentCategoryId: this.parentCategoryId,
      status: this.status,
      isDefault: this.isDefault,
      isSystem: this.isSystem,
      tags: this.tags,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      metadata: this.metadata
    }
  }
}
import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDate, IsBoolean, IsInt } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import { CategoryType, CategoryStatus } from './Category'

export class UserCategory {
  @IsUUID(4)
  public readonly id: string

  @IsUUID(4)
  @IsNotEmpty()
  public readonly userId: string

  @IsOptional()
  @IsUUID(4)
  public readonly categoryTemplateId?: string

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
  public readonly isActive: boolean

  @IsBoolean()
  public readonly isCustom: boolean

  @IsBoolean()
  public readonly isDefault: boolean

  @IsOptional()
  @IsInt()
  public readonly sortOrder?: number

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
    categoryTemplateId?: string
    name: string
    description?: string
    type: CategoryType
    color?: string
    icon?: string
    parentCategoryId?: string
    status?: CategoryStatus
    isActive?: boolean
    isCustom?: boolean
    isDefault?: boolean
    sortOrder?: number
    tags?: string[]
    createdAt?: Date
    updatedAt?: Date
    metadata?: Record<string, any>
  }) {
    this.id = props.id || uuidv4()
    this.userId = props.userId
    this.categoryTemplateId = props.categoryTemplateId
    this.name = props.name
    this.description = props.description
    this.type = props.type
    this.color = props.color
    this.icon = props.icon
    this.parentCategoryId = props.parentCategoryId
    this.status = props.status || CategoryStatus.ACTIVE
    this.isActive = props.isActive ?? (props.status === CategoryStatus.ACTIVE || props.status === undefined)
    this.isCustom = props.isCustom ?? !props.categoryTemplateId
    this.isDefault = props.isDefault ?? false
    this.sortOrder = props.sortOrder
    this.tags = props.tags || []
    this.createdAt = props.createdAt || new Date()
    this.updatedAt = props.updatedAt || new Date()
    this.metadata = props.metadata

    this.validate()
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 1) {
      throw new Error('UserCategory name is required')
    }

    if (!this.userId) {
      throw new Error('User ID is required')
    }

    if (this.parentCategoryId === this.id) {
      throw new Error('UserCategory cannot be its own parent')
    }

    if (this.color && !/^#[0-9A-F]{6}$/i.test(this.color)) {
      throw new Error('Color must be a valid hex color code')
    }

    if (this.sortOrder !== undefined && this.sortOrder < 0) {
      throw new Error('Sort order must be a positive number')
    }
  }

  public archive(): void {
    if (this.status === CategoryStatus.ARCHIVED) {
      throw new Error('UserCategory is already archived')
    }

    Object.assign(this, {
      status: CategoryStatus.ARCHIVED,
      isActive: false,
      updatedAt: new Date()
    })
  }

  public activate(): void {
    if (this.status === CategoryStatus.ACTIVE) {
      throw new Error('UserCategory is already active')
    }

    Object.assign(this, {
      status: CategoryStatus.ACTIVE,
      isActive: true,
      updatedAt: new Date()
    })
  }

  public deactivate(): void {
    if (this.status === CategoryStatus.INACTIVE) {
      throw new Error('UserCategory is already inactive')
    }

    Object.assign(this, {
      status: CategoryStatus.INACTIVE,
      isActive: false,
      updatedAt: new Date()
    })
  }

  public updateName(newName: string): void {
    if (!newName || newName.trim().length < 1) {
      throw new Error('UserCategory name is required')
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

  public updateSortOrder(sortOrder: number): void {
    if (sortOrder < 0) {
      throw new Error('Sort order must be a positive number')
    }

    Object.assign(this, {
      sortOrder,
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

  public isActiveStatus(): boolean {
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

  public isBasedOnTemplate(): boolean {
    return this.categoryTemplateId !== undefined
  }

  public isCustomCategory(): boolean {
    return this.isCustom
  }

  public toAuditLog(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      categoryTemplateId: this.categoryTemplateId,
      name: this.name,
      type: this.type,
      status: this.status,
      isActive: this.isActive,
      isCustom: this.isCustom,
      isDefault: this.isDefault,
      parentCategoryId: this.parentCategoryId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      categoryTemplateId: this.categoryTemplateId,
      name: this.name,
      description: this.description,
      type: this.type,
      color: this.color,
      icon: this.icon,
      parentCategoryId: this.parentCategoryId,
      status: this.status,
      isActive: this.isActive,
      isCustom: this.isCustom,
      isDefault: this.isDefault,
      sortOrder: this.sortOrder,
      tags: this.tags,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      metadata: this.metadata
    }
  }
}
import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDate, IsBoolean, IsInt } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import { CategoryType } from './Category'

export class CategoryTemplate {
  @IsUUID(4)
  public readonly id: string

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

  @IsBoolean()
  public readonly isDefault: boolean

  @IsBoolean()
  public readonly isSystem: boolean

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
    name: string
    description?: string
    type: CategoryType
    color?: string
    icon?: string
    isDefault?: boolean
    isSystem?: boolean
    sortOrder?: number
    tags?: string[]
    createdAt?: Date
    updatedAt?: Date
    metadata?: Record<string, any>
  }) {
    this.id = props.id || uuidv4()
    this.name = props.name
    this.description = props.description
    this.type = props.type
    this.color = props.color
    this.icon = props.icon
    this.isDefault = props.isDefault ?? false
    this.isSystem = props.isSystem ?? true
    this.sortOrder = props.sortOrder
    this.tags = props.tags || []
    this.createdAt = props.createdAt || new Date()
    this.updatedAt = props.updatedAt || new Date()
    this.metadata = props.metadata

    this.validate()
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 1) {
      throw new Error('CategoryTemplate name is required')
    }

    if (this.color && !/^#[0-9A-F]{6}$/i.test(this.color)) {
      throw new Error('Color must be a valid hex color code')
    }

    if (this.sortOrder !== undefined && this.sortOrder < 0) {
      throw new Error('Sort order must be a positive number')
    }
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

  public isIncomeCategory(): boolean {
    return this.type === CategoryType.INCOME
  }

  public isExpenseCategory(): boolean {
    return this.type === CategoryType.EXPENSE
  }

  public isTransferCategory(): boolean {
    return this.type === CategoryType.TRANSFER
  }

  public toAuditLog(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      isDefault: this.isDefault,
      isSystem: this.isSystem,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      color: this.color,
      icon: this.icon,
      isDefault: this.isDefault,
      isSystem: this.isSystem,
      sortOrder: this.sortOrder,
      tags: this.tags,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      metadata: this.metadata
    }
  }
}
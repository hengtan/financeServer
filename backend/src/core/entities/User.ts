import { IsEmail, IsNotEmpty, IsUUID, IsOptional, IsDate, IsBoolean, IsEnum } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import { hash, compare } from 'bcryptjs'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  PREMIUM = 'PREMIUM'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export class User {
  @IsUUID(4)
  public readonly id: string

  @IsNotEmpty()
  public readonly name: string

  @IsEmail()
  public readonly email: string

  private readonly passwordHash: string

  @IsEnum(UserRole)
  public role: UserRole

  @IsEnum(UserStatus)
  public status: UserStatus

  @IsOptional()
  public readonly avatarUrl?: string

  @IsOptional()
  public readonly phoneNumber?: string

  @IsBoolean()
  public readonly twoFactorEnabled: boolean

  @IsOptional()
  public readonly twoFactorSecret?: string

  @IsDate()
  public readonly lastLoginAt?: Date

  @IsDate()
  public readonly emailVerifiedAt?: Date

  @IsDate()
  public readonly createdAt: Date

  @IsDate()
  public updatedAt: Date

  @IsOptional()
  public readonly metadata?: Record<string, any>

  constructor(props: {
    id?: string
    name: string
    email: string
    password: string
    role?: UserRole
    status?: UserStatus
    avatarUrl?: string
    phoneNumber?: string
    twoFactorEnabled?: boolean
    twoFactorSecret?: string
    lastLoginAt?: Date
    emailVerifiedAt?: Date
    createdAt?: Date
    updatedAt?: Date
    metadata?: Record<string, any>
  }) {
    this.id = props.id || uuidv4()
    this.name = props.name
    this.email = props.email
    this.passwordHash = props.password
    this.role = props.role || UserRole.USER
    this.status = props.status || UserStatus.PENDING_VERIFICATION
    this.avatarUrl = props.avatarUrl
    this.phoneNumber = props.phoneNumber
    this.twoFactorEnabled = props.twoFactorEnabled || false
    this.twoFactorSecret = props.twoFactorSecret
    this.lastLoginAt = props.lastLoginAt
    this.emailVerifiedAt = props.emailVerifiedAt
    this.createdAt = props.createdAt || new Date()
    this.updatedAt = props.updatedAt || new Date()
    this.metadata = props.metadata

    this.validate()
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('User name must be at least 2 characters long')
    }

    if (!this.email || !this.email.includes('@')) {
      throw new Error('Valid email is required')
    }

    if (!this.passwordHash || this.passwordHash.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }
  }

  public static async create(props: {
    name: string
    email: string
    password: string
    role?: UserRole
    avatarUrl?: string
    phoneNumber?: string
    metadata?: Record<string, any>
  }): Promise<User> {
    const hashedPassword = await hash(props.password, 12)

    return new User({
      ...props,
      password: hashedPassword
    })
  }

  public async validatePassword(plainPassword: string): Promise<boolean> {
    return await compare(plainPassword, this.passwordHash)
  }

  public async changePassword(newPassword: string): Promise<void> {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    const hashedPassword = await hash(newPassword, 12)
    Object.assign(this, { passwordHash: hashedPassword, updatedAt: new Date() })
  }

  public markEmailAsVerified(): void {
    if (this.emailVerifiedAt) {
      throw new Error('Email is already verified')
    }

    Object.assign(this, {
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
      updatedAt: new Date()
    })
  }

  public enable2FA(secret: string): void {
    if (this.twoFactorEnabled) {
      throw new Error('Two-factor authentication is already enabled')
    }

    Object.assign(this, {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      updatedAt: new Date()
    })
  }

  public disable2FA(): void {
    if (!this.twoFactorEnabled) {
      throw new Error('Two-factor authentication is not enabled')
    }

    Object.assign(this, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      updatedAt: new Date()
    })
  }

  public suspend(): void {
    if (this.status === UserStatus.SUSPENDED) {
      throw new Error('User is already suspended')
    }

    Object.assign(this, {
      status: UserStatus.SUSPENDED,
      updatedAt: new Date()
    })
  }

  public activate(): void {
    if (this.status === UserStatus.ACTIVE) {
      throw new Error('User is already active')
    }

    Object.assign(this, {
      status: UserStatus.ACTIVE,
      updatedAt: new Date()
    })
  }

  public updateLastLogin(): void {
    Object.assign(this, {
      lastLoginAt: new Date(),
      updatedAt: new Date()
    })
  }

  public upgradeToPremium(): void {
    if (this.role === UserRole.PREMIUM) {
      throw new Error('User is already premium')
    }

    Object.assign(this, {
      role: UserRole.PREMIUM,
      updatedAt: new Date()
    })
  }

  public isActive(): boolean {
    return this.status === UserStatus.ACTIVE
  }

  public isVerified(): boolean {
    return this.emailVerifiedAt !== undefined
  }

  public isPremium(): boolean {
    return this.role === UserRole.PREMIUM
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN
  }

  public toAuditLog(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      status: this.status,
      twoFactorEnabled: this.twoFactorEnabled,
      lastLoginAt: this.lastLoginAt?.toISOString(),
      emailVerifiedAt: this.emailVerifiedAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      status: this.status,
      avatarUrl: this.avatarUrl,
      phoneNumber: this.phoneNumber,
      twoFactorEnabled: this.twoFactorEnabled,
      lastLoginAt: this.lastLoginAt?.toISOString(),
      emailVerifiedAt: this.emailVerifiedAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      metadata: this.metadata
    }
  }
}
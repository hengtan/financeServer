import { Decimal } from 'decimal.js'
import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDate, IsBoolean } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
  CREDIT_CARD = 'CREDIT_CARD',
  LOAN = 'LOAN',
  OTHER = 'OTHER'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED',
  FROZEN = 'FROZEN'
}

export class Account {
  @IsUUID(4)
  public readonly id: string

  @IsUUID(4)
  @IsNotEmpty()
  public readonly userId: string

  @IsNotEmpty()
  public readonly name: string

  @IsEnum(AccountType)
  public readonly type: AccountType

  public readonly balance: Decimal

  public readonly currency: string

  @IsOptional()
  public readonly bankName?: string

  @IsOptional()
  public readonly accountNumber?: string

  @IsOptional()
  public readonly routingNumber?: string

  @IsEnum(AccountStatus)
  public status: AccountStatus

  @IsBoolean()
  public readonly isDefault: boolean

  @IsOptional()
  public readonly creditLimit?: Decimal

  @IsOptional()
  public readonly interestRate?: Decimal

  @IsOptional()
  public readonly description?: string

  @IsOptional()
  public readonly color?: string

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
    type: AccountType
    balance?: number | string | Decimal
    currency?: string
    bankName?: string
    accountNumber?: string
    routingNumber?: string
    status?: AccountStatus
    isDefault?: boolean
    creditLimit?: number | string | Decimal
    interestRate?: number | string | Decimal
    description?: string
    color?: string
    createdAt?: Date
    updatedAt?: Date
    metadata?: Record<string, any>
  }) {
    this.id = props.id || uuidv4()
    this.userId = props.userId
    this.name = props.name
    this.type = props.type
    this.balance = new Decimal(props.balance || 0)
    this.currency = props.currency || 'USD'
    this.bankName = props.bankName
    this.accountNumber = props.accountNumber
    this.routingNumber = props.routingNumber
    this.status = props.status || AccountStatus.ACTIVE
    this.isDefault = props.isDefault || false
    this.creditLimit = props.creditLimit ? new Decimal(props.creditLimit) : undefined
    this.interestRate = props.interestRate ? new Decimal(props.interestRate) : undefined
    this.description = props.description
    this.color = props.color
    this.createdAt = props.createdAt || new Date()
    this.updatedAt = props.updatedAt || new Date()
    this.metadata = props.metadata

    this.validate()
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 1) {
      throw new Error('Account name is required')
    }

    if (!this.userId) {
      throw new Error('User ID is required')
    }

    if (this.type === AccountType.CREDIT_CARD && !this.creditLimit) {
      throw new Error('Credit limit is required for credit card accounts')
    }

    if (this.creditLimit && this.creditLimit.lte(0)) {
      throw new Error('Credit limit must be greater than zero')
    }

    if (this.interestRate && this.interestRate.lt(0)) {
      throw new Error('Interest rate cannot be negative')
    }

    if (!this.currency || this.currency.length !== 3) {
      throw new Error('Currency must be a valid 3-letter code')
    }
  }

  public debit(amount: Decimal): void {
    if (amount.lte(0)) {
      throw new Error('Debit amount must be greater than zero')
    }

    const newBalance = this.balance.minus(amount)

    if (this.type === AccountType.CREDIT_CARD) {
      if (this.creditLimit && newBalance.abs().gt(this.creditLimit)) {
        throw new Error('Transaction would exceed credit limit')
      }
    } else {
      if (newBalance.lt(0)) {
        throw new Error('Insufficient funds')
      }
    }

    Object.assign(this, {
      balance: newBalance,
      updatedAt: new Date()
    })
  }

  public credit(amount: Decimal): void {
    if (amount.lte(0)) {
      throw new Error('Credit amount must be greater than zero')
    }

    const newBalance = this.balance.plus(amount)

    Object.assign(this, {
      balance: newBalance,
      updatedAt: new Date()
    })
  }

  public freeze(): void {
    if (this.status === AccountStatus.FROZEN) {
      throw new Error('Account is already frozen')
    }

    if (this.status === AccountStatus.CLOSED) {
      throw new Error('Cannot freeze a closed account')
    }

    Object.assign(this, {
      status: AccountStatus.FROZEN,
      updatedAt: new Date()
    })
  }

  public unfreeze(): void {
    if (this.status !== AccountStatus.FROZEN) {
      throw new Error('Account is not frozen')
    }

    Object.assign(this, {
      status: AccountStatus.ACTIVE,
      updatedAt: new Date()
    })
  }

  public close(): void {
    if (this.status === AccountStatus.CLOSED) {
      throw new Error('Account is already closed')
    }

    if (!this.balance.isZero()) {
      throw new Error('Cannot close account with non-zero balance')
    }

    Object.assign(this, {
      status: AccountStatus.CLOSED,
      updatedAt: new Date()
    })
  }

  public activate(): void {
    if (this.status === AccountStatus.ACTIVE) {
      throw new Error('Account is already active')
    }

    if (this.status === AccountStatus.CLOSED) {
      throw new Error('Cannot activate a closed account')
    }

    Object.assign(this, {
      status: AccountStatus.ACTIVE,
      updatedAt: new Date()
    })
  }

  public updateCreditLimit(newLimit: Decimal): void {
    if (this.type !== AccountType.CREDIT_CARD) {
      throw new Error('Credit limit can only be set for credit card accounts')
    }

    if (newLimit.lte(0)) {
      throw new Error('Credit limit must be greater than zero')
    }

    if (this.balance.lt(0) && this.balance.abs().gt(newLimit)) {
      throw new Error('New credit limit is lower than current balance')
    }

    Object.assign(this, {
      creditLimit: newLimit,
      updatedAt: new Date()
    })
  }

  public isActive(): boolean {
    return this.status === AccountStatus.ACTIVE
  }

  public isCreditCard(): boolean {
    return this.type === AccountType.CREDIT_CARD
  }

  public hasAvailableCredit(): boolean {
    if (!this.isCreditCard() || !this.creditLimit) {
      return false
    }

    return this.balance.abs().lt(this.creditLimit)
  }

  public getAvailableCredit(): Decimal {
    if (!this.isCreditCard() || !this.creditLimit) {
      return new Decimal(0)
    }

    return this.creditLimit.minus(this.balance.abs())
  }

  public getBalanceAsNumber(): number {
    return this.balance.toNumber()
  }

  public getBalanceAsString(): string {
    return this.balance.toFixed(2)
  }

  public getCreditLimitAsString(): string {
    return this.creditLimit?.toFixed(2) || '0.00'
  }

  public toAuditLog(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      type: this.type,
      balance: this.getBalanceAsString(),
      currency: this.currency,
      status: this.status,
      isDefault: this.isDefault,
      creditLimit: this.getCreditLimitAsString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      type: this.type,
      balance: this.getBalanceAsString(),
      currency: this.currency,
      bankName: this.bankName,
      accountNumber: this.accountNumber,
      routingNumber: this.routingNumber,
      status: this.status,
      isDefault: this.isDefault,
      creditLimit: this.creditLimit ? this.getCreditLimitAsString() : undefined,
      interestRate: this.interestRate?.toFixed(4),
      description: this.description,
      color: this.color,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      metadata: this.metadata
    }
  }
}
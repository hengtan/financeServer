import { Decimal } from 'decimal.js'
import { IsEmail, IsNotEmpty, IsUUID, IsEnum, IsDecimal, IsOptional, IsDate } from 'class-validator'
import { v4 as uuidv4 } from 'uuid'

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export class Transaction {
  @IsUUID(4)
  public readonly id: string

  @IsUUID(4)
  @IsNotEmpty()
  public readonly userId: string

  @IsNotEmpty()
  public readonly description: string

  // Usando Decimal.js para precisão financeira (ACID compliance)
  public readonly amount: Decimal

  @IsEnum(TransactionType)
  public readonly type: TransactionType

  @IsUUID(4)
  @IsNotEmpty()
  public readonly categoryId: string

  @IsUUID(4)
  @IsNotEmpty()
  public readonly accountId: string

  @IsOptional()
  @IsUUID(4)
  public readonly toAccountId?: string // Para transferências

  @IsEnum(TransactionStatus)
  public status: TransactionStatus

  @IsDate()
  public readonly date: Date

  @IsOptional()
  public readonly reference?: string

  @IsOptional()
  public readonly metadata?: Record<string, any>

  @IsDate()
  public readonly createdAt: Date

  @IsDate()
  public updatedAt: Date

  constructor(props: {
    id?: string
    userId: string
    description: string
    amount: number | string | Decimal
    type: TransactionType
    categoryId: string
    accountId: string
    toAccountId?: string
    status?: TransactionStatus
    date?: Date
    reference?: string
    metadata?: Record<string, any>
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id || uuidv4()
    this.userId = props.userId
    this.description = props.description
    this.amount = new Decimal(props.amount)
    this.type = props.type
    this.categoryId = props.categoryId
    this.accountId = props.accountId
    this.toAccountId = props.toAccountId
    this.status = props.status || TransactionStatus.PENDING
    this.date = props.date || new Date()
    this.reference = props.reference
    this.metadata = props.metadata
    this.createdAt = props.createdAt || new Date()
    this.updatedAt = props.updatedAt || new Date()

    this.validate()
  }

  private validate(): void {
    if (this.amount.lte(0)) {
      throw new Error('Transaction amount must be greater than zero')
    }

    if (this.type === TransactionType.TRANSFER && !this.toAccountId) {
      throw new Error('Transfer transactions require a destination account')
    }

    if (this.type === TransactionType.TRANSFER && this.accountId === this.toAccountId) {
      throw new Error('Source and destination accounts cannot be the same')
    }

    if (this.date > new Date()) {
      throw new Error('Transaction date cannot be in the future')
    }
  }

  // Domain methods (Business Logic)
  public markAsCompleted(): void {
    if (this.status !== TransactionStatus.PENDING) {
      throw new Error('Only pending transactions can be completed')
    }
    this.status = TransactionStatus.COMPLETED
    this.updatedAt = new Date()
  }

  public markAsCancelled(): void {
    if (this.status === TransactionStatus.COMPLETED) {
      throw new Error('Completed transactions cannot be cancelled')
    }
    this.status = TransactionStatus.CANCELLED
    this.updatedAt = new Date()
  }

  public markAsFailed(): void {
    if (this.status === TransactionStatus.COMPLETED) {
      throw new Error('Completed transactions cannot be marked as failed')
    }
    this.status = TransactionStatus.FAILED
    this.updatedAt = new Date()
  }

  public isTransfer(): boolean {
    return this.type === TransactionType.TRANSFER
  }

  public isIncome(): boolean {
    return this.type === TransactionType.INCOME
  }

  public isExpense(): boolean {
    return this.type === TransactionType.EXPENSE
  }

  public getAmountAsNumber(): number {
    return this.amount.toNumber()
  }

  public getAmountAsString(): string {
    return this.amount.toFixed(2)
  }

  // Para auditoria e compliance
  public toAuditLog(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      amount: this.getAmountAsString(),
      type: this.type,
      status: this.status,
      description: this.description,
      date: this.date.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      description: this.description,
      amount: this.getAmountAsString(),
      type: this.type,
      categoryId: this.categoryId,
      accountId: this.accountId,
      toAccountId: this.toAccountId,
      status: this.status,
      date: this.date.toISOString(),
      reference: this.reference,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }
}
import { Service } from 'typedi'
import { Decimal } from 'decimal.js'
import { Transaction, TransactionType, TransactionStatus } from '../entities/Transaction'
import { Account } from '../entities/Account'
import { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository'
import { IAccountRepository } from '../interfaces/repositories/IAccountRepository'
import { ICategoryRepository } from '../interfaces/repositories/ICategoryRepository'

export interface ProcessTransactionRequest {
  userId: string
  description: string
  amount: number | string | Decimal
  type: TransactionType
  categoryId: string
  accountId: string
  toAccountId?: string
  date?: Date
  reference?: string
  metadata?: Record<string, any>
}

export interface ProcessTransactionResponse {
  transaction: Transaction
  sourceAccount: Account
  destinationAccount?: Account | null
}

@Service()
export class ProcessTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(request: ProcessTransactionRequest): Promise<ProcessTransactionResponse> {
    await this.validateRequest(request)

    const sourceAccount = await this.accountRepository.findById(request.accountId)
    if (!sourceAccount) {
      throw new Error('Source account not found')
    }

    if (!sourceAccount.isActive()) {
      throw new Error('Source account is not active')
    }

    if (sourceAccount.userId !== request.userId) {
      throw new Error('Account does not belong to the user')
    }

    let destinationAccount: Account | null | undefined

    if (request.type === TransactionType.TRANSFER) {
      if (!request.toAccountId) {
        throw new Error('Destination account is required for transfers')
      }

      destinationAccount = await this.accountRepository.findById(request.toAccountId)
      if (!destinationAccount) {
        throw new Error('Destination account not found')
      }

      if (!destinationAccount.isActive()) {
        throw new Error('Destination account is not active')
      }

      if (destinationAccount.userId !== request.userId) {
        throw new Error('Destination account does not belong to the user')
      }
    }

    const amount = new Decimal(request.amount)

    const transaction = new Transaction({
      userId: request.userId,
      description: request.description,
      amount: amount,
      type: request.type,
      categoryId: request.categoryId,
      accountId: request.accountId,
      toAccountId: request.toAccountId,
      date: request.date,
      reference: request.reference,
      metadata: request.metadata,
      status: TransactionStatus.PENDING
    })

    try {
      await this.processAccountBalances(sourceAccount, destinationAccount, transaction)

      await this.accountRepository.update(sourceAccount)
      if (destinationAccount) {
        await this.accountRepository.update(destinationAccount)
      }

      transaction.markAsCompleted()
      const savedTransaction = await this.transactionRepository.create(transaction)

      return {
        transaction: savedTransaction,
        sourceAccount,
        destinationAccount
      }
    } catch (error) {
      transaction.markAsFailed()
      await this.transactionRepository.create(transaction)
      throw error
    }
  }

  private async validateRequest(request: ProcessTransactionRequest): Promise<void> {
    const category = await this.categoryRepository.findById(request.categoryId)
    if (!category) {
      throw new Error('Category not found')
    }

    if (category.userId !== request.userId) {
      throw new Error('Category does not belong to the user')
    }

    if (!category.isActive()) {
      throw new Error('Category is not active')
    }

    if (category.type as string !== request.type as string) {
      throw new Error('Category type does not match transaction type')
    }

    const amount = new Decimal(request.amount)
    if (amount.lte(0)) {
      throw new Error('Transaction amount must be greater than zero')
    }

    if (request.type === TransactionType.TRANSFER) {
      if (!request.toAccountId) {
        throw new Error('Destination account is required for transfer transactions')
      }

      if (request.accountId === request.toAccountId) {
        throw new Error('Source and destination accounts cannot be the same')
      }
    }

    if (request.date && request.date > new Date()) {
      throw new Error('Transaction date cannot be in the future')
    }
  }

  private async processAccountBalances(
    sourceAccount: Account,
    destinationAccount: Account | null | undefined,
    transaction: Transaction
  ): Promise<void> {
    const amount = transaction.amount

    switch (transaction.type) {
      case TransactionType.INCOME:
        sourceAccount.credit(amount)
        break

      case TransactionType.EXPENSE:
        sourceAccount.debit(amount)
        break

      case TransactionType.TRANSFER:
        if (!destinationAccount) {
          throw new Error('Destination account is required for transfers')
        }
        sourceAccount.debit(amount)
        destinationAccount.credit(amount)
        break

      default:
        throw new Error('Invalid transaction type')
    }
  }
}
import { Transaction } from '../../entities/Transaction'
import { Decimal } from 'decimal.js'

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>
  findByUserId(userId: string, filters?: {
    type?: string
    status?: string
    categoryId?: string
    accountId?: string
    dateFrom?: Date
    dateTo?: Date
    limit?: number
    offset?: number
  }): Promise<{
    transactions: Transaction[]
    total: number
  }>
  create(transaction: Transaction): Promise<Transaction>
  update(transaction: Transaction): Promise<Transaction>
  delete(id: string): Promise<void>
  findByAccountId(accountId: string, filters?: {
    type?: string
    status?: string
    dateFrom?: Date
    dateTo?: Date
    limit?: number
    offset?: number
  }): Promise<{
    transactions: Transaction[]
    total: number
  }>
  getBalanceByAccount(accountId: string): Promise<Decimal>
  getMonthlySpending(userId: string, year: number, month: number): Promise<{
    categoryId: string
    amount: Decimal
  }[]>
  getYearlySpending(userId: string, year: number): Promise<{
    month: number
    income: Decimal
    expenses: Decimal
  }[]>
}
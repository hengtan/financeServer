import { PrismaClient, Transaction as PrismaTransaction, TransactionType as PrismaTransactionType, TransactionStatus as PrismaTransactionStatus } from '@prisma/client'
import { ITransactionRepository } from '../../core/interfaces/repositories/ITransactionRepository'
import { Transaction, TransactionType, TransactionStatus } from '../../core/entities/Transaction'
import { Service, Inject } from 'typedi'
import { Decimal } from 'decimal.js'

@Service()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(@Inject('PrismaClient') private prisma: PrismaClient) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const data: any = {
      userId: transaction.userId,
      description: transaction.description,
      amount: new Decimal(transaction.amount),
      type: transaction.type as PrismaTransactionType,
      accountId: transaction.accountId,
      status: transaction.status as PrismaTransactionStatus,
      date: transaction.date,
      metadata: transaction.metadata
    }

    // 🚀 New hybrid architecture: only include categoryId/userCategoryId if they exist
    if (transaction.categoryId) data.categoryId = transaction.categoryId
    if (transaction.userCategoryId) data.userCategoryId = transaction.userCategoryId
    if (transaction.toAccountId) data.toAccountId = transaction.toAccountId
    if (transaction.reference) data.reference = transaction.reference

    const created = await this.prisma.transaction.create({
      data,
      include: {
        category: true,
        userCategory: true, // 🚀 Include new userCategory relation
        account: true,
        toAccount: true
      }
    })

    return this.toDomainEntity(created)
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        userCategory: true, // 🚀 Include new userCategory relation
        account: true,
        toAccount: true
      }
    })

    return transaction ? this.toDomainEntity(transaction) : null
  }

  async findByUserId(userId: string, filters?: {
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
  }> {
    const where: any = { userId }

    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.categoryId) where.categoryId = filters.categoryId
    if (filters?.accountId) where.accountId = filters.accountId
    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {}
      if (filters.dateFrom) where.date.gte = filters.dateFrom
      if (filters.dateTo) where.date.lte = filters.dateTo
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: true,
          userCategory: true, // 🚀 Include new userCategory relation
          account: true,
          toAccount: true
        },
        orderBy: { date: 'desc' },
        take: filters?.limit,
        skip: filters?.offset
      }),
      this.prisma.transaction.count({ where })
    ])

    return {
      transactions: transactions.map(t => this.toDomainEntity(t)),
      total
    }
  }

  async findByUserIdAndPeriod(
    userId: string,
    startDate: string,
    endDate: string,
    filters?: {
      type?: string
      status?: string
      categoryId?: string
      accountId?: string
    }
  ): Promise<Transaction[]> {
    const where: any = {
      userId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.categoryId) where.categoryId = filters.categoryId
    if (filters?.accountId) where.accountId = filters.accountId

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        toAccount: true
      },
      orderBy: { date: 'desc' }
    })

    return transactions.map(t => this.toDomainEntity(t))
  }

  async findByAccountId(accountId: string, filters?: {
    type?: string
    status?: string
    dateFrom?: Date
    dateTo?: Date
    limit?: number
    offset?: number
  }): Promise<{
    transactions: Transaction[]
    total: number
  }> {
    const where: any = { accountId }

    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {}
      if (filters.dateFrom) where.date.gte = filters.dateFrom
      if (filters.dateTo) where.date.lte = filters.dateTo
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: true,
          userCategory: true, // 🚀 Include new userCategory relation
          account: true,
          toAccount: true
        },
        orderBy: { date: 'desc' },
        take: filters?.limit,
        skip: filters?.offset
      }),
      this.prisma.transaction.count({ where })
    ])

    return {
      transactions: transactions.map(t => this.toDomainEntity(t)),
      total
    }
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        description: transaction.description,
        amount: new Decimal(transaction.amount),
        type: transaction.type as PrismaTransactionType,
        categoryId: transaction.categoryId,
        userCategoryId: transaction.userCategoryId, // 🚀 New hybrid architecture
        accountId: transaction.accountId,
        toAccountId: transaction.toAccountId,
        status: transaction.status as PrismaTransactionStatus,
        date: transaction.date,
        reference: transaction.reference,
        metadata: transaction.metadata
      },
      include: {
        category: true,
        account: true,
        toAccount: true
      }
    })

    return this.toDomainEntity(updated)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id }
    })
  }

  async getBalanceByAccount(accountId: string): Promise<Decimal> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        accountId,
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    })

    return new Decimal(result._sum.amount || 0)
  }

  async getMonthlySpending(userId: string, year: number, month: number): Promise<{
    categoryId: string
    amount: Decimal
  }[]> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const result = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        status: 'COMPLETED',
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    })

    return result.map(r => ({
      categoryId: r.categoryId!,
      amount: new Decimal(r._sum.amount || 0)
    }))
  }

  async getYearlySpending(userId: string, year: number): Promise<{
    month: number
    income: Decimal
    expenses: Decimal
  }[]> {
    const months = Array.from({ length: 12 }, (_, i) => i + 1)

    const results = await Promise.all(
      months.map(async (month) => {
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)

        const [income, expenses] = await Promise.all([
          this.prisma.transaction.aggregate({
            where: {
              userId,
              type: 'INCOME',
              status: 'COMPLETED',
              date: { gte: startDate, lte: endDate }
            },
            _sum: { amount: true }
          }),
          this.prisma.transaction.aggregate({
            where: {
              userId,
              type: 'EXPENSE',
              status: 'COMPLETED',
              date: { gte: startDate, lte: endDate }
            },
            _sum: { amount: true }
          })
        ])

        return {
          month,
          income: new Decimal(income._sum.amount || 0),
          expenses: new Decimal(expenses._sum.amount || 0)
        }
      })
    )

    return results
  }

  private toDomainEntity(prismaTransaction: any): Transaction {
    return new Transaction({
      id: prismaTransaction.id,
      userId: prismaTransaction.userId,
      description: prismaTransaction.description,
      amount: new Decimal(Number(prismaTransaction.amount)),
      type: prismaTransaction.type as unknown as TransactionType,
      categoryId: prismaTransaction.categoryId,
      userCategoryId: prismaTransaction.userCategoryId || undefined, // 🚀 New hybrid architecture
      accountId: prismaTransaction.accountId,
      toAccountId: prismaTransaction.toAccountId || undefined,
      status: prismaTransaction.status as unknown as TransactionStatus,
      date: prismaTransaction.date,
      reference: prismaTransaction.reference || undefined,
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
      metadata: prismaTransaction.metadata as Record<string, any> || undefined
    })
  }
}
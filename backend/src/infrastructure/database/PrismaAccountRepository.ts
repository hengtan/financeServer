import { PrismaClient, Account as PrismaAccount, AccountType as PrismaAccountType, AccountStatus as PrismaAccountStatus } from '@prisma/client'
import { IAccountRepository } from '../../core/interfaces/repositories/IAccountRepository'
import { Account, AccountType, AccountStatus } from '../../core/entities/Account'
import { Service, Inject } from 'typedi'
import { Decimal } from 'decimal.js'

@Service()
export class PrismaAccountRepository implements IAccountRepository {
  constructor(@Inject('PrismaClient') private prisma: PrismaClient) {}

  async create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const created = await this.prisma.account.create({
      data: {
        userId: account.userId,
        name: account.name,
        type: account.type as PrismaAccountType,
        balance: new Decimal(account.balance),
        currency: account.currency,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        routingNumber: account.routingNumber,
        status: account.status as PrismaAccountStatus,
        isDefault: account.isDefault,
        creditLimit: account.creditLimit ? new Decimal(account.creditLimit) : null,
        interestRate: account.interestRate ? new Decimal(account.interestRate) : null,
        description: account.description,
        color: account.color,
        metadata: account.metadata
      }
    })

    return this.toDomainEntity(created)
  }

  async findById(id: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: { id }
    })

    return account ? this.toDomainEntity(account) : null
  }

  async findByUserId(userId: string, filters?: {
    type?: string
    status?: string
    isDefault?: boolean
    limit?: number
    offset?: number
  }): Promise<{
    accounts: Account[]
    total: number
  }> {
    const where: any = { userId }

    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.isDefault !== undefined) where.isDefault = filters.isDefault

    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'asc' }
        ],
        take: filters?.limit,
        skip: filters?.offset
      }),
      this.prisma.account.count({ where })
    ])

    return {
      accounts: accounts.map(a => this.toDomainEntity(a)),
      total
    }
  }

  async findByUserIdAndType(userId: string, type: string): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
        type: type as PrismaAccountType
      },
      orderBy: { createdAt: 'asc' }
    })

    return accounts.map(a => this.toDomainEntity(a))
  }

  async findDefaultByUserId(userId: string): Promise<Account | null> {
    const account = await this.prisma.account.findFirst({
      where: {
        userId,
        isDefault: true,
        status: 'ACTIVE'
      }
    })

    return account ? this.toDomainEntity(account) : null
  }

  async update(account: Account): Promise<Account> {
    const updateData: any = {
      name: account.name,
      type: account.type as AccountType,
      balance: new Decimal(account.balance),
      currency: account.currency,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      routingNumber: account.routingNumber,
      status: account.status as AccountStatus,
      isDefault: account.isDefault,
      creditLimit: account.creditLimit ? new Decimal(account.creditLimit) : null,
      interestRate: account.interestRate ? new Decimal(account.interestRate) : null,
      description: account.description,
      color: account.color,
      metadata: account.metadata
    }

    const updated = await this.prisma.account.update({
      where: { id: account.id },
      data: updateData
    })

    return this.toDomainEntity(updated)
  }

  async updateBalance(id: string, newBalance: number): Promise<Account> {
    const updated = await this.prisma.account.update({
      where: { id },
      data: {
        balance: new Decimal(newBalance)
      }
    })

    return this.toDomainEntity(updated)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.account.delete({
      where: { id }
    })
  }

  async existsByUserIdAndName(userId: string, name: string): Promise<boolean> {
    const account = await this.prisma.account.findFirst({
      where: {
        userId,
        name
      }
    })
    return !!account
  }

  async getTotalBalance(userId: string): Promise<number> {
    const result = await this.prisma.account.aggregate({
      where: {
        userId,
        status: 'ACTIVE'
      },
      _sum: {
        balance: true
      }
    })

    return Number(result._sum.balance || 0)
  }

  async getBalanceByType(userId: string): Promise<Array<{ type: string; total: number; count: number }>> {
    const result = await this.prisma.account.groupBy({
      by: ['type'],
      where: {
        userId,
        status: 'ACTIVE'
      },
      _sum: {
        balance: true
      },
      _count: {
        id: true
      }
    })

    return result.map(r => ({
      type: r.type,
      total: Number(r._sum.balance || 0),
      count: r._count.id
    }))
  }

  async setDefaultAccount(userId: string, accountId: string): Promise<void> {
    await this.prisma.$transaction([
      // Remove default from all accounts
      this.prisma.account.updateMany({
        where: { userId },
        data: { isDefault: false }
      }),
      // Set new default
      this.prisma.account.update({
        where: { id: accountId },
        data: { isDefault: true }
      })
    ])
  }

  private toDomainEntity(prismaAccount: PrismaAccount): Account {
    return new Account({
      id: prismaAccount.id,
      userId: prismaAccount.userId,
      name: prismaAccount.name,
      type: prismaAccount.type as unknown as AccountType,
      balance: new Decimal(Number(prismaAccount.balance)),
      currency: prismaAccount.currency,
      bankName: prismaAccount.bankName || undefined,
      accountNumber: prismaAccount.accountNumber || undefined,
      routingNumber: prismaAccount.routingNumber || undefined,
      status: prismaAccount.status as unknown as AccountStatus,
      isDefault: prismaAccount.isDefault,
      creditLimit: prismaAccount.creditLimit ? new Decimal(Number(prismaAccount.creditLimit)) : undefined,
      interestRate: prismaAccount.interestRate ? new Decimal(Number(prismaAccount.interestRate)) : undefined,
      description: prismaAccount.description || undefined,
      color: prismaAccount.color || undefined,
      createdAt: prismaAccount.createdAt,
      updatedAt: prismaAccount.updatedAt,
      metadata: prismaAccount.metadata as Record<string, any> || undefined
    })
  }
}
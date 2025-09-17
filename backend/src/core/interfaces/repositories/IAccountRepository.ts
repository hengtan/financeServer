import { Account } from '../../entities/Account'

export interface IAccountRepository {
  findById(id: string): Promise<Account | null>
  findByUserId(userId: string, filters?: {
    type?: string
    status?: string
    isDefault?: boolean
    limit?: number
    offset?: number
  }): Promise<{
    accounts: Account[]
    total: number
  }>
  create(account: Account): Promise<Account>
  update(account: Account): Promise<Account>
  delete(id: string): Promise<void>
  findDefaultByUserId(userId: string): Promise<Account | null>
  existsByUserIdAndName(userId: string, name: string): Promise<boolean>
}
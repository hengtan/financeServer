import { User } from '../../entities/User'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(user: User): Promise<User>
  update(user: User): Promise<User>
  delete(id: string): Promise<void>
  existsByEmail(email: string): Promise<boolean>
  findAll(filters?: {
    status?: string
    role?: string
    limit?: number
    offset?: number
    search?: string
  }): Promise<{
    users: User[]
    total: number
  }>
}
import { Service, Inject } from 'typedi'
import { PrismaClient } from '@prisma/client'
import { User, UserRole, UserStatus } from '../../core/entities/User'
import { IUserRepository } from '../../core/interfaces/repositories/IUserRepository'

@Service()
export class PrismaUserRepository implements IUserRepository {
  constructor(@Inject('PrismaClient') private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id }
    })

    return userData ? this.toDomain(userData) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    return userData ? this.toDomain(userData) : null
  }

  async create(user: User): Promise<User> {
    const userData = await this.prisma.user.create({
      data: this.toPersistence(user)
    })

    return this.toDomain(userData)
  }

  async update(user: User): Promise<User> {
    const userData = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...this.toPersistence(user),
        updatedAt: new Date()
      }
    })

    return this.toDomain(userData)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    })
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase() }
    })

    return count > 0
  }

  async findAll(filters?: {
    status?: string
    role?: string
    limit?: number
    offset?: number
    search?: string
  }): Promise<{ users: User[]; total: number }> {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.role) {
      where.role = filters.role
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ])

    return {
      users: users.map(userData => this.toDomain(userData)),
      total
    }
  }

  private toDomain(userData: any): User {
    return new User({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      password: userData.passwordHash,
      role: userData.role as UserRole,
      status: userData.status as UserStatus,
      avatarUrl: userData.avatarUrl,
      phoneNumber: userData.phoneNumber,
      twoFactorEnabled: userData.twoFactorEnabled,
      twoFactorSecret: userData.twoFactorSecret,
      lastLoginAt: userData.lastLoginAt,
      emailVerifiedAt: userData.emailVerifiedAt,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      metadata: userData.metadata
    })
  }

  private toPersistence(user: User): any {
    const data = user.toJSON()
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: (user as any).passwordHash,
      role: data.role,
      status: data.status,
      avatarUrl: data.avatarUrl,
      phoneNumber: data.phoneNumber,
      twoFactorEnabled: data.twoFactorEnabled,
      twoFactorSecret: data.twoFactorSecret,
      lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : null,
      emailVerifiedAt: data.emailVerifiedAt ? new Date(data.emailVerifiedAt) : null,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      metadata: data.metadata
    }
  }
}
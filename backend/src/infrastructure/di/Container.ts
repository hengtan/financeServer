import { Container } from 'typedi'
import { PrismaService } from '../database/PrismaService'
import { PrismaUserRepository } from '../database/PrismaUserRepository'
import { PrismaTransactionRepository } from '../database/PrismaTransactionRepository'
import { PrismaAccountRepository } from '../database/PrismaAccountRepository'
import { PrismaCategoryRepository } from '../database/PrismaCategoryRepository'
import { IUserRepository } from '../../core/interfaces/repositories/IUserRepository'
import { ITransactionRepository } from '../../core/interfaces/repositories/ITransactionRepository'
import { IAccountRepository } from '../../core/interfaces/repositories/IAccountRepository'
import { ICategoryRepository } from '../../core/interfaces/repositories/ICategoryRepository'
import { TransactionService } from '../../services/TransactionService'
import { AuthService } from '../../services/AuthService'
import { RedisService } from '../cache/RedisService'

export function setupContainer() {
  // Database
  const prismaService = new PrismaService()
  const prismaClient = prismaService.getClient()
  Container.set('PrismaClient', prismaClient)
  Container.set(PrismaService, prismaService)

  // Redis
  Container.set(RedisService, new RedisService())

  // Repositories - Create instances with explicit dependency injection
  Container.set('IUserRepository', new PrismaUserRepository(prismaClient))
  Container.set('ITransactionRepository', new PrismaTransactionRepository(prismaClient))
  Container.set('IAccountRepository', new PrismaAccountRepository(prismaClient))
  Container.set('ICategoryRepository', new PrismaCategoryRepository(prismaClient))

  // Services are automatically resolved by TypeDI when requested

  console.log('✅ Dependency injection container configured')
}

export { Container }
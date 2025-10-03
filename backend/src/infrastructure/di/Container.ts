import { Container } from 'typedi'
import { PrismaService } from '../database/PrismaService'
import { PrismaUserRepository } from '../database/PrismaUserRepository'
import { PrismaTransactionRepository } from '../database/PrismaTransactionRepository'
import { PrismaAccountRepository } from '../database/PrismaAccountRepository'
import { PrismaCategoryRepository } from '../database/PrismaCategoryRepository'
import { PrismaCategoryTemplateRepository } from '../database/PrismaCategoryTemplateRepository'
import { PrismaUserCategoryRepository } from '../database/PrismaUserCategoryRepository'
import { PrismaGoalRepository } from '../database/PrismaGoalRepository'
import { PrismaBudgetRepository } from '../database/PrismaBudgetRepository'
import { PrismaReportRepository } from '../database/PrismaReportRepository'
import { PrismaAlertRepository } from '../database/PrismaAlertRepository'
import { IUserRepository } from '../../core/interfaces/repositories/IUserRepository'
import { ITransactionRepository } from '../../core/interfaces/repositories/ITransactionRepository'
import { IAccountRepository } from '../../core/interfaces/repositories/IAccountRepository'
import { ICategoryRepository } from '../../core/interfaces/repositories/ICategoryRepository'
import { ICategoryTemplateRepository } from '../../core/interfaces/repositories/ICategoryTemplateRepository'
import { IUserCategoryRepository } from '../../core/interfaces/repositories/IUserCategoryRepository'
import { IGoalRepository } from '../../core/interfaces/repositories/IGoalRepository'
import { IBudgetRepository } from '../../core/interfaces/repositories/IBudgetRepository'
import { IReportRepository } from '../../core/interfaces/repositories/IReportRepository'
import { IAlertRepository } from '../../core/interfaces/repositories/IAlertRepository'
import { TransactionService } from '../../services/TransactionService'
import { AuthService } from '../../services/AuthService'
import { UserCategoryService } from '../../services/UserCategoryService'
import { CategoryTemplateService } from '../../services/CategoryTemplateService'
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

  // 🚀 New hybrid category architecture repositories
  const categoryTemplateRepository = new PrismaCategoryTemplateRepository(prismaClient)
  Container.set('ICategoryTemplateRepository', categoryTemplateRepository)
  Container.set('IUserCategoryRepository', new PrismaUserCategoryRepository(prismaClient, categoryTemplateRepository))

  Container.set('IGoalRepository', new PrismaGoalRepository(prismaClient))
  Container.set('IBudgetRepository', new PrismaBudgetRepository(prismaClient))
  Container.set('IReportRepository', new PrismaReportRepository(prismaClient))
  Container.set('IAlertRepository', new PrismaAlertRepository(prismaClient))

  // Services
  const redisService = Container.get(RedisService)
  Container.set(CategoryTemplateService, new CategoryTemplateService(categoryTemplateRepository, redisService))
  Container.set(UserCategoryService, new UserCategoryService(
    Container.get('IUserCategoryRepository') as any,
    categoryTemplateRepository,
    redisService
  ))

  console.log('✅ Dependency injection container configured')
}

export { Container }
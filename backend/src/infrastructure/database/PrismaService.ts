import { PrismaClient } from '@prisma/client'
import { Service } from 'typedi'

@Service()
export class PrismaService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['warn', 'error'],
      errorFormat: 'pretty'
    })

    // Connect on instantiation
    this.connect()
  }

  private async connect() {
    try {
      await this.prisma.$connect()
      console.log('✅ Database connected successfully')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      process.exit(1)
    }
  }

  getClient(): PrismaClient {
    return this.prisma
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'connected', message: 'Database is healthy' }
    } catch (error) {
      return { status: 'error', message: 'Database connection failed' }
    }
  }
}
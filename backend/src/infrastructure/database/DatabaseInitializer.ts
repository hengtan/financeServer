import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'
import { SandboxService } from '../../services/SandboxService'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

export class DatabaseInitializer {
  private sandboxService: SandboxService

  constructor() {
    this.sandboxService = new SandboxService()
  }

  /**
   * Verifica se as tabelas do banco existem
   */
  private async checkTablesExist(): Promise<boolean> {
    try {
      // Tenta fazer uma query simples na tabela users
      await prisma.$queryRaw`SELECT 1 FROM "users" LIMIT 1`
      return true
    } catch (error) {
      // Se der erro, é porque a tabela não existe
      return false
    }
  }

  /**
   * Executa as migrações do Prisma
   */
  private async runMigrations(): Promise<void> {
    console.log('🔄 Running database migrations...')

    try {
      const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
        cwd: process.cwd(),
        env: { ...process.env }
      })

      if (stdout) console.log(stdout)
      if (stderr) console.error('Migration warnings:', stderr)

      console.log('✅ Migrations completed successfully')
    } catch (error: any) {
      console.error('❌ Failed to run migrations:', error.message)
      throw error
    }
  }

  /**
   * Gera o Prisma Client (necessário após migrações)
   */
  private async generatePrismaClient(): Promise<void> {
    console.log('🔄 Generating Prisma Client...')

    try {
      const { stdout } = await execAsync('npx prisma generate', {
        cwd: process.cwd(),
        env: { ...process.env }
      })

      if (stdout) console.log(stdout)
      console.log('✅ Prisma Client generated successfully')
    } catch (error: any) {
      console.error('❌ Failed to generate Prisma Client:', error.message)
      throw error
    }
  }

  /**
   * Inicializa o banco de dados e cria dados iniciais
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing database...')

      // Verifica se as tabelas existem
      const tablesExist = await this.checkTablesExist()

      if (!tablesExist) {
        console.log('⚠️  Database tables not found. Running migrations...')

        // Gera o Prisma Client primeiro
        await this.generatePrismaClient()

        // Executa as migrações
        await this.runMigrations()

        console.log('✅ Database schema created successfully')
      } else {
        console.log('✅ Database tables already exist')

        // Mesmo que as tabelas existam, pode haver novas migrações
        try {
          await this.runMigrations()
        } catch (error) {
          // Se não houver migrações pendentes, ignore o erro
          console.log('ℹ️  No pending migrations')
        }
      }

      // Sempre garante que o usuário sandbox existe com dados
      await this.ensureSandboxUser()

      console.log('✅ Database initialization completed')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      throw error
    }
  }

  /**
   * Garante que o usuário sandbox existe com dados
   */
  private async ensureSandboxUser(): Promise<void> {
    try {
      console.log('🔍 Checking sandbox user...')

      const sandboxUser = await prisma.user.findUnique({
        where: { email: 'sandbox@financeserver.dev' }
      })

      if (!sandboxUser) {
        console.log('📝 Creating sandbox user...')
        await this.sandboxService.seedSandboxUser()
      } else {
        console.log('✅ Sandbox user already exists')

        // Verifica se tem dados (transações)
        const transactionCount = await prisma.transaction.count({
          where: { userId: sandboxUser.id }
        })

        if (transactionCount === 0) {
          console.log('📝 Seeding sandbox user data...')
          await this.sandboxService.seedSandboxUser()
        } else {
          console.log(`✅ Sandbox user has ${transactionCount} transactions`)
        }
      }
    } catch (error) {
      console.error('⚠️  Failed to ensure sandbox user:', error)
      // Não lança erro para não quebrar a inicialização
    }
  }

  /**
   * Desconecta o Prisma Client
   */
  async disconnect(): Promise<void> {
    await prisma.$disconnect()
  }
}

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export class SandboxService {
  private readonly SANDBOX_EMAIL = 'sandbox@financeserver.dev'

  /**
   * Verifica se um usuário é o usuário sandbox
   */
  isSandboxUser(email: string): boolean {
    return email === this.SANDBOX_EMAIL
  }

  /**
   * Limpa todos os dados do usuário sandbox
   */
  async resetSandboxUser(): Promise<void> {
    console.log('🧹 Starting sandbox user data cleanup...')

    const sandboxUser = await prisma.user.findUnique({
      where: { email: this.SANDBOX_EMAIL }
    })

    if (!sandboxUser) {
      console.log('⚠️ Sandbox user not found')
      return
    }

    // Deletar em ordem correta (respeitando foreign keys)
    await prisma.transaction.deleteMany({ where: { userId: sandboxUser.id } })
    await prisma.budget.deleteMany({ where: { userId: sandboxUser.id } })
    await prisma.goal.deleteMany({ where: { userId: sandboxUser.id } })
    await prisma.account.deleteMany({ where: { userId: sandboxUser.id } })
    await prisma.userCategory.deleteMany({ where: { userId: sandboxUser.id } })

    console.log('✅ Sandbox user data cleaned')
  }

  /**
   * Recria os dados de exemplo do usuário sandbox
   */
  async seedSandboxUser(): Promise<void> {
    console.log('🌱 Starting sandbox user data seeding...')

    const passwordHash = await bcrypt.hash('sandbox', 12)

    // Upsert do usuário sandbox
    const sandboxUser = await prisma.user.upsert({
      where: { email: this.SANDBOX_EMAIL },
      update: {},
      create: {
        email: this.SANDBOX_EMAIL,
        name: 'Henrique Santos',
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        phoneNumber: '+5511987654321',
      },
    })

    console.log('👤 Sandbox user ensured:', sandboxUser.email)

    // Criar category templates (system-wide, não deletamos)
    const categoryTemplates = [
      // INCOME CATEGORIES
      { name: 'Salário', type: 'INCOME', color: '#10b981', icon: '💼', isDefault: true, sortOrder: 1 },
      { name: 'Freelance', type: 'INCOME', color: '#059669', icon: '💻', isDefault: true, sortOrder: 2 },
      { name: 'Investimentos', type: 'INCOME', color: '#0d9488', icon: '📈', isDefault: true, sortOrder: 3 },

      // EXPENSE CATEGORIES
      { name: 'Alimentação', type: 'EXPENSE', color: '#f59e0b', icon: '🍽️', isDefault: true, sortOrder: 101 },
      { name: 'Transporte', type: 'EXPENSE', color: '#3b82f6', icon: '🚗', isDefault: true, sortOrder: 102 },
      { name: 'Moradia', type: 'EXPENSE', color: '#8b5cf6', icon: '🏠', isDefault: true, sortOrder: 103 },
      { name: 'Saúde', type: 'EXPENSE', color: '#ec4899', icon: '⚕️', isDefault: true, sortOrder: 104 },
      { name: 'Educação', type: 'EXPENSE', color: '#6366f1', icon: '📚', isDefault: true, sortOrder: 105 },
      { name: 'Lazer', type: 'EXPENSE', color: '#a855f7', icon: '🎬', isDefault: true, sortOrder: 106 },
      { name: 'Compras', type: 'EXPENSE', color: '#ef4444', icon: '🛍️', isDefault: true, sortOrder: 107 },
    ]

    // Upsert category templates
    for (const template of categoryTemplates) {
      await prisma.categoryTemplate.upsert({
        where: {
          name_type: {
            name: template.name,
            type: template.type as any
          }
        },
        update: {},
        create: template as any,
      })
    }

    // Criar user categories do sandbox
    const userCategories = []
    for (const template of categoryTemplates) {
      const userCategory = await prisma.userCategory.create({
        data: {
          userId: sandboxUser.id,
          name: template.name,
          type: template.type as any,
          color: template.color,
          icon: template.icon,
        },
      })
      userCategories.push(userCategory)
    }

    console.log('📁 Created', userCategories.length, 'user categories')

    // Criar contas
    const accounts = [
      { name: 'Banco Caixa', type: 'CHECKING', balance: 3500.50, currency: 'BRL', color: '#0066CC' },
      { name: 'Banco Inter', type: 'CHECKING', balance: 1200.00, currency: 'BRL', color: '#FF7A00' },
      { name: 'Banco Itau', type: 'SAVINGS', balance: 5800.75, currency: 'BRL', color: '#EC7000' },
      { name: 'Carteira', type: 'OTHER', balance: 350.00, currency: 'BRL', color: '#10b981' },
      { name: 'Mercado Pago', type: 'OTHER', balance: 890.25, currency: 'BRL', color: '#00AAFF' },
    ]

    const createdAccounts = []
    for (const acc of accounts) {
      const account = await prisma.account.create({
        data: {
          ...acc,
          userId: sandboxUser.id,
          status: 'ACTIVE',
        },
      })
      createdAccounts.push(account)
    }

    console.log('💳 Created', createdAccounts.length, 'accounts')

    // Criar transações dos últimos 12 meses
    const transactions = []
    const now = new Date()

    // Categorias mapeadas
    const salarioCategory = userCategories.find(c => c.name === 'Salário')
    const freelanceCategory = userCategories.find(c => c.name === 'Freelance')
    const alimentacaoCategory = userCategories.find(c => c.name === 'Alimentação')
    const transporteCategory = userCategories.find(c => c.name === 'Transporte')
    const moradiaCategory = userCategories.find(c => c.name === 'Moradia')
    const lazerCategory = userCategories.find(c => c.name === 'Lazer')

    const bancoCaixa = createdAccounts[0]
    const bancoInter = createdAccounts[1]
    const carteira = createdAccounts[3]

    // Salário mensal (últimos 12 meses)
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i)
      date.setDate(5) // Dia 5 de cada mês

      transactions.push({
        userId: sandboxUser.id,
        accountId: bancoCaixa.id,
        userCategoryId: salarioCategory?.id,
        description: 'Salário',
        amount: 8500.00,
        type: 'INCOME',
        date,
        status: 'COMPLETED',
      })
    }

    // Freelance ocasional
    const freelanceDates = [
      new Date('2025-03-15'),
      new Date('2025-05-20'),
      new Date('2025-07-10'),
      new Date('2025-08-25'),
      new Date('2025-10-18'),
    ]

    for (const date of freelanceDates) {
      if (date <= now) {
        transactions.push({
          userId: sandboxUser.id,
          accountId: bancoInter.id,
          userCategoryId: freelanceCategory?.id,
          description: 'Projeto Freelance',
          amount: 2500.00 + Math.random() * 1500,
          type: 'INCOME',
          date,
          status: 'COMPLETED',
        })
      }
    }

    // Mercado semanal (últimos 6 meses, 4 vezes por mês)
    for (let month = 5; month >= 0; month--) {
      for (let week = 0; week < 4; week++) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - month)
        date.setDate(7 + (week * 7))

        transactions.push({
          userId: sandboxUser.id,
          accountId: carteira.id,
          userCategoryId: alimentacaoCategory?.id,
          description: `Mercado - Semana ${week + 1}`,
          amount: (350 + Math.random() * 200),
          type: 'EXPENSE',
          date,
          status: 'COMPLETED',
        })
      }
    }

    // Transporte (Uber, gasolina - últimos 6 meses)
    for (let month = 5; month >= 0; month--) {
      for (let day = 0; day < 8; day++) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - month)
        date.setDate(3 + (day * 3))

        const isUber = Math.random() > 0.5
        transactions.push({
          userId: sandboxUser.id,
          accountId: carteira.id,
          userCategoryId: transporteCategory?.id,
          description: isUber ? 'Uber' : 'Gasolina',
          amount: isUber ? (25 + Math.random() * 30) : (150 + Math.random() * 50),
          type: 'EXPENSE',
          date,
          status: 'COMPLETED',
        })
      }
    }

    // Aluguel mensal
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i)
      date.setDate(10)

      transactions.push({
        userId: sandboxUser.id,
        accountId: bancoCaixa.id,
        userCategoryId: moradiaCategory?.id,
        description: 'Aluguel',
        amount: 2500.00,
        type: 'EXPENSE',
        date,
        status: 'COMPLETED',
      })
    }

    // Lazer (cinema, restaurantes - últimos 6 meses)
    for (let month = 5; month >= 0; month--) {
      for (let event = 0; event < 3; event++) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - month)
        date.setDate(5 + (event * 8))

        const activities = ['Cinema', 'Restaurante', 'Show', 'Teatro']
        transactions.push({
          userId: sandboxUser.id,
          accountId: carteira.id,
          userCategoryId: lazerCategory?.id,
          description: activities[Math.floor(Math.random() * activities.length)],
          amount: (80 + Math.random() * 120),
          type: 'EXPENSE',
          date,
          status: 'COMPLETED',
        })
      }
    }

    // Inserir todas as transações
    await prisma.transaction.createMany({ data: transactions as any })
    console.log('💰 Created', transactions.length, 'transactions')

    // Criar metas
    const goals = [
      {
        userId: sandboxUser.id,
        name: 'Viagem para Europa',
        targetAmount: 15000.00,
        currentAmount: 4500.00,
        targetDate: new Date('2026-06-01'),
        status: 'ACTIVE',
        color: '#3b82f6',
      },
      {
        userId: sandboxUser.id,
        name: 'Fundo de Emergência',
        targetAmount: 30000.00,
        currentAmount: 12000.00,
        targetDate: new Date('2025-12-31'),
        status: 'ACTIVE',
        color: '#10b981',
      },
    ]

    await prisma.goal.createMany({ data: goals as any })
    console.log('🎯 Created', goals.length, 'goals')

    console.log('✅ Sandbox user data seeded successfully')
  }

  /**
   * Reset completo: limpa e recria dados
   */
  async resetAndSeed(): Promise<void> {
    await this.resetSandboxUser()
    await this.seedSandboxUser()
  }
}

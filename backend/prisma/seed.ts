import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sandbox user
  const passwordHash = await bcrypt.hash('sandbox', 12)

  const sandboxUser = await prisma.user.upsert({
    where: { email: 'sandbox@financeserver.dev' },
    update: {},
    create: {
      email: 'sandbox@financeserver.dev',
      name: 'Usuário Sandbox',
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  })

  console.log('👤 Sandbox user created:', sandboxUser.email)

  // Create system categories
  const incomeCategory = await prisma.category.upsert({
    where: { id: 'system_income' },
    update: {},
    create: {
      id: 'system_income',
      userId: sandboxUser.id,
      name: 'Renda',
      description: 'Categoria padrão para receitas',
      type: 'INCOME',
      color: '#10B981',
      icon: '💰',
      isSystem: true,
      isDefault: true,
      status: 'ACTIVE',
      tags: ['sistema', 'renda']
    }
  })

  const expenseCategory = await prisma.category.upsert({
    where: { id: 'system_expense' },
    update: {},
    create: {
      id: 'system_expense',
      userId: sandboxUser.id,
      name: 'Gastos Gerais',
      description: 'Categoria padrão para despesas',
      type: 'EXPENSE',
      color: '#EF4444',
      icon: '💸',
      isSystem: true,
      isDefault: true,
      status: 'ACTIVE',
      tags: ['sistema', 'gasto']
    }
  })

  console.log('📂 System categories created')

  // Create default account
  const defaultAccount = await prisma.account.upsert({
    where: { id: 'sandbox_account' },
    update: {},
    create: {
      id: 'sandbox_account',
      userId: sandboxUser.id,
      name: 'Conta Principal',
      type: 'CHECKING',
      balance: 1000.00,
      currency: 'BRL',
      description: 'Conta padrão do usuário sandbox',
      color: '#3B82F6',
      isDefault: true,
      status: 'ACTIVE'
    }
  })

  console.log('🏦 Default account created')

  // Create sample transactions
  const transactions = [
    {
      description: 'Salário',
      amount: 5000.00,
      type: 'INCOME',
      categoryId: incomeCategory.id,
      accountId: defaultAccount.id,
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date: new Date('2024-01-01')
    },
    {
      description: 'Supermercado',
      amount: 250.00,
      type: 'EXPENSE',
      categoryId: expenseCategory.id,
      accountId: defaultAccount.id,
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date: new Date('2024-01-02')
    },
    {
      description: 'Freelance',
      amount: 800.00,
      type: 'INCOME',
      categoryId: incomeCategory.id,
      accountId: defaultAccount.id,
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date: new Date('2024-01-03')
    }
  ]

  for (const transactionData of transactions) {
    await prisma.transaction.create({
      data: transactionData
    })
  }

  console.log('💳 Sample transactions created')

  // Update account balance
  await prisma.account.update({
    where: { id: defaultAccount.id },
    data: {
      balance: 5550.00 // 5000 + 800 - 250
    }
  })

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
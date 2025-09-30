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

  // Create sample categories for better reporting
  const categories = [
    {
      id: 'cat_alimentacao',
      name: 'Alimentação',
      description: 'Gastos com comida e bebida',
      type: 'EXPENSE',
      color: '#F59E0B',
      icon: '🍽️'
    },
    {
      id: 'cat_transporte',
      name: 'Transporte',
      description: 'Gastos com locomoção',
      type: 'EXPENSE',
      color: '#3B82F6',
      icon: '🚗'
    },
    {
      id: 'cat_entretenimento',
      name: 'Entretenimento',
      description: 'Gastos com lazer e diversão',
      type: 'EXPENSE',
      color: '#8B5CF6',
      icon: '🎬'
    },
    {
      id: 'cat_salario',
      name: 'Salário',
      description: 'Renda do trabalho',
      type: 'INCOME',
      color: '#10B981',
      icon: '💼'
    },
    {
      id: 'cat_investimentos',
      name: 'Investimentos',
      description: 'Rendimentos de investimentos',
      type: 'INCOME',
      color: '#059669',
      icon: '📈'
    }
  ]

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { id: categoryData.id },
      update: {},
      create: {
        ...categoryData,
        userId: sandboxUser.id,
        isSystem: false,
        isDefault: false,
        status: 'ACTIVE',
        tags: [categoryData.type.toLowerCase()]
      }
    })
  }

  console.log('📁 Additional categories created')

  // Create more sample transactions for better analytics
  const additionalTransactions = [
    // Janeiro 2025
    { description: 'Uber', amount: 45.50, type: 'EXPENSE', categoryId: 'cat_transporte', date: new Date('2025-01-05') },
    { description: 'Netflix', amount: 32.90, type: 'EXPENSE', categoryId: 'cat_entretenimento', date: new Date('2025-01-08') },
    { description: 'Restaurante', amount: 89.90, type: 'EXPENSE', categoryId: 'cat_alimentacao', date: new Date('2025-01-10') },
    { description: 'Dividendos', amount: 150.00, type: 'INCOME', categoryId: 'cat_investimentos', date: new Date('2025-01-15') },

    // Fevereiro 2025
    { description: 'Salário Fevereiro', amount: 5200.00, type: 'INCOME', categoryId: 'cat_salario', date: new Date('2025-02-01') },
    { description: 'Gasolina', amount: 120.00, type: 'EXPENSE', categoryId: 'cat_transporte', date: new Date('2025-02-03') },
    { description: 'Cinema', amount: 45.00, type: 'EXPENSE', categoryId: 'cat_entretenimento', date: new Date('2025-02-07') },
    { description: 'Mercado', amount: 280.50, type: 'EXPENSE', categoryId: 'cat_alimentacao', date: new Date('2025-02-12') },

    // Março 2025 (mais recente)
    { description: 'Salário Março', amount: 5200.00, type: 'INCOME', categoryId: 'cat_salario', date: new Date('2025-03-01') },
    { description: 'Aplicativo de transporte', amount: 28.90, type: 'EXPENSE', categoryId: 'cat_transporte', date: new Date('2025-03-05') },
    { description: 'Streaming', amount: 19.90, type: 'EXPENSE', categoryId: 'cat_entretenimento', date: new Date('2025-03-08') },
    { description: 'Almoço', amount: 35.00, type: 'EXPENSE', categoryId: 'cat_alimentacao', date: new Date('2025-03-10') },
    { description: 'Rendimento CDB', amount: 85.40, type: 'INCOME', categoryId: 'cat_investimentos', date: new Date('2025-03-15') },
  ]

  for (const transactionData of additionalTransactions) {
    await prisma.transaction.create({
      data: {
        ...transactionData,
        accountId: defaultAccount.id,
        userId: sandboxUser.id,
        status: 'COMPLETED'
      }
    })
  }

  console.log('📊 Additional transactions for analytics created')

  // Create sample goals
  const goals = [
    {
      id: 'goal_emergency',
      name: 'Reserva de Emergência',
      description: 'Meta para reserva de emergência de 6 meses',
      targetAmount: 30000.00,
      currentAmount: 8500.00,
      targetDate: new Date('2025-12-31'),
      status: 'ACTIVE',
      color: '#EF4444'
    },
    {
      id: 'goal_vacation',
      name: 'Viagem de Férias',
      description: 'Economizar para viagem de férias',
      targetAmount: 5000.00,
      currentAmount: 1250.00,
      targetDate: new Date('2025-07-01'),
      status: 'ACTIVE',
      color: '#3B82F6'
    }
  ]

  for (const goalData of goals) {
    await prisma.goal.upsert({
      where: { id: goalData.id },
      update: {},
      create: {
        ...goalData,
        userId: sandboxUser.id
      }
    })
  }

  console.log('🎯 Sample goals created')

  // Create sample reports
  const reports = [
    {
      id: 'report_financial_summary',
      name: 'Resumo Financeiro Março 2025',
      description: 'Relatório completo das finanças de março',
      type: 'FINANCIAL_SUMMARY',
      status: 'COMPLETED',
      format: 'JSON',
      config: {
        name: 'Resumo Financeiro Março',
        type: 'FINANCIAL_SUMMARY',
        filters: {
          dateFrom: new Date('2025-03-01'),
          dateTo: new Date('2025-03-31')
        },
        format: 'JSON'
      },
      data: {
        summary: {
          period: { start: '2025-03-01', end: '2025-03-31' },
          totalIncome: 5285.40,
          totalExpenses: 83.80,
          netIncome: 5201.60,
          transactionsCount: 6,
          averageTransaction: 878.20
        }
      },
      generatedAt: new Date('2025-03-16T10:30:00Z'),
      expiresAt: new Date('2025-04-16T10:30:00Z')
    },
    {
      id: 'report_category_analysis',
      name: 'Análise por Categoria - Trimestre',
      description: 'Análise detalhada dos gastos por categoria',
      type: 'CATEGORY_ANALYSIS',
      status: 'COMPLETED',
      format: 'JSON',
      config: {
        name: 'Análise por Categoria',
        type: 'CATEGORY_ANALYSIS',
        filters: {
          dateFrom: new Date('2025-01-01'),
          dateTo: new Date('2025-03-31')
        },
        format: 'JSON'
      },
      data: {
        categories: [
          { categoryName: 'Alimentação', expense: 405.40, income: 0, transactionCount: 4 },
          { categoryName: 'Transporte', expense: 194.40, income: 0, transactionCount: 3 },
          { categoryName: 'Entretenimento', expense: 97.80, income: 0, transactionCount: 3 }
        ]
      },
      generatedAt: new Date('2025-03-10T14:15:00Z'),
      expiresAt: new Date('2025-06-10T14:15:00Z')
    }
  ]

  for (const reportData of reports) {
    await prisma.report.upsert({
      where: { id: reportData.id },
      update: {},
      create: {
        ...reportData,
        userId: sandboxUser.id
      }
    })
  }

  console.log('📈 Sample reports created')

  // Create sample alerts
  const alerts = [
    {
      id: 'alert_high_spending',
      type: 'HIGH_SPENDING',
      severity: 'MEDIUM',
      status: 'ACTIVE',
      title: 'Gastos Elevados Detectados',
      message: 'Seus gastos com alimentação este mês estão 20% acima da média.',
      description: 'Detectamos um aumento nos gastos com alimentação. Considere revisar seus hábitos de consumo.',
      data: {
        amount: 405.40,
        category: 'Alimentação',
        comparison: {
          current: 405.40,
          previous: 337.83,
          change: 67.57,
          changePercentage: 20.0
        },
        suggestions: [
          'Considere cozinhar mais em casa',
          'Procure por promoções no supermercado',
          'Evite pedidos de delivery frequentes'
        ]
      },
      actionUrl: '/transactions?category=alimentacao',
      actionText: 'Ver Transações',
      triggeredAt: new Date('2025-03-16T09:00:00Z'),
      expiresAt: new Date('2025-03-23T09:00:00Z'),
      channels: ['IN_APP', 'EMAIL']
    },
    {
      id: 'alert_goal_milestone',
      type: 'GOAL_MILESTONE',
      severity: 'LOW',
      status: 'READ',
      title: 'Meta de Viagem Atingiu 25%!',
      message: 'Parabéns! Você atingiu 25% da sua meta de viagem de férias.',
      description: 'Continue economizando neste ritmo e você alcançará sua meta antes do prazo.',
      data: {
        goal: {
          name: 'Viagem de Férias',
          targetAmount: 5000.00,
          currentAmount: 1250.00,
          percentage: 25.0
        },
        suggestions: [
          'Mantenha o ritmo de economia',
          'Considere investir em renda fixa para render mais'
        ]
      },
      actionUrl: '/goals',
      actionText: 'Ver Metas',
      triggeredAt: new Date('2025-03-15T12:30:00Z'),
      readAt: new Date('2025-03-15T18:45:00Z'),
      expiresAt: new Date('2025-04-15T12:30:00Z'),
      channels: ['IN_APP']
    },
    {
      id: 'alert_investment_income',
      type: 'INCOME_RECEIVED',
      severity: 'LOW',
      status: 'ACTIVE',
      title: 'Rendimento de Investimento Recebido',
      message: 'Você recebeu R$ 85,40 de rendimento do seu CDB.',
      description: 'Seus investimentos estão gerando bons retornos. Continue investindo!',
      data: {
        amount: 85.40,
        account: 'Conta Principal',
        transaction: {
          description: 'Rendimento CDB',
          date: '2025-03-15'
        }
      },
      actionUrl: '/transactions',
      actionText: 'Ver Detalhes',
      triggeredAt: new Date('2025-03-15T15:20:00Z'),
      expiresAt: new Date('2025-03-22T15:20:00Z'),
      channels: ['IN_APP']
    },
    {
      id: 'alert_unusual_transaction',
      type: 'UNUSUAL_TRANSACTION',
      severity: 'MEDIUM',
      status: 'DISMISSED',
      title: 'Transação Incomum Detectada',
      message: 'Transação de R$ 280,50 no mercado está acima da sua média.',
      description: 'Esta transação está 3x acima da sua média de gastos com alimentação.',
      data: {
        amount: 280.50,
        transaction: {
          description: 'Mercado',
          date: '2025-02-12'
        },
        comparison: {
          current: 280.50,
          previous: 93.50,
          change: 187.00,
          changePercentage: 200.0
        }
      },
      triggeredAt: new Date('2025-02-12T19:30:00Z'),
      dismissedAt: new Date('2025-02-13T08:15:00Z'),
      expiresAt: new Date('2025-02-19T19:30:00Z'),
      channels: ['IN_APP', 'EMAIL']
    }
  ]

  for (const alertData of alerts) {
    await prisma.alert.upsert({
      where: { id: alertData.id },
      update: {},
      create: {
        ...alertData,
        userId: sandboxUser.id
      }
    })
  }

  console.log('🚨 Sample alerts created')

  console.log('✅ Database seeding completed with Reports and Alerts!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
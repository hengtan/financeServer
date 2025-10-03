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
      { name: 'Bônus', type: 'INCOME', color: '#14b8a6', icon: '🎁', isDefault: true, sortOrder: 4 },
      { name: 'Dividendos', type: 'INCOME', color: '#06b6d4', icon: '💰', isDefault: true, sortOrder: 5 },
      { name: 'Vendas', type: 'INCOME', color: '#22c55e', icon: '🏪', isDefault: true, sortOrder: 6 },

      // EXPENSE CATEGORIES
      { name: 'Alimentação', type: 'EXPENSE', color: '#f59e0b', icon: '🍽️', isDefault: true, sortOrder: 101 },
      { name: 'Transporte', type: 'EXPENSE', color: '#3b82f6', icon: '🚗', isDefault: true, sortOrder: 102 },
      { name: 'Moradia', type: 'EXPENSE', color: '#8b5cf6', icon: '🏠', isDefault: true, sortOrder: 103 },
      { name: 'Saúde', type: 'EXPENSE', color: '#ec4899', icon: '⚕️', isDefault: true, sortOrder: 104 },
      { name: 'Educação', type: 'EXPENSE', color: '#6366f1', icon: '📚', isDefault: true, sortOrder: 105 },
      { name: 'Lazer', type: 'EXPENSE', color: '#a855f7', icon: '🎬', isDefault: true, sortOrder: 106 },
      { name: 'Compras', type: 'EXPENSE', color: '#ef4444', icon: '🛍️', isDefault: true, sortOrder: 107 },
      { name: 'Assinaturas', type: 'EXPENSE', color: '#f97316', icon: '📱', isDefault: true, sortOrder: 108 },
      { name: 'Impostos', type: 'EXPENSE', color: '#dc2626', icon: '📄', isDefault: true, sortOrder: 109 },
      { name: 'Pet', type: 'EXPENSE', color: '#fb923c', icon: '🐾', isDefault: true, sortOrder: 110 },
      { name: 'Vestuário', type: 'EXPENSE', color: '#f472b6', icon: '👔', isDefault: true, sortOrder: 111 },
      { name: 'Viagens', type: 'EXPENSE', color: '#38bdf8', icon: '✈️', isDefault: true, sortOrder: 112 },
      { name: 'Seguros', type: 'EXPENSE', color: '#94a3b8', icon: '🛡️', isDefault: true, sortOrder: 113 },
      { name: 'Manutenção', type: 'EXPENSE', color: '#64748b', icon: '🔧', isDefault: true, sortOrder: 114 },
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
        } as any,
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
    const bonusCategory = userCategories.find(c => c.name === 'Bônus')
    const dividendosCategory = userCategories.find(c => c.name === 'Dividendos')
    const vendasCategory = userCategories.find(c => c.name === 'Vendas')
    const assinaturasCategory = userCategories.find(c => c.name === 'Assinaturas')
    const impostosCategory = userCategories.find(c => c.name === 'Impostos')
    const petCategory = userCategories.find(c => c.name === 'Pet')
    const vestuarioCategory = userCategories.find(c => c.name === 'Vestuário')
    const viagensCategory = userCategories.find(c => c.name === 'Viagens')
    const segurosCategory = userCategories.find(c => c.name === 'Seguros')
    const manutencaoCategory = userCategories.find(c => c.name === 'Manutenção')
    const saudeCategory = userCategories.find(c => c.name === 'Saúde')
    const educacaoCategory = userCategories.find(c => c.name === 'Educação')
    const comprasCategory = userCategories.find(c => c.name === 'Compras')

    const bancoCaixa = createdAccounts[0]
    const bancoInter = createdAccounts[1]
    const bancoItau = createdAccounts[2]
    const carteira = createdAccounts[3]
    const mercadoPago = createdAccounts[4]

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

    // ========== TRANSAÇÕES ADICIONAIS PARA OUT/NOV/DEZ 2025 ==========

    // Bônus de fim de ano (Dezembro)
    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoCaixa.id,
      userCategoryId: bonusCategory?.id,
      description: 'Bônus Anual',
      amount: 5000.00,
      type: 'INCOME',
      date: new Date('2025-12-20'),
      status: 'COMPLETED',
    })

    // 13º Salário (Novembro e Dezembro)
    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoCaixa.id,
      userCategoryId: salarioCategory?.id,
      description: '13º Salário (1ª parcela)',
      amount: 4250.00,
      type: 'INCOME',
      date: new Date('2025-11-30'),
      status: 'COMPLETED',
    })

    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoCaixa.id,
      userCategoryId: salarioCategory?.id,
      description: '13º Salário (2ª parcela)',
      amount: 4250.00,
      type: 'INCOME',
      date: new Date('2025-12-20'),
      status: 'COMPLETED',
    })

    // Dividendos (Outubro, Novembro)
    const dividendDates = [
      { date: new Date('2025-10-15'), amount: 450.00 },
      { date: new Date('2025-11-15'), amount: 520.00 },
      { date: new Date('2025-12-15'), amount: 680.00 },
    ]

    for (const div of dividendDates) {
      transactions.push({
        userId: sandboxUser.id,
        accountId: bancoItau.id,
        userCategoryId: dividendosCategory?.id,
        description: 'Dividendos - Ações',
        amount: div.amount,
        type: 'INCOME',
        date: div.date,
        status: 'COMPLETED',
      })
    }

    // Vendas (mercado livre, OLX, etc)
    const salesDates = [
      { date: new Date('2025-10-08'), desc: 'Venda - Notebook Antigo', amount: 1200.00 },
      { date: new Date('2025-11-12'), desc: 'Venda - TV Samsung', amount: 800.00 },
      { date: new Date('2025-12-05'), desc: 'Venda - iPhone 12', amount: 1500.00 },
    ]

    for (const sale of salesDates) {
      transactions.push({
        userId: sandboxUser.id,
        accountId: mercadoPago.id,
        userCategoryId: vendasCategory?.id,
        description: sale.desc,
        amount: sale.amount,
        type: 'INCOME',
        date: sale.date,
        status: 'COMPLETED',
      })
    }

    // Assinaturas mensais (Netflix, Spotify, Academia, etc)
    const subscriptions = [
      { name: 'Netflix', amount: 55.90 },
      { name: 'Spotify Premium', amount: 21.90 },
      { name: 'Amazon Prime', amount: 14.90 },
      { name: 'Academia Smart Fit', amount: 89.90 },
      { name: 'iCloud Storage', amount: 9.90 },
    ]

    for (let month = 0; month < 3; month++) { // Out, Nov, Dez
      for (const sub of subscriptions) {
        const date = new Date('2025-10-01')
        date.setMonth(date.getMonth() + month)
        date.setDate(3)

        transactions.push({
          userId: sandboxUser.id,
          accountId: bancoInter.id,
          userCategoryId: assinaturasCategory?.id,
          description: sub.name,
          amount: sub.amount,
          type: 'EXPENSE',
          date,
          status: 'COMPLETED',
        })
      }
    }

    // Impostos (IPTU, IPVA)
    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoCaixa.id,
      userCategoryId: impostosCategory?.id,
      description: 'IPTU - Parcela 10/10',
      amount: 320.00,
      type: 'EXPENSE',
      date: new Date('2025-10-10'),
      status: 'COMPLETED',
    })

    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoCaixa.id,
      userCategoryId: impostosCategory?.id,
      description: 'IPVA 2026 - Parcela 1/3',
      amount: 650.00,
      type: 'EXPENSE',
      date: new Date('2025-12-15'),
      status: 'COMPLETED',
    })

    // Pet (veterinário, ração, etc)
    const petExpenses = [
      { date: new Date('2025-10-12'), desc: 'Ração Premium 15kg', amount: 280.00 },
      { date: new Date('2025-10-20'), desc: 'Veterinário - Consulta', amount: 150.00 },
      { date: new Date('2025-11-15'), desc: 'Ração Premium 15kg', amount: 280.00 },
      { date: new Date('2025-11-28'), desc: 'Pet Shop - Banho e Tosa', amount: 90.00 },
      { date: new Date('2025-12-18'), desc: 'Ração Premium 15kg', amount: 280.00 },
      { date: new Date('2025-12-22'), desc: 'Veterinário - Vacinas', amount: 220.00 },
    ]

    for (const pet of petExpenses) {
      transactions.push({
        userId: sandboxUser.id,
        accountId: carteira.id,
        userCategoryId: petCategory?.id,
        description: pet.desc,
        amount: pet.amount,
        type: 'EXPENSE',
        date: pet.date,
        status: 'COMPLETED',
      })
    }

    // Vestuário (compras de roupas)
    const clothingExpenses = [
      { date: new Date('2025-10-25'), desc: 'Zara - Roupas de Trabalho', amount: 450.00 },
      { date: new Date('2025-11-22'), desc: 'Nike - Tênis Running', amount: 380.00 },
      { date: new Date('2025-12-10'), desc: 'Renner - Roupas de Verão', amount: 320.00 },
      { date: new Date('2025-12-23'), desc: 'C&A - Presentes de Natal', amount: 280.00 },
    ]

    for (const clothing of clothingExpenses) {
      transactions.push({
        userId: sandboxUser.id,
        accountId: bancoInter.id,
        userCategoryId: vestuarioCategory?.id,
        description: clothing.desc,
        amount: clothing.amount,
        type: 'EXPENSE',
        date: clothing.date,
        status: 'COMPLETED',
      })
    }

    // Viagens
    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoCaixa.id,
      userCategoryId: viagensCategory?.id,
      description: 'Passagem Aérea - São Paulo',
      amount: 680.00,
      type: 'EXPENSE',
      date: new Date('2025-11-05'),
      status: 'COMPLETED',
    })

    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoCaixa.id,
      userCategoryId: viagensCategory?.id,
      description: 'Hotel - 3 diárias',
      amount: 890.00,
      type: 'EXPENSE',
      date: new Date('2025-11-10'),
      status: 'COMPLETED',
    })

    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoInter.id,
      userCategoryId: viagensCategory?.id,
      description: 'Viagem Fim de Ano - Búzios',
      amount: 2400.00,
      type: 'EXPENSE',
      date: new Date('2025-12-28'),
      status: 'COMPLETED',
    })

    // Seguros
    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoCaixa.id,
      userCategoryId: segurosCategory?.id,
      description: 'Seguro Auto - Parcela 10/12',
      amount: 180.00,
      type: 'EXPENSE',
      date: new Date('2025-10-05'),
      status: 'COMPLETED',
    })

    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoCaixa.id,
      userCategoryId: segurosCategory?.id,
      description: 'Seguro Auto - Parcela 11/12',
      amount: 180.00,
      type: 'EXPENSE',
      date: new Date('2025-11-05'),
      status: 'COMPLETED',
    })

    transactions.push({
      userId: sandboxUser.id,
      accountId: bancoCaixa.id,
      userCategoryId: segurosCategory?.id,
      description: 'Seguro Auto - Parcela 12/12',
      amount: 180.00,
      type: 'EXPENSE',
      date: new Date('2025-12-05'),
      status: 'COMPLETED',
    })

    // Manutenção (casa, carro)
    const maintenanceExpenses = [
      { date: new Date('2025-10-18'), desc: 'Troca de Óleo - Carro', amount: 280.00 },
      { date: new Date('2025-11-08'), desc: 'Eletricista - Reparo', amount: 350.00 },
      { date: new Date('2025-12-12'), desc: 'Revisão Carro - 10.000km', amount: 850.00 },
    ]

    for (const maint of maintenanceExpenses) {
      transactions.push({
        userId: sandboxUser.id,
        accountId: bancoInter.id,
        userCategoryId: manutencaoCategory?.id,
        description: maint.desc,
        amount: maint.amount,
        type: 'EXPENSE',
        date: maint.date,
        status: 'COMPLETED',
      })
    }

    // Saúde (consultas, medicamentos)
    const healthExpenses = [
      { date: new Date('2025-10-14'), desc: 'Consulta Dentista', amount: 250.00 },
      { date: new Date('2025-10-22'), desc: 'Farmácia - Medicamentos', amount: 180.00 },
      { date: new Date('2025-11-18'), desc: 'Exames de Rotina', amount: 420.00 },
      { date: new Date('2025-12-08'), desc: 'Consulta Oftalmologista', amount: 300.00 },
      { date: new Date('2025-12-15'), desc: 'Óculos Novo', amount: 650.00 },
    ]

    for (const health of healthExpenses) {
      transactions.push({
        userId: sandboxUser.id,
        accountId: bancoInter.id,
        userCategoryId: saudeCategory?.id,
        description: health.desc,
        amount: health.amount,
        type: 'EXPENSE',
        date: health.date,
        status: 'COMPLETED',
      })
    }

    // Educação (cursos, livros)
    const educationExpenses = [
      { date: new Date('2025-10-05'), desc: 'Curso Udemy - React Avançado', amount: 89.90 },
      { date: new Date('2025-11-12'), desc: 'Livros Técnicos - Amazon', amount: 220.00 },
      { date: new Date('2025-12-03'), desc: 'Curso Alura - 12 meses', amount: 1200.00 },
    ]

    for (const edu of educationExpenses) {
      transactions.push({
        userId: sandboxUser.id,
        accountId: bancoInter.id,
        userCategoryId: educacaoCategory?.id,
        description: edu.desc,
        amount: edu.amount,
        type: 'EXPENSE',
        date: edu.date,
        status: 'COMPLETED',
      })
    }

    // Compras diversas (eletrônicos, presentes)
    const shoppingExpenses = [
      { date: new Date('2025-10-28'), desc: 'Amazon - Fone Bluetooth', amount: 280.00 },
      { date: new Date('2025-11-20'), desc: 'Magazine Luiza - Air Fryer', amount: 450.00 },
      { date: new Date('2025-12-15'), desc: 'Presentes de Natal', amount: 850.00 },
      { date: new Date('2025-12-22'), desc: 'Amazon - Monitor 27"', amount: 1200.00 },
    ]

    for (const shopping of shoppingExpenses) {
      transactions.push({
        userId: sandboxUser.id,
        accountId: bancoInter.id,
        userCategoryId: comprasCategory?.id,
        description: shopping.desc,
        amount: shopping.amount,
        type: 'EXPENSE',
        date: shopping.date,
        status: 'COMPLETED',
      })
    }

    // Alimentação extra para Out/Nov/Dez (restaurantes especiais, delivery)
    const extraFoodExpenses = [
      { date: new Date('2025-10-31'), desc: 'Jantar Halloween - Outback', amount: 180.00 },
      { date: new Date('2025-11-15'), desc: 'Aniversário - Restaurante', amount: 320.00 },
      { date: new Date('2025-12-24'), desc: 'Ceia de Natal - Supermercado', amount: 680.00 },
      { date: new Date('2025-12-31'), desc: 'Jantar Réveillon', amount: 450.00 },
    ]

    for (const food of extraFoodExpenses) {
      transactions.push({
        userId: sandboxUser.id,
        accountId: carteira.id,
        userCategoryId: alimentacaoCategory?.id,
        description: food.desc,
        amount: food.amount,
        type: 'EXPENSE',
        date: food.date,
        status: 'COMPLETED',
      })
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

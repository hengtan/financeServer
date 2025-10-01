import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seeding with realistic data...')

  // ============================================================
  // 1. CREATE SANDBOX USER
  // ============================================================
  const passwordHash = await bcrypt.hash('sandbox', 12)

  const sandboxUser = await prisma.user.upsert({
    where: { email: 'sandbox@financeserver.dev' },
    update: {},
    create: {
      email: 'sandbox@financeserver.dev',
      name: 'Henrique Santos',
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      phoneNumber: '+5511987654321',
    },
  })

  console.log('👤 Sandbox user created:', sandboxUser.email)

  // ============================================================
  // 2. CREATE CATEGORY TEMPLATES (System-wide)
  // ============================================================
  const categoryTemplates = [
    // INCOME CATEGORIES
    { name: 'Salário', type: 'INCOME', color: '#10b981', icon: '💼', isDefault: true, sortOrder: 1 },
    { name: 'Freelance', type: 'INCOME', color: '#059669', icon: '💻', isDefault: true, sortOrder: 2 },
    { name: 'Investimentos', type: 'INCOME', color: '#0d9488', icon: '📈', isDefault: true, sortOrder: 3 },
    { name: 'Bônus', type: 'INCOME', color: '#14b8a6', icon: '🎁', isDefault: false, sortOrder: 4 },
    { name: 'Aluguel Recebido', type: 'INCOME', color: '#06b6d4', icon: '🏠', isDefault: false, sortOrder: 5 },

    // EXPENSE CATEGORIES
    { name: 'Alimentação', type: 'EXPENSE', color: '#f59e0b', icon: '🍽️', isDefault: true, sortOrder: 101 },
    { name: 'Transporte', type: 'EXPENSE', color: '#3b82f6', icon: '🚗', isDefault: true, sortOrder: 102 },
    { name: 'Moradia', type: 'EXPENSE', color: '#8b5cf6', icon: '🏠', isDefault: true, sortOrder: 103 },
    { name: 'Saúde', type: 'EXPENSE', color: '#ec4899', icon: '⚕️', isDefault: true, sortOrder: 104 },
    { name: 'Educação', type: 'EXPENSE', color: '#6366f1', icon: '📚', isDefault: true, sortOrder: 105 },
    { name: 'Lazer', type: 'EXPENSE', color: '#a855f7', icon: '🎬', isDefault: true, sortOrder: 106 },
    { name: 'Compras', type: 'EXPENSE', color: '#ef4444', icon: '🛍️', isDefault: true, sortOrder: 107 },
    { name: 'Serviços', type: 'EXPENSE', color: '#f97316', icon: '🔧', isDefault: true, sortOrder: 108 },
    { name: 'Vestuário', type: 'EXPENSE', color: '#84cc16', icon: '👕', isDefault: false, sortOrder: 109 },
    { name: 'Beleza', type: 'EXPENSE', color: '#d946ef', icon: '💄', isDefault: false, sortOrder: 110 },
    { name: 'Pet', type: 'EXPENSE', color: '#0ea5e9', icon: '🐾', isDefault: false, sortOrder: 111 },
    { name: 'Seguros', type: 'EXPENSE', color: '#78716c', icon: '🛡️', isDefault: false, sortOrder: 112 },
    { name: 'Impostos', type: 'EXPENSE', color: '#dc2626', icon: '📋', isDefault: false, sortOrder: 113 },
    { name: 'Outros', type: 'EXPENSE', color: '#6b7280', icon: '📦', isDefault: true, sortOrder: 199 },
  ]

  const createdTemplates: any[] = []
  for (const template of categoryTemplates) {
    const created = await prisma.categoryTemplate.upsert({
      where: { name_type: { name: template.name, type: template.type as any } },
      update: {},
      create: template as any,
    })
    createdTemplates.push(created)
  }

  console.log(`📑 Created ${createdTemplates.length} category templates`)

  // ============================================================
  // 3. CREATE USER CATEGORIES (based on templates)
  // ============================================================
  const userCategories: any[] = []
  for (const template of createdTemplates) {
    const userCategory = await prisma.userCategory.create({
      data: {
        userId: sandboxUser.id,
        categoryTemplateId: template.id,
        name: template.name,
        description: `Categoria ${template.name}`,
        type: template.type,
        color: template.color,
        icon: template.icon,
        status: 'ACTIVE',
        isActive: true,
        isCustom: false,
        isDefault: template.isDefault,
        sortOrder: template.sortOrder,
        tags: [template.type.toLowerCase()],
      },
    })
    userCategories.push(userCategory)
  }

  console.log(`📂 Created ${userCategories.length} user categories`)

  // ============================================================
  // 3.5 CREATE LEGACY CATEGORIES (for Budget compatibility)
  // ============================================================
  const legacyCategories: any[] = []

  // Create legacy categories for all main expense and income types
  const legacyCategoryData = [
    // EXPENSE CATEGORIES
    { id: 'legacy_alimentacao', name: 'Alimentação', type: 'EXPENSE', color: '#f59e0b', icon: '🍽️' },
    { id: 'legacy_transporte', name: 'Transporte', type: 'EXPENSE', color: '#3b82f6', icon: '🚗' },
    { id: 'legacy_moradia', name: 'Moradia', type: 'EXPENSE', color: '#8b5cf6', icon: '🏠' },
    { id: 'legacy_saude', name: 'Saúde', type: 'EXPENSE', color: '#ec4899', icon: '⚕️' },
    { id: 'legacy_educacao', name: 'Educação', type: 'EXPENSE', color: '#6366f1', icon: '📚' },
    { id: 'legacy_lazer', name: 'Lazer', type: 'EXPENSE', color: '#a855f7', icon: '🎬' },
    { id: 'legacy_compras', name: 'Compras', type: 'EXPENSE', color: '#ef4444', icon: '🛍️' },
    { id: 'legacy_servicos', name: 'Serviços', type: 'EXPENSE', color: '#f97316', icon: '🔧' },
    { id: 'legacy_vestuario', name: 'Vestuário', type: 'EXPENSE', color: '#84cc16', icon: '👕' },
    { id: 'legacy_beleza', name: 'Beleza', type: 'EXPENSE', color: '#d946ef', icon: '💄' },
    { id: 'legacy_pet', name: 'Pet', type: 'EXPENSE', color: '#0ea5e9', icon: '🐾' },
    { id: 'legacy_seguros', name: 'Seguros', type: 'EXPENSE', color: '#78716c', icon: '🛡️' },
    { id: 'legacy_impostos', name: 'Impostos', type: 'EXPENSE', color: '#dc2626', icon: '📋' },
    { id: 'legacy_outros', name: 'Outros', type: 'EXPENSE', color: '#6b7280', icon: '📦' },
    // INCOME CATEGORIES
    { id: 'legacy_salario', name: 'Salário', type: 'INCOME', color: '#10b981', icon: '💼' },
    { id: 'legacy_freelance', name: 'Freelance', type: 'INCOME', color: '#059669', icon: '💻' },
    { id: 'legacy_investimentos', name: 'Investimentos', type: 'INCOME', color: '#0d9488', icon: '📈' },
    { id: 'legacy_bonus', name: 'Bônus', type: 'INCOME', color: '#14b8a6', icon: '🎁' },
  ]

  for (const catData of legacyCategoryData) {
    const legacyCat = await prisma.category.upsert({
      where: { id: catData.id },
      update: {},
      create: {
        ...catData,
        userId: sandboxUser.id,
        status: 'ACTIVE',
        isSystem: false,
        isDefault: false,
        tags: [catData.type.toLowerCase()],
      } as any,
    })
    legacyCategories.push(legacyCat)
  }

  console.log(`📁 Created ${legacyCategories.length} legacy categories for budget compatibility`)

  // Helper to find user category by name
  const findCategory = (name: string) => {
    return userCategories.find(c => c.name === name)
  }

  // Helper to find legacy category by name
  const findLegacyCategory = (name: string) => {
    return legacyCategories.find(c => c.name === name)
  }

  // Helper to get both category IDs for transactions
  const getCategoryIds = (categoryName: string) => {
    const userCategory = findCategory(categoryName)
    const legacyCategory = legacyCategories.find(c => c.name === categoryName)

    return {
      userCategoryId: userCategory?.id,
      categoryId: legacyCategory?.id || userCategory?.id // Fallback to userCategory if no legacy
    }
  }

  // ============================================================
  // 4. CREATE ACCOUNTS (Caixa, Inter, Itaú, Carteira, Mercado Pago + Credit Cards)
  // ============================================================
  const accounts = [
    {
      id: 'acc_caixa',
      name: 'Banco Caixa',
      type: 'CHECKING',
      balance: 100.81,
      currency: 'BRL',
      bankName: 'Caixa Econômica Federal',
      color: '#0066CC',
      isDefault: false,
      status: 'ACTIVE',
    },
    {
      id: 'acc_inter',
      name: 'Banco Inter',
      type: 'CHECKING',
      balance: 0.01,
      currency: 'BRL',
      bankName: 'Banco Inter',
      color: '#FF7A00',
      isDefault: false,
      status: 'ACTIVE',
    },
    {
      id: 'acc_itau',
      name: 'Banco Itau',
      type: 'CHECKING',
      balance: 3272.33,
      currency: 'BRL',
      bankName: 'Itaú Unibanco',
      color: '#EC7000',
      isDefault: true,
      status: 'ACTIVE',
    },
    {
      id: 'acc_carteira',
      name: 'Carteira',
      type: 'CHECKING',
      balance: 30.00,
      currency: 'BRL',
      color: '#10b981',
      description: 'Dinheiro em espécie',
      isDefault: false,
      status: 'ACTIVE',
    },
    {
      id: 'acc_mercadopago',
      name: 'Mercado Pago',
      type: 'CHECKING',
      balance: 0.01,
      currency: 'BRL',
      bankName: 'Mercado Pago',
      color: '#00AAFF',
      isDefault: false,
      status: 'ACTIVE',
    },
    // Credit Cards
    {
      id: 'cc_inter',
      name: 'Cartao Inter',
      type: 'CREDIT_CARD',
      balance: -153.01, // Negative balance = debt
      currency: 'BRL',
      creditLimit: 969.96,
      color: '#FF7A00',
      bankName: 'Banco Inter',
      isDefault: false,
      status: 'ACTIVE',
    },
    {
      id: 'cc_pao_acucar',
      name: 'Pao de Acucar',
      type: 'CREDIT_CARD',
      balance: -633.12,
      currency: 'BRL',
      creditLimit: 984.59,
      color: '#228B22',
      bankName: 'Pão de Açúcar',
      isDefault: false,
      status: 'ACTIVE',
    },
    {
      id: 'cc_personallite',
      name: 'Personallite Black',
      type: 'CREDIT_CARD',
      balance: -1987.73,
      currency: 'BRL',
      creditLimit: 53725.00,
      color: '#000000',
      bankName: 'Personallite',
      isDefault: false,
      status: 'ACTIVE',
    },
    {
      id: 'cc_latam',
      name: 'Latam Black',
      type: 'CREDIT_CARD',
      balance: -2182.76,
      currency: 'BRL',
      creditLimit: 14903.90,
      color: '#6B0F82',
      bankName: 'Latam Pass',
      isDefault: false,
      status: 'ACTIVE',
    },
  ]

  for (const accountData of accounts) {
    await prisma.account.upsert({
      where: { id: accountData.id },
      update: {},
      create: {
        ...accountData,
        userId: sandboxUser.id,
      },
    })
  }

  console.log(`🏦 Created ${accounts.length} accounts (including ${accounts.filter(a => a.type === 'CREDIT_CARD').length} credit cards)`)

  // ============================================================
  // 5. CREATE REALISTIC TRANSACTIONS (Last 12 months)
  // ============================================================
  const startDate = new Date('2024-10-01') // October 2024
  const transactions: any[] = []

  // Monthly recurring income (Salary)
  for (let month = 0; month < 12; month++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)
    date.setDate(5) // Salary on 5th of each month

    const categoryIds = getCategoryIds('Salário')
    transactions.push({
      description: 'Salário',
      amount: 6500.00 + (Math.random() * 500), // 6500-7000
      type: 'INCOME',
      ...categoryIds,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Monthly recurring expenses - Moradia (Rent)
  for (let month = 0; month < 12; month++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)
    date.setDate(10)

    transactions.push({
      description: 'Aluguel',
      amount: 1800.00,
      type: 'EXPENSE',
      userCategoryId: findCategory('Moradia')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Monthly utility bills
  for (let month = 0; month < 12; month++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)
    date.setDate(15)

    // Electricity
    transactions.push({
      description: 'Conta de Luz',
      amount: 150.00 + (Math.random() * 100),
      type: 'EXPENSE',
      userCategoryId: findCategory('Moradia')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })

    // Internet
    transactions.push({
      description: 'Internet Fibra',
      amount: 99.90,
      type: 'EXPENSE',
      userCategoryId: findCategory('Serviços')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date: new Date(date.getTime() + 86400000), // Next day
    })
  }

  // Weekly groceries (last 6 months - July to December 2025)
  const weeklyStartDate = new Date('2025-07-01')
  for (let week = 0; week < 26; week++) { // ~6 months
    const date = new Date(weeklyStartDate)
    date.setDate(date.getDate() + (week * 7))

    transactions.push({
      description: ['Supermercado', 'Mercado', 'Feira', 'Açougue'][Math.floor(Math.random() * 4)],
      amount: 200.00 + (Math.random() * 250), // 200-450
      type: 'EXPENSE',
      userCategoryId: findCategory('Alimentação')?.id,
      accountId: ['acc_itau', 'acc_caixa', 'cc_inter'][Math.floor(Math.random() * 3)],
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Transportation (Uber, Gas, etc)
  const transportDates = []
  for (let month = 0; month < 12; month++) { // Last 12 months
    for (let i = 0; i < 8; i++) { // 8 transport expenses per month
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + month)
      date.setDate(Math.floor(Math.random() * 28) + 1)
      transportDates.push(date)
    }
  }

  for (const date of transportDates) {
    const isUber = Math.random() > 0.4
    transactions.push({
      description: isUber ? 'Uber' : 'Gasolina',
      amount: isUber ? 15.00 + (Math.random() * 50) : 200.00 + (Math.random() * 150),
      type: 'EXPENSE',
      userCategoryId: findCategory('Transporte')?.id,
      accountId: isUber ? 'cc_inter' : 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Leisure & Entertainment
  const leisureDates = []
  for (let month = 0; month < 12; month++) {
    for (let i = 0; i < 4; i++) { // 4 leisure expenses per month
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + month)
      date.setDate(Math.floor(Math.random() * 28) + 1)
      leisureDates.push(date)
    }
  }

  const leisureDescriptions = ['Netflix', 'Spotify', 'Cinema', 'Restaurante', 'Bar', 'Teatro', 'Show']
  for (const date of leisureDates) {
    const desc = leisureDescriptions[Math.floor(Math.random() * leisureDescriptions.length)]
    const isSubscription = ['Netflix', 'Spotify'].includes(desc)

    transactions.push({
      description: desc,
      amount: isSubscription ? 32.90 : 50.00 + (Math.random() * 200),
      type: 'EXPENSE',
      userCategoryId: findCategory('Lazer')?.id,
      accountId: isSubscription ? 'cc_inter' : 'cc_pao_acucar',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Health expenses
  for (let month = 0; month < 12; month++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)
    date.setDate(20)

    // Health insurance
    transactions.push({
      description: 'Plano de Saúde',
      amount: 450.00,
      type: 'EXPENSE',
      userCategoryId: findCategory('Saúde')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Random health expenses (pharmacy, doctor)
  for (let month = 0; month < 12; month++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)
    date.setDate(Math.floor(Math.random() * 28) + 1)

    transactions.push({
      description: Math.random() > 0.5 ? 'Farmácia' : 'Consulta Médica',
      amount: 50.00 + (Math.random() * 250),
      type: 'EXPENSE',
      userCategoryId: findCategory('Saúde')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Freelance income (sporadic)
  const freelanceDates = [
    new Date('2024-11-15'),
    new Date('2024-12-20'),
    new Date('2025-02-10'),
    new Date('2025-04-05'),
    new Date('2025-06-12'),
    new Date('2025-08-22'),
    new Date('2025-09-15'),
    new Date('2025-10-18'),
    new Date('2025-11-10'),
    new Date('2025-12-05'),
  ]

  for (const date of freelanceDates) {
    transactions.push({
      description: 'Projeto Freelance',
      amount: 1500.00 + (Math.random() * 2500), // 1500-4000
      type: 'INCOME',
      userCategoryId: findCategory('Freelance')?.id,
      accountId: 'acc_inter',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Investment income (quarterly)
  const investmentDates = [
    new Date('2025-01-15'),
    new Date('2025-04-15'),
    new Date('2025-07-15'),
    new Date('2025-10-15'),
  ]

  for (const date of investmentDates) {
    transactions.push({
      description: 'Rendimento CDB',
      amount: 250.00 + (Math.random() * 200),
      type: 'INCOME',
      userCategoryId: findCategory('Investimentos')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: date > new Date() ? 'PENDING' : 'COMPLETED',
      date,
    })
  }

  // Shopping (sporadic)
  const shoppingDates = []
  for (let month = 0; month < 12; month++) {
    for (let i = 0; i < 2; i++) {
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + month)
      date.setDate(Math.floor(Math.random() * 28) + 1)
      shoppingDates.push(date)
    }
  }

  const shoppingDescriptions = ['Amazon', 'Mercado Livre', 'Magazine Luiza', 'Americanas', 'Shopee']
  for (const date of shoppingDates) {
    transactions.push({
      description: shoppingDescriptions[Math.floor(Math.random() * shoppingDescriptions.length)],
      amount: 50.00 + (Math.random() * 400),
      type: 'EXPENSE',
      userCategoryId: findCategory('Compras')?.id,
      accountId: 'cc_pao_acucar',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Monthly subscriptions and recurring services (last 12 months)
  const subscriptions = [
    { name: 'Netflix', amount: 55.90, categoryName: 'Lazer', day: 8, account: 'cc_inter' },
    { name: 'Spotify Premium', amount: 21.90, categoryName: 'Lazer', day: 12, account: 'cc_inter' },
    { name: 'Amazon Prime', amount: 14.90, categoryName: 'Serviços', day: 15, account: 'cc_pao_acucar' },
    { name: 'iCloud 200GB', amount: 12.90, categoryName: 'Serviços', day: 20, account: 'cc_inter' },
    { name: 'YouTube Premium', amount: 28.90, categoryName: 'Lazer', day: 5, account: 'cc_inter' },
  ]

  for (let month = 0; month < 12; month++) {
    for (const sub of subscriptions) {
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + month)
      date.setDate(sub.day)

      transactions.push({
        description: sub.name,
        amount: sub.amount,
        type: 'EXPENSE',
        userCategoryId: findCategory(sub.categoryName)?.id,
        accountId: sub.account,
        userId: sandboxUser.id,
        status: 'COMPLETED',
        date,
      })
    }
  }

  // Monthly phone bill
  for (let month = 0; month < 12; month++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)
    date.setDate(18)

    transactions.push({
      description: 'Vivo Celular',
      amount: 89.90,
      type: 'EXPENSE',
      userCategoryId: findCategory('Serviços')?.id,
      accountId: 'cc_inter',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Gym membership
  for (let month = 0; month < 12; month++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)
    date.setDate(1)

    transactions.push({
      description: 'Academia Smart Fit',
      amount: 79.90,
      type: 'EXPENSE',
      userCategoryId: findCategory('Saúde')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Gas bill (every 2 months)
  for (let month = 0; month < 12; month += 2) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)
    date.setDate(22)

    transactions.push({
      description: 'Conta de Gás',
      amount: 45.00 + (Math.random() * 25),
      type: 'EXPENSE',
      userCategoryId: findCategory('Moradia')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Water bill (monthly)
  for (let month = 0; month < 12; month++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)
    date.setDate(25)

    transactions.push({
      description: 'Conta de Água',
      amount: 35.00 + (Math.random() * 20),
      type: 'EXPENSE',
      userCategoryId: findCategory('Moradia')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Education - Online courses (sporadic)
  const educationDates = [
    new Date('2024-11-10'),
    new Date('2025-02-15'),
    new Date('2025-05-20'),
    new Date('2025-08-12'),
    new Date('2025-09-25'),
    new Date('2025-10-15'),
    new Date('2025-11-20'),
    new Date('2025-12-10'),
  ]

  const educationCourses = ['Udemy - React Avançado', 'Coursera - Data Science', 'Alura - NodeJS', 'Rocketseat GoStack']
  for (const date of educationDates) {
    transactions.push({
      description: educationCourses[Math.floor(Math.random() * educationCourses.length)],
      amount: 50.00 + (Math.random() * 200),
      type: 'EXPENSE',
      userCategoryId: findCategory('Educação')?.id,
      accountId: 'cc_pao_acucar',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Pet expenses (monthly)
  for (let month = 0; month < 12; month++) { // All 12 months
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + month)
    date.setDate(Math.floor(Math.random() * 28) + 1)

    const petExpenses = ['Ração Premium', 'Veterinário', 'Petshop Banho e Tosa', 'Remédio pet']
    transactions.push({
      description: petExpenses[Math.floor(Math.random() * petExpenses.length)],
      amount: 80.00 + (Math.random() * 220),
      type: 'EXPENSE',
      userCategoryId: findCategory('Pet')?.id,
      accountId: ['acc_itau', 'cc_inter'][Math.floor(Math.random() * 2)],
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Beauty & personal care (sporadic)
  const beautyCareCount = 24 // ~2 per month for last year
  for (let i = 0; i < beautyCareCount; i++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + Math.floor(i / 2))
    date.setDate(Math.floor(Math.random() * 28) + 1)

    const beautyServices = ['Cabeleleiro', 'Barbearia', 'Manicure', 'Farmácia - Cosméticos']
    transactions.push({
      description: beautyServices[Math.floor(Math.random() * beautyServices.length)],
      amount: 30.00 + (Math.random() * 120),
      type: 'EXPENSE',
      userCategoryId: findCategory('Beleza')?.id,
      accountId: ['acc_carteira', 'cc_inter'][Math.floor(Math.random() * 2)],
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Clothing & fashion (sporadic)
  const clothingCount = 15
  for (let i = 0; i < clothingCount; i++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + Math.floor(Math.random() * 12))
    date.setDate(Math.floor(Math.random() * 28) + 1)

    const clothingStores = ['Zara', 'Renner', 'C&A', 'Nike Store', 'Adidas', 'Shein']
    transactions.push({
      description: clothingStores[Math.floor(Math.random() * clothingStores.length)],
      amount: 100.00 + (Math.random() * 400),
      type: 'EXPENSE',
      userCategoryId: findCategory('Vestuário')?.id,
      accountId: ['cc_pao_acucar', 'cc_personallite'][Math.floor(Math.random() * 2)],
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Restaurants & food delivery (frequent - all 12 months)
  const restaurantCount = 120 // ~10 per month for 12 months
  for (let i = 0; i < restaurantCount; i++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + Math.floor(i / 10))
    date.setDate(Math.floor(Math.random() * 28) + 1)

    const foodServices = ['iFood', 'Rappi', 'Restaurante Japonês', 'Pizzaria', 'Burguer King', 'McDonalds', 'Padaria']
    transactions.push({
      description: foodServices[Math.floor(Math.random() * foodServices.length)],
      amount: 25.00 + (Math.random() * 125),
      type: 'EXPENSE',
      userCategoryId: findCategory('Alimentação')?.id,
      accountId: ['cc_inter', 'cc_pao_acucar', 'acc_carteira'][Math.floor(Math.random() * 3)],
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Coffee & snacks (very frequent - last 6 months)
  const coffeeCount = 80 // ~3-4 per week for 6 months
  for (let i = 0; i < coffeeCount; i++) {
    const date = new Date('2025-07-01')
    date.setDate(date.getDate() + (i * 2)) // Every 2 days

    const coffeeShops = ['Starbucks', 'Kopenhagen', 'Padaria', 'Café local']
    transactions.push({
      description: coffeeShops[Math.floor(Math.random() * coffeeShops.length)],
      amount: 8.00 + (Math.random() * 22),
      type: 'EXPENSE',
      userCategoryId: findCategory('Alimentação')?.id,
      accountId: 'acc_carteira',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Transfers between accounts
  const transfers = [
    { from: 'acc_itau', to: 'acc_caixa', amount: 500.00, date: new Date('2025-07-10'), desc: 'Transferência para Caixa' },
    { from: 'acc_itau', to: 'acc_inter', amount: 1000.00, date: new Date('2025-08-05'), desc: 'Transferência para Inter' },
    { from: 'acc_inter', to: 'acc_mercadopago', amount: 200.00, date: new Date('2025-08-15'), desc: 'Transferência MercadoPago' },
    { from: 'acc_itau', to: 'acc_carteira', amount: 300.00, date: new Date('2025-09-01'), desc: 'Saque em dinheiro' },
  ]

  for (const transfer of transfers) {
    // Debit from origin account
    transactions.push({
      description: transfer.desc,
      amount: transfer.amount,
      type: 'TRANSFER',
      accountId: transfer.from,
      toAccountId: transfer.to,
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date: transfer.date,
    })
  }

  // Insurance payments (annual or semi-annual)
  const insuranceDates = [
    new Date('2024-11-01'),
    new Date('2025-05-01'),
  ]

  for (const date of insuranceDates) {
    transactions.push({
      description: 'Seguro Auto',
      amount: 1200.00 + (Math.random() * 300),
      type: 'EXPENSE',
      userCategoryId: findCategory('Seguros')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date,
    })
  }

  // Taxes (IPTU, IPVA)
  const taxDates = [
    { date: new Date('2025-02-28'), desc: 'IPVA 2025', amount: 850.00 },
    { date: new Date('2025-03-15'), desc: 'IPTU 2025 - 1ª parcela', amount: 250.00 },
    { date: new Date('2025-04-15'), desc: 'IPTU 2025 - 2ª parcela', amount: 250.00 },
    { date: new Date('2025-05-15'), desc: 'IPTU 2025 - 3ª parcela', amount: 250.00 },
  ]

  for (const tax of taxDates) {
    transactions.push({
      description: tax.desc,
      amount: tax.amount,
      type: 'EXPENSE',
      userCategoryId: findCategory('Impostos')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date: tax.date,
    })
  }

  // Special occasions (birthdays, gifts, etc)
  const specialDates = [
    { date: new Date('2024-12-25'), desc: 'Presentes de Natal', amount: 800.00 },
    { date: new Date('2025-03-08'), desc: 'Presente Dia da Mulher', amount: 250.00 },
    { date: new Date('2025-06-12'), desc: 'Presente Dia dos Namorados', amount: 350.00 },
    { date: new Date('2025-08-14'), desc: 'Presente Aniversário', amount: 420.00 },
  ]

  for (const special of specialDates) {
    transactions.push({
      description: special.desc,
      amount: special.amount,
      type: 'EXPENSE',
      userCategoryId: findCategory('Outros')?.id,
      accountId: 'cc_personallite',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date: special.date,
    })
  }

  // Bonus income (sporadic)
  const bonusDates = [
    { date: new Date('2024-12-20'), desc: 'Bônus Fim de Ano', amount: 5000.00 },
    { date: new Date('2025-06-15'), desc: 'Bônus Semestral', amount: 3500.00 },
  ]

  for (const bonus of bonusDates) {
    transactions.push({
      description: bonus.desc,
      amount: bonus.amount,
      type: 'INCOME',
      userCategoryId: findCategory('Bônus')?.id,
      accountId: 'acc_itau',
      userId: sandboxUser.id,
      status: 'COMPLETED',
      date: bonus.date,
    })
  }

  // Create all transactions
  let categorizedCount = 0
  let uncategorizedCount = 0

  for (const transactionData of transactions) {
    // If userCategoryId is set but categoryId is not, find the matching legacy category
    if (transactionData.userCategoryId && !transactionData.categoryId) {
      const userCategory = userCategories.find(uc => uc.id === transactionData.userCategoryId)
      if (userCategory) {
        const legacyCategory = legacyCategories.find(lc => lc.name === userCategory.name)
        if (legacyCategory) {
          transactionData.categoryId = legacyCategory.id
          categorizedCount++
        } else {
          // If no legacy category exists, use userCategoryId as fallback
          transactionData.categoryId = transactionData.userCategoryId
          categorizedCount++
        }
      }
    }

    if (!transactionData.categoryId) {
      uncategorizedCount++
    }

    await prisma.transaction.create({
      data: transactionData,
    })
  }

  console.log(`   - Categorized: ${categorizedCount}`)
  console.log(`   - Uncategorized: ${uncategorizedCount}`)

  console.log(`💳 Created ${transactions.length} realistic transactions over 12 months`)

  // ============================================================
  // 6. CREATE FINANCIAL GOALS
  // ============================================================
  const goals = [
    {
      id: 'goal_emergency',
      name: 'Reserva de Emergência',
      description: 'Fundo de emergência equivalente a 6 meses de despesas',
      targetAmount: 35000.00,
      currentAmount: 12450.00,
      currency: 'BRL',
      targetDate: new Date('2026-06-30'),
      status: 'ACTIVE',
      color: '#ef4444',
    },
    {
      id: 'goal_vacation',
      name: 'Viagem para Europa',
      description: 'Economizar para viagem de 15 dias pela Europa',
      targetAmount: 15000.00,
      currentAmount: 4200.00,
      currency: 'BRL',
      targetDate: new Date('2025-12-15'),
      status: 'ACTIVE',
      color: '#3b82f6',
    },
    {
      id: 'goal_car',
      name: 'Carro Novo',
      description: 'Entrada para carro 0km',
      targetAmount: 25000.00,
      currentAmount: 8750.00,
      currency: 'BRL',
      targetDate: new Date('2026-03-01'),
      status: 'ACTIVE',
      color: '#8b5cf6',
    },
    {
      id: 'goal_education',
      name: 'Curso de MBA',
      description: 'Investir em educação - MBA em Gestão',
      targetAmount: 28000.00,
      currentAmount: 3200.00,
      currency: 'BRL',
      targetDate: new Date('2026-08-01'),
      status: 'ACTIVE',
      color: '#6366f1',
    },
  ]

  for (const goalData of goals) {
    await prisma.goal.upsert({
      where: { id: goalData.id },
      update: {},
      create: {
        ...goalData,
        userId: sandboxUser.id,
      },
    })
  }

  console.log(`🎯 Created ${goals.length} financial goals`)

  // ============================================================
  // 7. CREATE BUDGETS (Monthly budgets for main categories)
  // ============================================================
  const currentDate = new Date()
  const budgetStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const budgetEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const budgets = [
    {
      id: 'budget_alimentacao',
      name: 'Orçamento Alimentação',
      amount: 1500.00,
      spent: 0, // Will be calculated
      currency: 'BRL',
      period: 'MONTHLY',
      status: 'ACTIVE',
      categoryName: 'Alimentação',
    },
    {
      id: 'budget_transporte',
      name: 'Orçamento Transporte',
      amount: 800.00,
      spent: 0,
      currency: 'BRL',
      period: 'MONTHLY',
      status: 'ACTIVE',
      categoryName: 'Transporte',
    },
    {
      id: 'budget_lazer',
      name: 'Orçamento Lazer',
      amount: 600.00,
      spent: 0,
      currency: 'BRL',
      period: 'MONTHLY',
      status: 'ACTIVE',
      categoryName: 'Lazer',
    },
    {
      id: 'budget_compras',
      name: 'Orçamento Compras',
      amount: 500.00,
      spent: 0,
      currency: 'BRL',
      period: 'MONTHLY',
      status: 'ACTIVE',
      categoryName: 'Compras',
    },
  ]

  for (const budgetData of budgets) {
    const legacyCategory = findLegacyCategory(budgetData.categoryName)
    const userCategory = findCategory(budgetData.categoryName)

    await prisma.budget.upsert({
      where: { id: budgetData.id },
      update: {},
      create: {
        id: budgetData.id,
        name: budgetData.name,
        amount: budgetData.amount,
        spent: budgetData.spent,
        currency: budgetData.currency,
        period: budgetData.period as any,
        status: budgetData.status as any,
        userId: sandboxUser.id,
        categoryId: legacyCategory!.id, // Legacy field (required)
        userCategoryId: userCategory?.id, // New hybrid architecture field
        startDate: budgetStartDate,
        endDate: budgetEndDate,
      },
    })
  }

  console.log(`💰 Created ${budgets.length} monthly budgets`)

  // ============================================================
  // 8. CREATE ALERTS
  // ============================================================
  const alerts = [
    {
      id: 'alert_budget_exceeded_alimentacao',
      type: 'BUDGET_EXCEEDED',
      severity: 'HIGH',
      status: 'ACTIVE',
      title: 'Orçamento de Alimentação Excedido',
      message: 'Você excedeu seu orçamento de alimentação em 15%!',
      description: 'Seus gastos com alimentação ultrapassaram R$ 1.500,00 este mês.',
      data: {
        budget: 1500.00,
        spent: 1725.00,
        difference: 225.00,
        percentage: 115,
        category: 'Alimentação',
      },
      actionUrl: '/budgets',
      actionText: 'Ver Orçamentos',
      triggeredAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      channels: ['IN_APP', 'EMAIL'],
    },
    {
      id: 'alert_low_balance_caixa',
      type: 'LOW_BALANCE',
      severity: 'MEDIUM',
      status: 'ACTIVE',
      title: 'Saldo Baixo - Banco Caixa',
      message: 'O saldo da conta Banco Caixa está abaixo de R$ 200,00',
      description: 'Considere transferir fundos para esta conta.',
      data: {
        account: 'Banco Caixa',
        balance: 100.81,
        threshold: 200.00,
      },
      actionUrl: '/contas',
      actionText: 'Ver Contas',
      triggeredAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      channels: ['IN_APP'],
    },
    {
      id: 'alert_goal_milestone_vacation',
      type: 'GOAL_MILESTONE',
      severity: 'LOW',
      status: 'READ',
      title: 'Meta de Viagem: 25% Alcançado! 🎉',
      message: 'Parabéns! Você atingiu 25% da sua meta de viagem para Europa.',
      description: 'Continue economizando para realizar seu sonho!',
      data: {
        goal: 'Viagem para Europa',
        targetAmount: 15000.00,
        currentAmount: 4200.00,
        percentage: 28,
        milestone: 25,
      },
      actionUrl: '/metas',
      actionText: 'Ver Metas',
      triggeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      channels: ['IN_APP'],
    },
    {
      id: 'alert_income_received_freelance',
      type: 'INCOME_RECEIVED',
      severity: 'LOW',
      status: 'ACTIVE',
      title: 'Receita Recebida: Freelance',
      message: 'Você recebeu R$ 2.350,00 do projeto freelance.',
      description: 'O pagamento foi creditado na conta Banco Inter.',
      data: {
        amount: 2350.00,
        account: 'Banco Inter',
        description: 'Projeto Freelance',
      },
      actionUrl: '/transacoes',
      actionText: 'Ver Transações',
      triggeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      channels: ['IN_APP', 'EMAIL'],
    },
  ]

  for (const alertData of alerts) {
    await prisma.alert.upsert({
      where: { id: alertData.id },
      update: {},
      create: {
        ...alertData,
        userId: sandboxUser.id,
      } as any,
    })
  }

  console.log(`🚨 Created ${alerts.length} alerts`)

  console.log('✅ Comprehensive database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - 1 User (sandbox@financeserver.dev / password: sandbox)`)
  console.log(`   - ${createdTemplates.length} Category Templates`)
  console.log(`   - ${userCategories.length} User Categories`)
  console.log(`   - ${accounts.length} Accounts (5 checking + 4 credit cards)`)
  console.log(`   - ${transactions.length} Transactions (12 months)`)
  console.log(`   - ${goals.length} Financial Goals`)
  console.log(`   - ${budgets.length} Monthly Budgets`)
  console.log(`   - ${alerts.length} Alerts`)
  console.log('\n🔐 Login credentials:')
  console.log('   Email: sandbox@financeserver.dev')
  console.log('   Password: sandbox')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

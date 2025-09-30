import { Service, Inject } from 'typedi'
import { ITransactionRepository } from '../core/interfaces/repositories/ITransactionRepository'
import { IAccountRepository } from '../core/interfaces/repositories/IAccountRepository'
import { ICategoryRepository } from '../core/interfaces/repositories/ICategoryRepository'
import { IUserCategoryRepository } from '../core/interfaces/repositories/IUserCategoryRepository'
import { Transaction, TransactionType, TransactionStatus } from '../core/entities/Transaction'
import { RedisService } from '../infrastructure/cache/RedisService'

@Service()
export class TransactionService {
  constructor(
    @Inject('ITransactionRepository') private transactionRepository: ITransactionRepository,
    @Inject('IAccountRepository') private accountRepository: IAccountRepository,
    @Inject('ICategoryRepository') private categoryRepository: ICategoryRepository, // 🔄 Legacy support
    @Inject('IUserCategoryRepository') private userCategoryRepository: IUserCategoryRepository, // 🚀 New architecture
    private redisService: RedisService
  ) {}

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & {
    userCategoryId?: string // Support new architecture
  }): Promise<Transaction> {
    // Validate account exists and belongs to user
    const account = await this.accountRepository.findById(data.accountId)
    if (!account || account.userId !== data.userId) {
      throw new Error('Account not found or does not belong to user')
    }

    // Validate category - support both architectures
    if (data.userCategoryId) {
      // 🚀 New architecture: validate UserCategory
      const userCategory = await this.userCategoryRepository.findById(data.userCategoryId)
      if (!userCategory || userCategory.userId !== data.userId) {
        throw new Error('User category not found or does not belong to user')
      }
      if (!userCategory.isActive) {
        throw new Error('Cannot use inactive category for transactions')
      }
    } else {
      // 🔄 Legacy architecture: validate Category
      const category = await this.categoryRepository.findById(data.categoryId)
      if (!category || (category.userId !== data.userId && !category.isSystem)) {
        throw new Error('Category not found or does not belong to user')
      }
    }

    // For transfers, validate destination account
    if (data.type === TransactionType.TRANSFER && data.toAccountId) {
      const toAccount = await this.accountRepository.findById(data.toAccountId)
      if (!toAccount || toAccount.userId !== data.userId) {
        throw new Error('Destination account not found or does not belong to user')
      }
    }

    // Create transaction
    const transactionData = new Transaction({
      userId: data.userId,
      description: data.description,
      amount: data.amount,
      type: data.type,
      categoryId: data.categoryId, // 🔄 Legacy support
      userCategoryId: data.userCategoryId, // 🚀 New architecture
      accountId: data.accountId,
      toAccountId: data.toAccountId,
      status: TransactionStatus.PENDING,
      date: data.date,
      reference: data.reference,
      metadata: data.metadata
    })

    const transaction = await this.transactionRepository.create(transactionData)

    // Update account balances
    await this.updateAccountBalances(transaction)

    // Clear cache
    await this.clearUserCache(data.userId)

    return transaction
  }

  async getTransactionById(id: string, userId?: string): Promise<Transaction | null> {
    const cacheKey = `transaction:${id}`

    // Try to get from cache first
    const cached = await this.redisService.get<Transaction>(cacheKey)
    if (cached && cached.id) {
      return cached
    }

    const transaction = await this.transactionRepository.findById(id)

    // If userId is provided, validate ownership
    if (transaction && userId && transaction.userId !== userId) {
      return null
    }

    if (transaction) {
      // Cache for 5 minutes
      await this.redisService.set(cacheKey, transaction, 300)
    }

    return transaction
  }

  async getTransactionsByUser(
    userId: string,
    options?: {
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      filters?: {
        categoryId?: string
        accountId?: string
        type?: string
        status?: string
        dateFrom?: Date
        dateTo?: Date
        amountMin?: number
        amountMax?: number
      }
    }
  ): Promise<{ data: Transaction[]; total: number; page: number; limit: number }> {
    const cacheKey = `transactions:${userId}:${JSON.stringify(options || {})}`

    // Try cache first
    const cached = await this.redisService.get<{ data: Transaction[]; total: number; page: number; limit: number }>(cacheKey)
    if (cached && cached.data) {
      return cached
    }

    const filters = options?.filters ? {
      type: options.filters.type,
      status: options.filters.status,
      categoryId: options.filters.categoryId,
      accountId: options.filters.accountId,
      dateFrom: options.filters.dateFrom,
      dateTo: options.filters.dateTo,
      limit: options?.limit,
      offset: options?.page ? (options.page - 1) * (options.limit || 10) : undefined
    } : {}

    const result = await this.transactionRepository.findByUserId(userId, filters)

    const formattedResult = {
      data: result.transactions,
      total: result.total,
      page: options?.page || 1,
      limit: options?.limit || 10
    }

    // Cache for 1 minute
    await this.redisService.set(cacheKey, formattedResult, 60)

    return formattedResult
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const existing = await this.transactionRepository.findById(id)
    if (!existing) {
      throw new Error('Transaction not found')
    }

    // Validate account changes
    if (data.accountId && data.accountId !== existing.accountId) {
      const account = await this.accountRepository.findById(data.accountId)
      if (!account || account.userId !== existing.userId) {
        throw new Error('Account not found or does not belong to user')
      }
    }

    // Validate category changes - support both architectures
    if (data.userCategoryId && data.userCategoryId !== existing.userCategoryId) {
      // 🚀 New architecture: validate UserCategory
      const userCategory = await this.userCategoryRepository.findById(data.userCategoryId)
      if (!userCategory || userCategory.userId !== existing.userId) {
        throw new Error('User category not found or does not belong to user')
      }
      if (!userCategory.isActive) {
        throw new Error('Cannot use inactive category for transactions')
      }
    } else if (data.categoryId && data.categoryId !== existing.categoryId) {
      // 🔄 Legacy architecture: validate Category
      const category = await this.categoryRepository.findById(data.categoryId)
      if (!category || (category.userId !== existing.userId && !category.isSystem)) {
        throw new Error('Category not found or does not belong to user')
      }
    }

    // Revert old balance changes if amount or account changed
    if (data.amount !== undefined || data.accountId !== undefined) {
      await this.revertAccountBalances(existing)
    }

    // Update transaction
    const updatedTransaction = Object.assign(existing, data)
    const updated = await this.transactionRepository.update(updatedTransaction)

    // Apply new balance changes
    if (data.amount !== undefined || data.accountId !== undefined) {
      await this.updateAccountBalances(updated)
    }

    // Clear cache
    await this.clearUserCache(existing.userId)

    return updated
  }

  async deleteTransaction(id: string): Promise<void> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    // Revert account balance changes
    await this.revertAccountBalances(transaction)

    // Delete transaction
    await this.transactionRepository.delete(id)

    // Clear cache
    await this.clearUserCache(transaction.userId)
  }

  async getMonthlyStats(userId: string, year: number, month: number) {
    const cacheKey = `monthly-stats:${userId}:${year}:${month}`

    const cached = await this.redisService.get(cacheKey)
    if (cached && typeof cached === 'object') {
      return cached
    }

    const stats = await this.transactionRepository.getMonthlySpending(userId, year, month)

    // Cache for 1 hour
    await this.redisService.set(cacheKey, stats, 3600)

    return stats
  }

  async getCategoryAnalysis(userId: string, year: number, month?: number) {
    const cacheKey = `category-analysis:${userId}:${year}:${month || 'all'}`

    const cached = await this.redisService.get(cacheKey)
    if (cached && typeof cached === 'object') {
      return cached
    }

    const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1)
    const endDate = month ? new Date(year, month, 0) : new Date(year, 11, 31)

    // Buscar transações do período
    const transactions = await this.transactionRepository.findByUserId(userId, {
      dateFrom: startDate,
      dateTo: endDate
    })

    // Agrupar por categoria
    const categoryGroups: Record<string, {
      income: number,
      expense: number,
      count: number,
      categoryName: string,
      transactions: any[]
    }> = {}

    for (const transaction of transactions.transactions) {
      const categoryId = transaction.getCategoryId() // Use helper method to get the right category ID
      if (!categoryGroups[categoryId]) {
        // Buscar nome da categoria - support both architectures
        let categoryName = 'Categoria desconhecida'

        if (transaction.isUsingNewCategoryArchitecture() && transaction.userCategoryId) {
          // 🚀 New architecture: get UserCategory name
          const userCategory = await this.userCategoryRepository.findById(transaction.userCategoryId)
          categoryName = userCategory?.name || 'Categoria desconhecida'
        } else {
          // 🔄 Legacy architecture: get Category name
          const category = await this.categoryRepository.findById(transaction.categoryId)
          categoryName = category?.name || 'Categoria desconhecida'
        }

        categoryGroups[categoryId] = {
          income: 0,
          expense: 0,
          count: 0,
          categoryName,
          transactions: []
        }
      }

      categoryGroups[categoryId].count++
      categoryGroups[categoryId].transactions.push(transaction)

      if (transaction.type === 'INCOME') {
        categoryGroups[categoryId].income += Number(transaction.amount)
      } else if (transaction.type === 'EXPENSE') {
        categoryGroups[categoryId].expense += Number(transaction.amount)
      }
    }

    // Calcular percentuais
    const totalIncome = Object.values(categoryGroups).reduce((sum, cat) => sum + cat.income, 0)
    const totalExpense = Object.values(categoryGroups).reduce((sum, cat) => sum + cat.expense, 0)

    const result = {
      summary: {
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
        transactionCount: transactions.total
      },
      categories: Object.entries(categoryGroups).map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.categoryName,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
        transactionCount: data.count,
        incomePercentage: totalIncome > 0 ? (data.income / totalIncome) * 100 : 0,
        expensePercentage: totalExpense > 0 ? (data.expense / totalExpense) * 100 : 0
      }))
    }

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, result, 1800)

    return result
  }

  async getTrendAnalysis(userId: string) {
    const cacheKey = `trend-analysis:${userId}`

    const cached = await this.redisService.get(cacheKey)
    if (cached && typeof cached === 'object') {
      return cached
    }

    const currentYear = new Date().getFullYear()

    // Últimos 12 meses
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      const transactions = await this.transactionRepository.findByUserId(userId, {
        dateFrom: startDate,
        dateTo: endDate
      })

      let income = 0
      let expense = 0

      transactions.transactions.forEach(t => {
        if (t.type === 'INCOME') income += Number(t.amount)
        if (t.type === 'EXPENSE') expense += Number(t.amount)
      })

      monthlyData.push({
        year,
        month,
        monthName: date.toLocaleDateString('pt-BR', { month: 'long' }),
        income,
        expense,
        net: income - expense,
        transactionCount: transactions.transactions.length
      })
    }

    const result = {
      monthlyTrend: monthlyData,
      averages: {
        monthlyIncome: monthlyData.reduce((sum, m) => sum + m.income, 0) / 12,
        monthlyExpense: monthlyData.reduce((sum, m) => sum + m.expense, 0) / 12,
        monthlyNet: monthlyData.reduce((sum, m) => sum + m.net, 0) / 12
      }
    }

    // Cache for 1 hour
    await this.redisService.set(cacheKey, result, 3600)

    return result
  }

  async getComparisonAnalysis(userId: string, year: number, month?: number) {
    const cacheKey = `comparison-analysis:${userId}:${year}:${month || 'all'}`

    const cached = await this.redisService.get(cacheKey)
    if (cached && typeof cached === 'object') {
      return cached
    }

    // Período atual
    const currentStartDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1)
    const currentEndDate = month ? new Date(year, month, 0) : new Date(year, 11, 31)

    // Período anterior
    const prevStartDate = month
      ? new Date(year, month - 2, 1)
      : new Date(year - 1, 0, 1)
    const prevEndDate = month
      ? new Date(year, month - 1, 0)
      : new Date(year - 1, 11, 31)

    const [currentPeriod, previousPeriod] = await Promise.all([
      this.transactionRepository.findByUserId(userId, {
        dateFrom: currentStartDate,
        dateTo: currentEndDate
      }),
      this.transactionRepository.findByUserId(userId, {
        dateFrom: prevStartDate,
        dateTo: prevEndDate
      })
    ])

    const calculateTotals = (transactions: any[]) => {
      let income = 0
      let expense = 0
      transactions.forEach(t => {
        if (t.type === 'INCOME') income += Number(t.amount)
        if (t.type === 'EXPENSE') expense += Number(t.amount)
      })
      return { income, expense, net: income - expense, count: transactions.length }
    }

    const current = calculateTotals(currentPeriod.transactions)
    const previous = calculateTotals(previousPeriod.transactions)

    const result = {
      current,
      previous,
      changes: {
        income: {
          amount: current.income - previous.income,
          percentage: previous.income > 0 ? ((current.income - previous.income) / previous.income) * 100 : 0
        },
        expense: {
          amount: current.expense - previous.expense,
          percentage: previous.expense > 0 ? ((current.expense - previous.expense) / previous.expense) * 100 : 0
        },
        net: {
          amount: current.net - previous.net,
          percentage: previous.net !== 0 ? ((current.net - previous.net) / Math.abs(previous.net)) * 100 : 0
        },
        transactionCount: {
          amount: current.count - previous.count,
          percentage: previous.count > 0 ? ((current.count - previous.count) / previous.count) * 100 : 0
        }
      }
    }

    // Cache for 30 minutes
    await this.redisService.set(cacheKey, result, 1800)

    return result
  }

  async getAdvancedInsights(userId: string) {
    const cacheKey = `advanced-insights:${userId}`

    const cached = await this.redisService.get(cacheKey)
    if (cached && typeof cached === 'object') {
      return cached
    }

    // Análise dos últimos 3 meses para insights
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 3)

    const transactions = await this.transactionRepository.findByUserId(userId, {
      dateFrom: startDate,
      dateTo: endDate
    })

    const insights = {
      spending_patterns: this.analyzeSpendingPatterns(transactions.transactions),
      budget_recommendations: this.generateBudgetRecommendations(transactions.transactions),
      savings_potential: this.calculateSavingsPotential(transactions.transactions),
      category_insights: this.generateCategoryInsights(transactions.transactions),
      alerts: this.generateAlerts(transactions.transactions)
    }

    // Cache for 2 hours
    await this.redisService.set(cacheKey, insights, 7200)

    return insights
  }

  private analyzeSpendingPatterns(transactions: any[]) {
    const expenses = transactions.filter(t => t.type === 'EXPENSE')

    // Padrões por dia da semana
    const weekdaySpending: Record<number, number> = {}
    expenses.forEach(t => {
      const weekday = new Date(t.date).getDay()
      weekdaySpending[weekday] = (weekdaySpending[weekday] || 0) + Number(t.amount)
    })

    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
    const weekdayAnalysis = Object.entries(weekdaySpending).map(([day, amount]) => ({
      day: weekdays[parseInt(day)],
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }))

    return {
      most_expensive_weekday: weekdayAnalysis.length > 0
        ? weekdayAnalysis.reduce((max, current) =>
            current.amount > max.amount ? current : max
          )
        : null,
      average_transaction_value: expenses.length > 0
        ? expenses.reduce((sum, t) => sum + Number(t.amount), 0) / expenses.length
        : 0,
      weekday_analysis: weekdayAnalysis
    }
  }

  private generateBudgetRecommendations(transactions: any[]) {
    const monthlyExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0) / 3 // Média dos últimos 3 meses

    const monthlyIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0) / 3

    return {
      recommended_monthly_budget: monthlyExpenses * 1.1, // 10% de margem
      emergency_fund_target: monthlyExpenses * 6,
      savings_target: monthlyIncome * 0.2, // 20% da renda
      current_savings_rate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0
    }
  }

  private calculateSavingsPotential(transactions: any[]) {
    const expenses = transactions.filter(t => t.type === 'EXPENSE')

    // Categorias com maior potencial de economia
    const categorySpending: Record<string, { total: number, count: number, avg: number }> = {}

    expenses.forEach(t => {
      if (!categorySpending[t.categoryId]) {
        categorySpending[t.categoryId] = { total: 0, count: 0, avg: 0 }
      }
      categorySpending[t.categoryId].total += Number(t.amount)
      categorySpending[t.categoryId].count += 1
    })

    Object.keys(categorySpending).forEach(categoryId => {
      const data = categorySpending[categoryId]
      data.avg = data.total / data.count
    })

    return {
      total_expenses_last_3_months: expenses.reduce((sum, t) => sum + Number(t.amount), 0),
      potential_monthly_savings: Object.values(categorySpending)
        .reduce((sum, cat) => sum + cat.total, 0) * 0.1 / 3, // 10% de economia potencial
      high_spending_categories: Object.entries(categorySpending)
        .sort(([,a], [,b]) => b.total - a.total)
        .slice(0, 3)
        .map(([categoryId, data]) => ({ categoryId, ...data }))
    }
  }

  private generateCategoryInsights(transactions: any[]) {
    const expenses = transactions.filter(t => t.type === 'EXPENSE')
    const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0)

    const categoryTotals: Record<string, number> = {}
    expenses.forEach(t => {
      categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + Number(t.amount)
    })

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    return {
      top_expense_categories: sortedCategories.map(([categoryId, amount]) => ({
        categoryId,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      })),
      category_distribution: Object.entries(categoryTotals).map(([categoryId, amount]) => ({
        categoryId,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      }))
    }
  }

  private generateAlerts(transactions: any[]) {
    const alerts = []
    const currentMonth = new Date().getMonth()
    const currentMonthTransactions = transactions.filter(t =>
      new Date(t.date).getMonth() === currentMonth
    )

    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const previousMonthTransactions = transactions.filter(t =>
      new Date(t.date).getMonth() === currentMonth - 1
    )

    const previousMonthExpenses = previousMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Alert de gasto alto
    if (currentMonthExpenses > previousMonthExpenses * 1.2) {
      alerts.push({
        type: 'high_spending',
        message: 'Seus gastos este mês estão 20% acima do mês anterior',
        severity: 'warning',
        recommendation: 'Revise seus gastos e identifique onde é possível economizar'
      })
    }

    // Alert de economia
    if (currentMonthExpenses < previousMonthExpenses * 0.9) {
      alerts.push({
        type: 'good_savings',
        message: 'Parabéns! Você economizou 10% comparado ao mês anterior',
        severity: 'info',
        recommendation: 'Continue mantendo esse controle financeiro'
      })
    }

    return alerts
  }

  private async updateAccountBalances(transaction: Transaction): Promise<void> {
    if (transaction.status !== TransactionStatus.COMPLETED) {
      return
    }

    const account = await this.accountRepository.findById(transaction.accountId)
    if (!account) return

    switch (transaction.type) {
      case TransactionType.INCOME:
        await this.accountRepository.updateBalance(
          transaction.accountId,
          account.balance.plus(transaction.amount).toNumber()
        )
        break

      case TransactionType.EXPENSE:
        await this.accountRepository.updateBalance(
          transaction.accountId,
          account.balance.minus(transaction.amount).toNumber()
        )
        break

      case TransactionType.TRANSFER:
        if (transaction.toAccountId) {
          const toAccount = await this.accountRepository.findById(transaction.toAccountId)
          if (toAccount) {
            // Deduct from source account
            await this.accountRepository.updateBalance(
              transaction.accountId,
              account.balance.minus(transaction.amount).toNumber()
            )
            // Add to destination account
            await this.accountRepository.updateBalance(
              transaction.toAccountId,
              toAccount.balance.plus(transaction.amount).toNumber()
            )
          }
        }
        break
    }
  }

  private async revertAccountBalances(transaction: Transaction): Promise<void> {
    if (transaction.status !== TransactionStatus.COMPLETED) {
      return
    }

    const account = await this.accountRepository.findById(transaction.accountId)
    if (!account) return

    switch (transaction.type) {
      case TransactionType.INCOME:
        await this.accountRepository.updateBalance(
          transaction.accountId,
          account.balance.minus(transaction.amount).toNumber()
        )
        break

      case TransactionType.EXPENSE:
        await this.accountRepository.updateBalance(
          transaction.accountId,
          account.balance.plus(transaction.amount).toNumber()
        )
        break

      case TransactionType.TRANSFER:
        if (transaction.toAccountId) {
          const toAccount = await this.accountRepository.findById(transaction.toAccountId)
          if (toAccount) {
            // Add back to source account
            await this.accountRepository.updateBalance(
              transaction.accountId,
              account.balance.plus(transaction.amount).toNumber()
            )
            // Deduct from destination account
            await this.accountRepository.updateBalance(
              transaction.toAccountId,
              toAccount.balance.minus(transaction.amount).toNumber()
            )
          }
        }
        break
    }
  }

  private async clearUserCache(userId: string): Promise<void> {
    const patterns = [
      `transactions:${userId}:*`,
      `monthly-stats:${userId}:*`,
      `user-stats:${userId}:*`
    ]

    for (const pattern of patterns) {
      await this.redisService.invalidatePattern(pattern)
    }
  }
}
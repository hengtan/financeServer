import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { Container } from 'typedi'
import { AuthService } from '../../services/AuthService'
import { RedisService } from '../../infrastructure/cache/RedisService'

export default async function dashboardRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Temporary fix for DI issues
  const accountRepository = Container.get('IAccountRepository') as any
  const transactionRepository = Container.get('ITransactionRepository') as any
  const goalRepository = Container.get('IGoalRepository') as any
  const budgetRepository = Container.get('IBudgetRepository') as any
  const userRepository = Container.get('IUserRepository') as any
  const userCategoryRepository = Container.get('IUserCategoryRepository') as any
  const redisService = Container.get(RedisService)
  const authService = new AuthService(userRepository, userCategoryRepository, accountRepository, redisService)
  const prefix = '/api/dashboard'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // GET /api/dashboard/overview - Visão geral financeira completa
  fastify.get(`${prefix}/overview`, async (request, reply) => {
    try {
      console.log('📊 Dashboard overview request:', request.query)
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any

      // Aceitar period (dias) OU startDate/endDate específicas
      let startDate: Date
      let endDate: Date
      let period: string

      if (query.startDate && query.endDate) {
        // Usar datas específicas se fornecidas
        startDate = new Date(query.startDate)
        endDate = new Date(query.endDate)
        // Calculate period in days for response
        period = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)).toString()
      } else {
        // Fallback: usar period (dias retroativos)
        period = query.period || '30'
        endDate = new Date()
        endDate.setDate(endDate.getDate() + 30) // Include 30 days in the future
        startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))
      }

      // Buscar dados em paralelo para melhor performance
      const [accountsResult, transactions, goalsResult, budgetsResult] = await Promise.all([
        accountRepository.findByUserId(user.id),
        transactionRepository.findByUserIdAndPeriod(user.id, startDate.toISOString(), endDate.toISOString()),
        goalRepository.findByUserId(user.id, 'ACTIVE'),
        budgetRepository.findByUserId(user.id, { status: 'ACTIVE' })
      ])

      // Extrair arrays dos resultados
      const accounts = accountsResult?.accounts || []
      const goals = goalsResult || []
      const budgets = budgetsResult?.budgets || []

      // Calcular métricas financeiras
      const accountsBalance = accounts.reduce((sum: number, acc: any) =>
        sum + parseFloat(acc.balance || '0'), 0)

      const incomeTransactions = transactions?.filter((t: any) => t.type === 'INCOME') || []
      const expenseTransactions = transactions?.filter((t: any) => t.type === 'EXPENSE') || []

      const totalIncome = incomeTransactions.reduce((sum: number, t: any) =>
        sum + parseFloat(t.amount || '0'), 0)
      const totalExpenses = expenseTransactions.reduce((sum: number, t: any) =>
        sum + Math.abs(parseFloat(t.amount || '0')), 0)

      const netIncome = totalIncome - totalExpenses

      // Balanço do período = receitas - despesas (usado para análise financeira)
      const totalBalance = netIncome

      // Calcular progresso das metas
      const goalsProgress = goals?.map((goal: any) => {
        const targetAmount = parseFloat(goal.targetAmount?.toString() || '0')
        const currentAmount = parseFloat(goal.currentAmount?.toString() || '0')
        const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0

        return {
          id: goal.id,
          name: goal.name,
          progress: Math.min(100, progress),
          target: targetAmount,
          current: currentAmount,
          remaining: Math.max(0, targetAmount - currentAmount)
        }
      }) || []

      // Calcular status dos orçamentos
      const budgetsStatus = await Promise.all(
        (budgets || []).map(async (budget: any) => {
          const budgetTransactions = await transactionRepository.findByUserIdAndPeriod(
            user.id,
            budget.startDate,
            budget.endDate,
            { categoryId: budget.categoryId, type: 'EXPENSE' }
          )

          const spent = budgetTransactions?.reduce((sum: number, t: any) =>
            sum + Math.abs(parseFloat(t.amount?.toString() || '0')), 0) || 0

          const budgetAmount = parseFloat(budget.amount?.toString() || '0')
          const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0

          return {
            id: budget.id,
            name: budget.name,
            spent,
            budget: budgetAmount,
            progress: Math.min(100, progress),
            remaining: Math.max(0, budgetAmount - spent),
            status: progress >= 100 ? 'EXCEEDED' : progress >= 90 ? 'WARNING' : 'OK'
          }
        })
      )

      // Análise de gastos por categoria (últimos 30 dias)
      const categoryExpenses = expenseTransactions.reduce((acc: any, transaction: any) => {
        const categoryId = transaction.userCategoryId || transaction.categoryId || 'uncategorized'
        if (!acc[categoryId]) {
          acc[categoryId] = {
            categoryId,
            categoryName: transaction.userCategory?.name || transaction.category?.name || 'Sem categoria',
            total: 0,
            count: 0
          }
        }
        acc[categoryId].total += Math.abs(parseFloat(transaction.amount || '0'))
        acc[categoryId].count += 1
        return acc
      }, {})

      const topExpenseCategories = Object.values(categoryExpenses)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 5)
        .map((cat: any) => ({
          ...cat,
          total: Number(cat.total.toFixed(2)),
          percentage: expenseTransactions.length > 0
            ? Number(((cat.total / totalExpenses) * 100).toFixed(1))
            : 0
        }))

      // Tendência de gastos (últimos 7 dias vs 7 dias anteriores)
      const last7Days = new Date(endDate)
      last7Days.setDate(last7Days.getDate() - 7)
      const previous7Days = new Date(endDate)
      previous7Days.setDate(previous7Days.getDate() - 14)

      const [recentExpenses, previousExpenses] = await Promise.all([
        transactionRepository.findByUserIdAndPeriod(
          user.id,
          last7Days.toISOString(),
          endDate.toISOString(),
          { type: 'EXPENSE' }
        ),
        transactionRepository.findByUserIdAndPeriod(
          user.id,
          previous7Days.toISOString(),
          last7Days.toISOString(),
          { type: 'EXPENSE' }
        )
      ])

      const recentTotal = recentExpenses?.reduce((sum: number, t: any) =>
        sum + Math.abs(parseFloat(t.amount || '0')), 0) || 0
      const previousTotal = previousExpenses?.reduce((sum: number, t: any) =>
        sum + Math.abs(parseFloat(t.amount || '0')), 0) || 0

      const expenseTrend = previousTotal > 0 ?
        ((recentTotal - previousTotal) / previousTotal) * 100 : 0

      return {
        success: true,
        data: {
          period: { days: parseInt(period), startDate, endDate },
          financial: {
            totalBalance,
            totalIncome,
            totalExpenses,
            netIncome,
            expenseTrend: {
              percentage: expenseTrend,
              direction: expenseTrend > 0 ? 'UP' : expenseTrend < 0 ? 'DOWN' : 'STABLE'
            }
          },
          accounts: {
            total: accounts.length,
            active: accounts.filter((acc: any) => acc.status === 'ACTIVE').length,
            totalBalance: accountsBalance,
            isEmpty: accounts.length === 0
          },
          transactions: {
            total: transactions?.length || 0,
            income: incomeTransactions.length,
            expenses: expenseTransactions.length,
            avgTransactionAmount: transactions?.length > 0 ?
              Math.abs(totalExpenses + totalIncome) / transactions.length : 0,
            isEmpty: (transactions?.length || 0) === 0
          },
          goals: {
            total: goals.length,
            averageProgress: goalsProgress.length > 0 ?
              goalsProgress.reduce((sum, g) => sum + g.progress, 0) / goalsProgress.length : 0,
            completedGoals: goalsProgress.filter(g => g.progress >= 100).length,
            activeGoals: goalsProgress,
            isEmpty: goals.length === 0
          },
          budgets: {
            total: budgets.length,
            exceeded: budgetsStatus.filter(b => b.status === 'EXCEEDED').length,
            warning: budgetsStatus.filter(b => b.status === 'WARNING').length,
            activeBudgets: budgetsStatus,
            isEmpty: budgets.length === 0
          },
          analytics: {
            topExpenseCategories,
            hasExpenseData: expenseTransactions.length > 0,
            hasIncomeData: incomeTransactions.length > 0,
            monthlyTrend: expenseTrend,
            financialHealth: {
              score: calculateFinancialHealthScore({
                income: totalIncome,
                expenses: totalExpenses,
                savings: totalBalance,
                budgetCompliance: budgetsStatus.filter(b => b.status === 'OK').length / (budgetsStatus.length || 1)
              }),
              recommendations: generateRecommendations({
                netIncome,
                expenseTrend,
                budgetStatus: budgetsStatus,
                goalProgress: goalsProgress
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Dashboard overview error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
      const errorStack = error instanceof Error ? error.stack : ''

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      console.error('Stack trace:', errorStack)
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/dashboard/quick-stats - Estatísticas rápidas para widgets
  fastify.get(`${prefix}/quick-stats`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const [accountsResult, recentTransactionsResult, activeGoals, activeBudgetsResult] = await Promise.all([
        accountRepository.findByUserId(user.id),
        transactionRepository.findByUserId(user.id, { limit: 10 }),
        goalRepository.findByUserId(user.id, 'ACTIVE'),
        budgetRepository.findByUserId(user.id, { status: 'ACTIVE' })
      ])

      const accounts = accountsResult?.accounts || []
      const recentTransactions = recentTransactionsResult?.transactions || []
      const activeBudgets = activeBudgetsResult?.budgets || []

      const totalBalance = accounts.reduce((sum: number, acc: any) =>
        sum + parseFloat(acc.balance || '0'), 0)

      return {
        success: true,
        data: {
          totalBalance,
          accountsCount: accounts.length,
          recentTransactionsCount: recentTransactions.length,
          activeGoalsCount: activeGoals?.length || 0,
          activeBudgetsCount: activeBudgets.length,
          lastTransactionDate: recentTransactions[0]?.date || null
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      if (errorMessage.includes('Token') || errorMessage.includes('inválido')) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou expirado'
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
        errors: [errorMessage]
      })
    }
  })

  // Métodos auxiliares
  const calculateFinancialHealthScore = (data: {
    income: number
    expenses: number
    savings: number
    budgetCompliance: number
  }): number => {
    let score = 0

    // Renda vs Gastos (30 pontos)
    if (data.income > data.expenses) {
      const savingsRate = (data.income - data.expenses) / data.income
      score += Math.min(30, savingsRate * 100)
    }

    // Reserva de emergência (30 pontos)
    const emergencyMonths = data.savings / (data.expenses || 1)
    score += Math.min(30, emergencyMonths * 10)

    // Cumprimento de orçamentos (25 pontos)
    score += data.budgetCompliance * 25

    // Consistência financeira (15 pontos)
    score += 15 // Base score para ter dados

    return Math.round(Math.min(100, score))
  }

  const generateRecommendations = (data: {
    netIncome: number
    expenseTrend: number
    budgetStatus: any[]
    goalProgress: any[]
  }): string[] => {
    const recommendations: string[] = []

    if (data.netIncome < 0) {
      recommendations.push('Sua renda está menor que os gastos. Considere revisar suas despesas.')
    }

    if (data.expenseTrend > 10) {
      recommendations.push('Seus gastos aumentaram significativamente. Verifique onde é possível economizar.')
    }

    const exceededBudgets = data.budgetStatus.filter(b => b.status === 'EXCEEDED')
    if (exceededBudgets.length > 0) {
      recommendations.push(`Você excedeu ${exceededBudgets.length} orçamento(s). Revise seus limites.`)
    }

    const stagnantGoals = data.goalProgress.filter(g => g.progress < 10)
    if (stagnantGoals.length > 0) {
      recommendations.push(`${stagnantGoals.length} meta(s) com pouco progresso. Considere ajustar os valores.`)
    }

    if (recommendations.length === 0) {
      recommendations.push('Parabéns! Sua situação financeira está bem equilibrada.')
    }

    return recommendations
  }

  // GET /api/dashboard/daily-expenses - Gastos diários agrupados
  fastify.get(`${prefix}/daily-expenses`, async (request, reply) => {
    try {
      console.log('🎯 Daily expenses endpoint called')
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      console.log(`👤 User: ${user.email}`)
      const query = request.query as any
      const days = parseInt(query.days || '30')
      console.log(`📅 Requested days: ${days}`)

      // Calcular período - Ajustar para usar midnight UTC
      const endDate = new Date()
      endDate.setUTCHours(23, 59, 59, 999) // End of today
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - (days - 1)) // days - 1 to include today
      startDate.setUTCHours(0, 0, 0, 0) // Start of day

      console.log(`📅 Calculating period: ${days} days`)
      console.log(`📅 Start date: ${startDate.toISOString()}`)
      console.log(`📅 End date: ${endDate.toISOString()}`)

      // Buscar transações do período
      const transactions = await transactionRepository.findByUserIdAndPeriod(
        user.id,
        startDate.toISOString(),
        endDate.toISOString()
      )

      console.log(`📊 Daily expenses: Found ${transactions?.length || 0} total transactions`)
      console.log(`📅 Period: ${startDate.toISOString()} to ${endDate.toISOString()}`)

      // Agrupar por dia
      const dailyExpenses: { [key: string]: number } = {}

      // Inicializar todos os dias com 0
      console.log(`🔄 Initializing ${days} days starting from ${startDate.toISOString()}`)
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setUTCDate(date.getUTCDate() + i)
        const dateKey = date.toISOString().split('T')[0]
        dailyExpenses[dateKey] = 0
        if (i < 3 || i >= days - 3) {
          console.log(`  Day ${i}: ${dateKey}`)
        }
      }
      console.log(`✅ Initialized ${Object.keys(dailyExpenses).length} days`)

      // Somar gastos por dia
      const expenseTransactions = transactions?.filter((t: any) => t.type === 'EXPENSE') || []
      console.log(`💸 Found ${expenseTransactions.length} EXPENSE transactions`)

      // Log all available keys
      const availableKeys = Object.keys(dailyExpenses)
      console.log(`🔑 Available date keys (first 5):`, availableKeys.slice(0, 5))
      console.log(`🔑 Available date keys (last 5):`, availableKeys.slice(-5))

      for (const transaction of expenseTransactions) {
        const dateKey = new Date(transaction.date).toISOString().split('T')[0]
        const amount = Math.abs(parseFloat(transaction.amount?.toString() || '0'))
        console.log(`  - Transaction date key: ${dateKey}, R$ ${amount} (${transaction.description})`)
        console.log(`    Key exists in dailyExpenses? ${dailyExpenses[dateKey] !== undefined}`)
        console.log(`    Current value: ${dailyExpenses[dateKey]}`)
        if (dailyExpenses[dateKey] !== undefined) {
          dailyExpenses[dateKey] += amount
          console.log(`    New value: ${dailyExpenses[dateKey]}`)
        } else {
          console.log(`    ⚠️  KEY NOT FOUND! Transaction date ${dateKey} not in range`)
        }
      }

      // Converter para array ordenado
      const dailyData = Object.entries(dailyExpenses)
        .map(([date, total]) => ({
          date,
          total: Number(total.toFixed(2))
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Log final data with non-zero values
      const dataWithValues = dailyData.filter(d => d.total > 0)
      console.log(`📤 Returning ${dailyData.length} days, ${dataWithValues.length} with values`)
      if (dataWithValues.length > 0) {
        console.log(`💵 Days with values:`, dataWithValues)
      }

      return {
        success: true,
        data: dailyData
      }
    } catch (error) {
      console.error('❌ Daily expenses error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      return reply.status(500).send({
        success: false,
        message: 'Erro ao buscar gastos diários',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/dashboard/income-by-category - Receitas agrupadas por categoria
  fastify.get(`${prefix}/income-by-category`, async (request, reply) => {
    try {
      console.log('💰 Income by category endpoint called')
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      let startDate: Date
      let endDate: Date

      if (query.startDate && query.endDate) {
        startDate = new Date(query.startDate)
        endDate = new Date(query.endDate)
      } else {
        // Default: current month
        endDate = new Date()
        endDate.setUTCHours(23, 59, 59, 999)
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
        startDate.setUTCHours(0, 0, 0, 0)
      }

      console.log(`📅 Period: ${startDate.toISOString()} to ${endDate.toISOString()}`)

      // Buscar transações de receita do período
      const transactions = await transactionRepository.findByUserIdAndPeriod(
        user.id,
        startDate.toISOString(),
        endDate.toISOString()
      )

      const incomeTransactions = transactions?.filter((t: any) => t.type === 'INCOME') || []
      console.log(`💵 Found ${incomeTransactions.length} INCOME transactions`)

      if (incomeTransactions.length === 0) {
        return {
          success: true,
          data: []
        }
      }

      // Agrupar receitas por categoria
      const categoryIncome = incomeTransactions.reduce((acc: any, transaction: any) => {
        const categoryId = transaction.userCategoryId || transaction.categoryId || 'uncategorized'
        if (!acc[categoryId]) {
          acc[categoryId] = {
            categoryId,
            categoryName: transaction.userCategory?.name || transaction.category?.name || 'Sem categoria',
            total: 0,
            count: 0
          }
        }
        acc[categoryId].total += Math.abs(parseFloat(transaction.amount || '0'))
        acc[categoryId].count += 1
        return acc
      }, {})

      const totalIncome = incomeTransactions.reduce((sum: number, t: any) =>
        sum + Math.abs(parseFloat(t.amount || '0')), 0)

      const incomeByCategory = Object.values(categoryIncome)
        .sort((a: any, b: any) => b.total - a.total)
        .map((cat: any) => ({
          ...cat,
          total: Number(cat.total.toFixed(2)),
          percentage: totalIncome > 0 ? Number(((cat.total / totalIncome) * 100).toFixed(1)) : 0
        }))

      console.log(`📤 Returning ${incomeByCategory.length} income categories`)

      return {
        success: true,
        data: incomeByCategory
      }
    } catch (error) {
      console.error('❌ Income by category error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      return reply.status(500).send({
        success: false,
        message: 'Erro ao buscar receitas por categoria',
        errors: [errorMessage]
      })
    }
  })

  // GET /api/dashboard/monthly-balance - Balanço dos últimos 6 meses
  fastify.get(`${prefix}/monthly-balance`, async (request, reply) => {
    try {
      console.log('📊 Monthly balance endpoint called')
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const months = parseInt(query.months || '6')
      console.log(`📅 Requested months: ${months}`)

      // Calcular período dos últimos N meses
      const endDate = new Date()
      endDate.setUTCHours(23, 59, 59, 999)
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - (months - 1))
      startDate.setDate(1)
      startDate.setUTCHours(0, 0, 0, 0)

      console.log(`📅 Period: ${startDate.toISOString()} to ${endDate.toISOString()}`)

      // Buscar todas as transações do período
      const transactions = await transactionRepository.findByUserIdAndPeriod(
        user.id,
        startDate.toISOString(),
        endDate.toISOString()
      )

      console.log(`📊 Found ${transactions?.length || 0} total transactions`)

      // Agrupar por mês
      const monthlyData: { [key: string]: { income: number; expenses: number } } = {}

      // Inicializar todos os meses com 0
      for (let i = 0; i < months; i++) {
        const date = new Date(startDate)
        date.setMonth(date.getMonth() + i)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyData[monthKey] = { income: 0, expenses: 0 }
      }

      // Processar transações
      for (const transaction of transactions || []) {
        const date = new Date(transaction.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (monthlyData[monthKey]) {
          const amount = Math.abs(parseFloat(transaction.amount?.toString() || '0'))
          if (transaction.type === 'INCOME') {
            monthlyData[monthKey].income += amount
          } else if (transaction.type === 'EXPENSE') {
            monthlyData[monthKey].expenses += amount
          }
        }
      }

      // Converter para array e calcular balanço
      const balanceData = Object.entries(monthlyData)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([monthKey, data]) => {
          const [year, month] = monthKey.split('-')
          const date = new Date(parseInt(year), parseInt(month) - 1, 1)

          return {
            month: monthKey,
            name: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            fullDate: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            income: Number(data.income.toFixed(2)),
            expenses: Number(data.expenses.toFixed(2)),
            balance: Number((data.income - data.expenses).toFixed(2)),
            value: Number((data.income - data.expenses).toFixed(2)) // For recharts
          }
        })

      const monthsWithData = balanceData.filter(m => m.income > 0 || m.expenses > 0).length
      console.log(`📤 Returning ${balanceData.length} months, ${monthsWithData} with data`)

      return {
        success: true,
        data: balanceData
      }
    } catch (error) {
      console.error('❌ Monthly balance error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'

      return reply.status(500).send({
        success: false,
        message: 'Erro ao buscar balanço mensal',
        errors: [errorMessage]
      })
    }
  })

  // Rota de teste
  fastify.get(`${prefix}/test`, async (request, reply) => {
    return {
      success: true,
      message: 'API de dashboard funcionando!',
      timestamp: new Date().toISOString()
    }
  })
}
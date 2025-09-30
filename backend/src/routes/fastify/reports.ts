import { FastifyInstance } from 'fastify'
import { Container } from 'typedi'
import { ReportService } from '../../services/ReportService'
import { TransactionService } from '../../services/TransactionService'
import { AuthService } from '../../services/AuthService'
import { RedisService } from '../../infrastructure/cache/RedisService'
import { FastifyJWTCustomPayload } from '../../infrastructure/auth/JWTPlugin'
import { ReportType, ReportFormat, ReportStatus } from '../../core/entities/Report'

export default async function reportRoutes(fastify: FastifyInstance) {
  const reportService = Container.get(ReportService)
  const transactionRepository = Container.get('ITransactionRepository') as any
  const accountRepository = Container.get('IAccountRepository') as any
  const categoryRepository = Container.get('ICategoryRepository') as any
  const redisService = Container.get(RedisService)
  const transactionService = new TransactionService(transactionRepository, accountRepository, categoryRepository, redisService)

  const userRepository = Container.get('IUserRepository') as any
  const authService = new AuthService(userRepository, redisService)
  const prefix = '/api/reports'

  // Helper function to extract user from token
  const getUserFromToken = async (authHeader?: string) => {
    if (!authHeader) {
      throw new Error('Token não fornecido')
    }
    const token = authHeader.replace('Bearer ', '')
    return await authService.validateToken(token)
  }

  // New report routes using ReportService

  // Get reports with filters
  fastify.get('/reports', async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const filters = request.query as any

      const result = await reportService.getReportsByUser(user.id, {
        type: filters.type,
        status: filters.status,
        format: filters.format,
        limit: filters.limit || 50,
        offset: filters.offset || 0
      })

      return reply.code(200).send({
        success: true,
        data: result
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Get report by ID
  fastify.get('/reports/:id', async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const { id } = request.params as { id: string }

      const report = await reportService.getReportById(id, user.id)

      if (!report) {
        return reply.code(404).send({
          success: false,
          error: 'Report not found'
        })
      }

      return reply.code(200).send({
        success: true,
        data: report
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get report',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Create new report
  fastify.post('/reports', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 1000 },
          type: { type: 'string', enum: Object.values(ReportType) },
          format: { type: 'string', enum: Object.values(ReportFormat) },
          config: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string', enum: Object.values(ReportType) },
              filters: {
                type: 'object',
                properties: {
                  dateFrom: { type: 'string', format: 'date' },
                  dateTo: { type: 'string', format: 'date' },
                  categoryIds: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  accountIds: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  transactionTypes: {
                    type: 'array',
                    items: { type: 'string', enum: ['INCOME', 'EXPENSE'] }
                  },
                  minAmount: { type: 'number' },
                  maxAmount: { type: 'number' }
                }
              },
              format: { type: 'string', enum: Object.values(ReportFormat) },
              options: { type: 'object' }
            },
            required: ['name', 'type', 'format']
          },
          expiresInDays: { type: 'number', minimum: 1, maximum: 365 }
        },
        required: ['name', 'type', 'format', 'config']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const reportData = request.body as any

      // Convert date strings to Date objects if provided
      if (reportData.config.filters?.dateFrom) {
        reportData.config.filters.dateFrom = new Date(reportData.config.filters.dateFrom)
      }
      if (reportData.config.filters?.dateTo) {
        reportData.config.filters.dateTo = new Date(reportData.config.filters.dateTo)
      }

      const report = await reportService.createReport({
        userId,
        ...reportData
      })

      return reply.code(201).send({
        success: true,
        data: report
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to create report',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Delete report
  fastify.delete('/reports/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId
      const { id } = request.params as { id: string }

      await reportService.deleteReport(id, userId)

      return reply.code(200).send({
        success: true,
        message: 'Report deleted successfully'
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete report',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Get report statistics
  fastify.get('/reports/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as FastifyJWTCustomPayload).userId

      const stats = await reportService.getReportStats(userId)

      return reply.code(200).send({
        success: true,
        data: stats
      })
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to get report statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Legacy routes for compatibility

  // GET /api/reports/financial-summary - Resumo financeiro
  fastify.get(`${prefix}/financial-summary`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const currentDate = new Date()
      const year = query.year || currentDate.getFullYear()
      const month = query.month || undefined

      const insights = await transactionService.getAdvancedInsights(user.id)
      const categoryAnalysis = await transactionService.getCategoryAnalysis(user.id, year, month)

      // Calculate totals from category analysis
      const totalIncome = categoryAnalysis?.summary?.totalIncome || 0
      const totalExpenses = categoryAnalysis?.summary?.totalExpense || 0
      const transactionsCount = categoryAnalysis?.summary?.transactionCount || 0

      return {
        success: true,
        data: {
          period: {
            start: query.dateFrom || `${year}-01-01`,
            end: query.dateTo || currentDate.toISOString().split('T')[0]
          },
          totalIncome,
          totalExpenses,
          netIncome: totalIncome - totalExpenses,
          transactionsCount,
          averageTransaction: transactionsCount > 0 ? (totalIncome + totalExpenses) / transactionsCount : 0,
          biggestIncome: { amount: 0, description: 'Nenhuma receita', date: new Date().toISOString().split('T')[0] },
          biggestExpense: { amount: 0, description: 'Nenhuma despesa', date: new Date().toISOString().split('T')[0] }
        }
      }
    } catch (error) {
      console.error('Erro ao obter resumo financeiro:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // GET /api/reports/category-analysis - Análise por categoria
  fastify.get(`${prefix}/category-analysis`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const currentDate = new Date()
      const year = parseInt(query.year) || currentDate.getFullYear()
      const month = query.month ? parseInt(query.month) : undefined

      const categoryAnalysis = await transactionService.getCategoryAnalysis(user.id, year, month)

      return {
        success: true,
        data: categoryAnalysis?.categories || []
      }
    } catch (error) {
      console.error('Erro ao obter análise por categoria:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // GET /api/reports/monthly-trend - Tendência mensal
  fastify.get(`${prefix}/monthly-trend`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const currentDate = new Date()
      const year = parseInt(query.year) || currentDate.getFullYear()

      // Get monthly data for the year
      const monthlyData = []
      for (let month = 1; month <= 12; month++) {
        const monthlyStats = await transactionService.getMonthlyStats(user.id, year, month)
        if (monthlyStats) {
          monthlyData.push({
            month: month.toString().padStart(2, '0'),
            year: year,
            income: monthlyStats.totalIncome || 0,
            expenses: monthlyStats.totalExpenses || 0,
            netIncome: (monthlyStats.totalIncome || 0) - (monthlyStats.totalExpenses || 0),
            transactionsCount: monthlyStats.transactionCount || 0,
            categories: monthlyStats.topCategories || []
          })
        }
      }

      return {
        success: true,
        data: monthlyData.filter(data => data.transactionsCount > 0 || data.income > 0 || data.expenses > 0)
      }
    } catch (error) {
      console.error('Erro ao obter tendência mensal:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // GET /api/reports/dashboard-stats - Estatísticas do dashboard
  fastify.get(`${prefix}/dashboard-stats`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

      // Get current month, last month, and year-to-date stats
      const [currentMonthStats, lastMonthStats, recentTransactions, currentMonthCategoryAnalysis] = await Promise.all([
        transactionService.getMonthlyStats(user.id, currentYear, currentMonth),
        transactionService.getMonthlyStats(user.id, lastMonthYear, lastMonth),
        transactionService.getTransactionsByUser(user.id, { page: 1, limit: 5 }),
        transactionService.getCategoryAnalysis(user.id, currentYear, currentMonth)
      ])

      // Calculate year-to-date totals
      let yearToDateStats = { income: 0, expenses: 0, balance: 0, transactionsCount: 0 }
      for (let month = 1; month <= currentMonth; month++) {
        const monthStats = await transactionService.getMonthlyStats(user.id, currentYear, month)
        if (monthStats) {
          yearToDateStats.income += monthStats.totalIncome || 0
          yearToDateStats.expenses += monthStats.totalExpenses || 0
          yearToDateStats.transactionsCount += monthStats.transactionCount || 0
        }
      }
      yearToDateStats.balance = yearToDateStats.income - yearToDateStats.expenses

      // Calculate trends
      const incomeGrowth = lastMonthStats?.totalIncome && currentMonthStats?.totalIncome ?
        ((currentMonthStats.totalIncome - lastMonthStats.totalIncome) / lastMonthStats.totalIncome) * 100 : 0
      const expenseGrowth = lastMonthStats?.totalExpenses && currentMonthStats?.totalExpenses ?
        ((currentMonthStats.totalExpenses - lastMonthStats.totalExpenses) / lastMonthStats.totalExpenses) * 100 : 0
      const balanceGrowth = lastMonthStats && currentMonthStats ?
        (((currentMonthStats.totalIncome || 0) - (currentMonthStats.totalExpenses || 0)) -
         ((lastMonthStats.totalIncome || 0) - (lastMonthStats.totalExpenses || 0))) /
        Math.abs((lastMonthStats.totalIncome || 0) - (lastMonthStats.totalExpenses || 0) || 1) * 100 : 0

      return {
        success: true,
        data: {
          currentMonth: {
            income: currentMonthStats?.totalIncome || 0,
            expenses: currentMonthStats?.totalExpenses || 0,
            balance: (currentMonthStats?.totalIncome || 0) - (currentMonthStats?.totalExpenses || 0),
            transactionsCount: currentMonthStats?.transactionCount || 0
          },
          lastMonth: {
            income: lastMonthStats?.totalIncome || 0,
            expenses: lastMonthStats?.totalExpenses || 0,
            balance: (lastMonthStats?.totalIncome || 0) - (lastMonthStats?.totalExpenses || 0),
            transactionsCount: lastMonthStats?.transactionCount || 0
          },
          yearToDate: yearToDateStats,
          trends: {
            incomeGrowth: Number(incomeGrowth.toFixed(1)),
            expenseGrowth: Number(expenseGrowth.toFixed(1)),
            balanceGrowth: Number(balanceGrowth.toFixed(1))
          },
          topCategories: currentMonthCategoryAnalysis?.categories?.slice(0, 5).map((cat: any) => ({
            name: cat.categoryName,
            amount: cat.expense || cat.income || 0,
            percentage: cat.expensePercentage || cat.incomePercentage || 0
          })) || [],
          recentTransactions: (recentTransactions?.data || []).slice(0, 3).map((tx: any) => ({
            id: tx.id,
            description: tx.description,
            amount: tx.amount,
            date: tx.date,
            category: tx.category?.name || 'Sem categoria',
            type: tx.amount > 0 ? 'income' : 'expense'
          }))
        }
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // GET /api/reports/expenses-by-category - Gastos por categoria
  fastify.get(`${prefix}/expenses-by-category`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const currentDate = new Date()
      const year = parseInt(query.year) || currentDate.getFullYear()
      const month = query.month ? parseInt(query.month) : undefined

      const categoryAnalysis = await transactionService.getCategoryAnalysis(user.id, year, month)

      // Filter only expenses and add colors
      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
      const categories = Array.isArray(categoryAnalysis?.categories) ? categoryAnalysis.categories :
                        Array.isArray(categoryAnalysis) ? categoryAnalysis : []
      const expenseCategories = categories
        .filter((cat: any) => cat.expense > 0)
        .map((cat: any, index: number) => ({
          category: cat.categoryName,
          amount: Math.abs(cat.expense || 0),
          percentage: cat.expensePercentage || 0,
          count: cat.transactionCount || 0,
          avgAmount: cat.expense > 0 ? cat.expense / cat.transactionCount : 0,
          color: colors[index % colors.length]
        }))

      return {
        success: true,
        data: expenseCategories
      }
    } catch (error) {
      console.error('Erro ao obter gastos por categoria:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // GET /api/reports/income-by-source - Receitas por fonte
  fastify.get(`${prefix}/income-by-source`, async (request, reply) => {
    try {
      const user = await getUserFromToken(request.headers.authorization)
      if (!user) {
        return reply.status(401).send({ success: false, message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const currentDate = new Date()
      const year = parseInt(query.year) || currentDate.getFullYear()
      const month = query.month ? parseInt(query.month) : undefined

      const categoryAnalysis = await transactionService.getCategoryAnalysis(user.id, year, month)

      // Filter only income and add colors
      const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899']
      const categories = Array.isArray(categoryAnalysis?.categories) ? categoryAnalysis.categories :
                        Array.isArray(categoryAnalysis) ? categoryAnalysis : []
      const incomeCategories = categories
        .filter((cat: any) => cat.income > 0)
        .map((cat: any, index: number) => ({
          source: cat.categoryName,
          amount: cat.income || 0,
          percentage: cat.incomePercentage || 0,
          count: cat.transactionCount || 0,
          avgAmount: cat.income > 0 ? cat.income / cat.transactionCount : 0,
          color: colors[index % colors.length]
        }))

      return {
        success: true,
        data: incomeCategories
      }
    } catch (error) {
      console.error('Erro ao obter receitas por fonte:', error)
      return reply.status(500).send({ success: false, message: 'Erro interno do servidor' })
    }
  })

  // Rota de teste
  fastify.get(`${prefix}/test`, async (request, reply) => {
    return {
      success: true,
      message: 'API de relatórios funcionando!',
      timestamp: new Date().toISOString()
    }
  })
}
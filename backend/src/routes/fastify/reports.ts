import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function reportRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  const prefix = '/api/reports'

  // GET /api/reports/financial-summary - Resumo financeiro
  fastify.get(`${prefix}/financial-summary`, async (request, reply) => {
    const query = request.query as any

    return {
      success: true,
      data: {
        period: {
          start: query.dateFrom || '2024-01-01',
          end: query.dateTo || new Date().toISOString().split('T')[0]
        },
        totalIncome: 16800,
        totalExpenses: 2700,
        netIncome: 14100,
        transactionsCount: 47,
        averageTransaction: 357.45,
        biggestIncome: {
          amount: 5200,
          description: 'Salário',
          date: '2024-03-15'
        },
        biggestExpense: {
          amount: 1000,
          description: 'Investimento CDB',
          date: '2024-02-25'
        }
      }
    }
  })

  // GET /api/reports/category-analysis - Análise por categoria
  fastify.get(`${prefix}/category-analysis`, async (request, reply) => {
    return {
      success: true,
      data: [
        {
          category: 'Renda',
          totalAmount: 15600,
          transactionsCount: 3,
          percentage: 92.9,
          averageTransaction: 5200,
          trend: 'stable',
          monthlyData: [
            { month: '2024-01', amount: 5200 },
            { month: '2024-02', amount: 5200 },
            { month: '2024-03', amount: 5200 }
          ]
        },
        {
          category: 'Alimentação',
          totalAmount: 432.80,
          transactionsCount: 2,
          percentage: 16.0,
          averageTransaction: 216.40,
          trend: 'down',
          monthlyData: [
            { month: '2024-01', amount: 234.50 },
            { month: '2024-02', amount: 198.30 },
            { month: '2024-03', amount: 0 }
          ]
        },
        {
          category: 'Investimento',
          totalAmount: 1000,
          transactionsCount: 1,
          percentage: 37.0,
          averageTransaction: 1000,
          trend: 'stable',
          monthlyData: [
            { month: '2024-01', amount: 0 },
            { month: '2024-02', amount: 1000 },
            { month: '2024-03', amount: 0 }
          ]
        }
      ]
    }
  })

  // GET /api/reports/monthly-trend - Tendência mensal
  fastify.get(`${prefix}/monthly-trend`, async (request, reply) => {
    return {
      success: true,
      data: [
        {
          month: '2024-01',
          year: 2024,
          income: 6400,
          expenses: 503.50,
          netIncome: 5896.50,
          transactionsCount: 5,
          categories: [
            { category: 'Renda', amount: 6400, percentage: 100 },
            { category: 'Alimentação', amount: 234.50, percentage: 46.6 },
            { category: 'Transporte', amount: 180, percentage: 35.7 },
            { category: 'Saúde', amount: 89, percentage: 17.7 }
          ]
        },
        {
          month: '2024-02',
          year: 2024,
          income: 5200,
          expenses: 1231.20,
          netIncome: 3968.80,
          transactionsCount: 4,
          categories: [
            { category: 'Renda', amount: 5200, percentage: 100 },
            { category: 'Alimentação', amount: 198.30, percentage: 16.1 },
            { category: 'Investimento', amount: 1000, percentage: 81.2 },
            { category: 'Entretenimento', amount: 32.90, percentage: 2.7 }
          ]
        },
        {
          month: '2024-03',
          year: 2024,
          income: 5200,
          expenses: 0,
          netIncome: 5200,
          transactionsCount: 1,
          categories: [
            { category: 'Renda', amount: 5200, percentage: 100 }
          ]
        }
      ]
    }
  })

  // GET /api/reports/dashboard-stats - Estatísticas do dashboard
  fastify.get(`${prefix}/dashboard-stats`, async (request, reply) => {
    return {
      success: true,
      data: {
        currentMonth: {
          income: 5200,
          expenses: 0,
          balance: 5200,
          transactionsCount: 1
        },
        lastMonth: {
          income: 5200,
          expenses: 1231.20,
          balance: 3968.80,
          transactionsCount: 4
        },
        yearToDate: {
          income: 16800,
          expenses: 1734.70,
          balance: 15065.30,
          transactionsCount: 10
        },
        trends: {
          incomeGrowth: 0,
          expenseGrowth: -100,
          balanceGrowth: 31.0
        },
        topCategories: [
          { category: 'Renda', amount: 16800, type: 'income' },
          { category: 'Investimento', amount: 1000, type: 'expense' },
          { category: 'Alimentação', amount: 432.80, type: 'expense' }
        ],
        recentTransactions: [
          {
            id: 10,
            description: 'Salário',
            amount: 5200,
            date: '2024-03-15',
            category: 'Renda',
            type: 'income'
          },
          {
            id: 9,
            description: 'Investimento CDB',
            amount: -1000,
            date: '2024-02-25',
            category: 'Investimento',
            type: 'expense'
          },
          {
            id: 8,
            description: 'Supermercado',
            amount: -198.30,
            date: '2024-02-18',
            category: 'Alimentação',
            type: 'expense'
          }
        ]
      }
    }
  })

  // GET /api/reports/expenses-by-category - Gastos por categoria
  fastify.get(`${prefix}/expenses-by-category`, async (request, reply) => {
    return {
      success: true,
      data: [
        {
          category: 'Investimento',
          amount: 1000,
          percentage: 57.7,
          count: 1,
          avgAmount: 1000,
          color: '#3B82F6'
        },
        {
          category: 'Alimentação',
          amount: 432.80,
          percentage: 24.9,
          count: 2,
          avgAmount: 216.40,
          color: '#EF4444'
        },
        {
          category: 'Transporte',
          amount: 180,
          percentage: 10.4,
          count: 1,
          avgAmount: 180,
          color: '#10B981'
        },
        {
          category: 'Saúde',
          amount: 89,
          percentage: 5.1,
          count: 1,
          avgAmount: 89,
          color: '#F59E0B'
        },
        {
          category: 'Entretenimento',
          amount: 32.90,
          percentage: 1.9,
          count: 1,
          avgAmount: 32.90,
          color: '#8B5CF6'
        }
      ]
    }
  })

  // GET /api/reports/income-by-source - Receitas por fonte
  fastify.get(`${prefix}/income-by-source`, async (request, reply) => {
    return {
      success: true,
      data: [
        {
          source: 'Renda',
          amount: 15600,
          percentage: 92.9,
          count: 3,
          avgAmount: 5200,
          color: '#10B981'
        },
        {
          source: 'Renda Extra',
          amount: 1200,
          percentage: 7.1,
          count: 1,
          avgAmount: 1200,
          color: '#3B82F6'
        }
      ]
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
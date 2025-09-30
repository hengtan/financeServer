import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:3001'

// Mock transaction data
const mockTransactions = [
  {
    id: 'trans-1',
    userId: 'user-123',
    description: 'Salary',
    amount: '5000.00',
    type: 'INCOME',
    categoryId: 'cat-income',
    accountId: 'acc-1',
    status: 'COMPLETED',
    date: '2024-01-15T00:00:00.000Z',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: 'trans-2',
    userId: 'user-123',
    description: 'Grocery Shopping',
    amount: '120.50',
    type: 'EXPENSE',
    categoryId: 'cat-food',
    accountId: 'acc-1',
    status: 'COMPLETED',
    date: '2024-01-14T00:00:00.000Z',
    createdAt: '2024-01-14T15:30:00.000Z',
    updatedAt: '2024-01-14T15:30:00.000Z'
  },
  {
    id: 'trans-3',
    userId: 'user-123',
    description: 'Gas Bill',
    amount: '85.00',
    type: 'EXPENSE',
    categoryId: 'cat-utilities',
    accountId: 'acc-1',
    status: 'COMPLETED',
    date: '2024-01-13T00:00:00.000Z',
    createdAt: '2024-01-13T09:15:00.000Z',
    updatedAt: '2024-01-13T09:15:00.000Z'
  }
]

export const transactionHandlers = [
  // Get transactions with pagination
  http.get(`${API_BASE_URL}/api/transactions`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Usuário não autenticado'
        },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTransactions = mockTransactions.slice(startIndex, endIndex)

    return HttpResponse.json({
      success: true,
      data: {
        data: paginatedTransactions,
        total: mockTransactions.length,
        page,
        limit
      },
      pagination: {
        page,
        limit,
        total: mockTransactions.length,
        totalPages: Math.ceil(mockTransactions.length / limit),
        hasNext: endIndex < mockTransactions.length,
        hasPrev: page > 1
      }
    })
  }),

  // Get specific transaction
  http.get(`${API_BASE_URL}/api/transactions/:id`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Usuário não autenticado'
        },
        { status: 401 }
      )
    }

    const { id } = params
    const transaction = mockTransactions.find(t => t.id === id)

    if (!transaction) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Transação não encontrada'
        },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: transaction
    })
  }),

  // Create transaction
  http.post(`${API_BASE_URL}/api/transactions`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Usuário não autenticado'
        },
        { status: 401 }
      )
    }

    const body = await request.json() as any

    if (!body.description || !body.amount || !body.type) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Dados inválidos',
          errors: ['Descrição, valor e tipo são obrigatórios']
        },
        { status: 400 }
      )
    }

    const newTransaction = {
      id: `trans-${Date.now()}`,
      userId: 'user-123',
      ...body,
      amount: body.amount.toString(),
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json(
      {
        success: true,
        data: newTransaction,
        message: 'Transação criada com sucesso'
      },
      { status: 201 }
    )
  }),

  // Update transaction
  http.put(`${API_BASE_URL}/api/transactions/:id`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Usuário não autenticado'
        },
        { status: 401 }
      )
    }

    const { id } = params
    const transaction = mockTransactions.find(t => t.id === id)

    if (!transaction) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Transação não encontrada'
        },
        { status: 404 }
      )
    }

    const body = await request.json() as any
    const updatedTransaction = {
      ...transaction,
      ...body,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: updatedTransaction,
      message: 'Transação atualizada com sucesso'
    })
  }),

  // Delete transaction
  http.delete(`${API_BASE_URL}/api/transactions/:id`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Usuário não autenticado'
        },
        { status: 401 }
      )
    }

    const { id } = params
    const transaction = mockTransactions.find(t => t.id === id)

    if (!transaction) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Transação não encontrada'
        },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      message: 'Transação deletada com sucesso'
    })
  }),

  // Get transaction summary
  http.get(`${API_BASE_URL}/api/transactions/summary`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Usuário não autenticado'
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        totalIncome: 5000.00,
        totalExpenses: 205.50,
        netAmount: 4794.50,
        transactionCount: 3
      }
    })
  }),

  // Get detailed analytics
  http.get(`${API_BASE_URL}/api/transactions/analytics/detailed`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Usuário não autenticado'
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        period: {
          year: 2024,
          month: 1
        },
        categoryAnalysis: {
          summary: {
            totalIncome: 5000,
            totalExpense: 205.50,
            netAmount: 4794.50,
            transactionCount: 3
          },
          categories: [
            {
              categoryId: 'cat-income',
              categoryName: 'Income',
              income: 5000,
              expense: 0,
              net: 5000,
              transactionCount: 1
            }
          ]
        },
        trendAnalysis: {
          monthlyTrend: [],
          averages: {
            monthlyIncome: 5000,
            monthlyExpense: 205.50,
            monthlyNet: 4794.50
          }
        },
        comparisonAnalysis: {
          current: {
            income: 5000,
            expense: 205.50,
            net: 4794.50,
            count: 3
          },
          previous: {
            income: 0,
            expense: 0,
            net: 0,
            count: 0
          },
          changes: {
            income: { amount: 5000, percentage: 100 },
            expense: { amount: 205.50, percentage: 100 },
            net: { amount: 4794.50, percentage: 100 },
            transactionCount: { amount: 3, percentage: 100 }
          }
        }
      }
    })
  }),

  // Get advanced insights
  http.get(`${API_BASE_URL}/api/transactions/analytics/insights`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.includes('mock-jwt-token')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Usuário não autenticado'
        },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        spending_patterns: {
          most_expensive_weekday: null,
          average_transaction_value: 68.5,
          weekday_analysis: []
        },
        budget_recommendations: {
          recommended_monthly_budget: 226.05,
          emergency_fund_target: 1233,
          savings_target: 1000,
          current_savings_rate: 95.9
        },
        savings_potential: {
          total_expenses_last_3_months: 205.50,
          potential_monthly_savings: 6.85,
          high_spending_categories: []
        },
        category_insights: {
          top_expense_categories: [],
          category_distribution: []
        },
        alerts: []
      }
    })
  })
]
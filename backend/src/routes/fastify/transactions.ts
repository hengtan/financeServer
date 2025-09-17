import { FastifyInstance, FastifyPluginOptions } from 'fastify'

// Dados mock para desenvolvimento/sandbox
const mockTransactions = [
  {
    id: 1,
    description: 'Salário',
    amount: 5200,
    date: '2024-01-15',
    category: 'Renda',
    account: 'Conta Corrente',
    type: 'income',
    status: 'confirmed',
    tags: ['trabalho', 'mensal'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    userId: 1
  },
  {
    id: 2,
    description: 'Freelance Design',
    amount: 1200,
    date: '2024-01-12',
    category: 'Renda Extra',
    account: 'Conta Corrente',
    type: 'income',
    status: 'confirmed',
    tags: ['freelance', 'design'],
    createdAt: '2024-01-12T14:30:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
    userId: 1
  },
  {
    id: 3,
    description: 'Supermercado',
    amount: -234.50,
    date: '2024-01-16',
    category: 'Alimentação',
    account: 'Cartão de Crédito',
    type: 'expense',
    status: 'confirmed',
    tags: ['supermercado'],
    createdAt: '2024-01-16T18:45:00Z',
    updatedAt: '2024-01-16T18:45:00Z',
    userId: 1
  }
]

const mockUser = {
  id: 1,
  email: 'sandbox@financeserver.dev',
  name: 'Usuário Sandbox',
  avatar: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T12:00:00Z'
}

export default async function transactionRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  const prefix = '/api'

  // GET /api/transactions - Listar transações com paginação
  fastify.get(`${prefix}/transactions`, async (request, reply) => {
    const query = request.query as any
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const offset = (page - 1) * limit

    return {
      success: true,
      data: {
        data: mockTransactions.slice(offset, offset + limit),
        pagination: {
          page,
          limit,
          total: mockTransactions.length,
          totalPages: Math.ceil(mockTransactions.length / limit)
        }
      }
    }
  })

  // GET /api/transactions/:id - Buscar transação específica
  fastify.get(`${prefix}/transactions/:id`, async (request, reply) => {
    const { id } = request.params as { id: string }
    const transaction = mockTransactions.find(t => t.id === parseInt(id))

    if (!transaction) {
      return reply.status(404).send({
        success: false,
        message: 'Transação não encontrada'
      })
    }

    return {
      success: true,
      data: transaction
    }
  })

  // POST /api/transactions - Criar nova transação
  fastify.post(`${prefix}/transactions`, async (request, reply) => {
    const body = request.body as any
    const newTransaction = {
      id: mockTransactions.length + 1,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 1
    }

    mockTransactions.push(newTransaction)

    return reply.status(201).send({
      success: true,
      data: newTransaction,
      message: 'Transação criada com sucesso'
    })
  })

  // GET /api/transactions/categories - Listar categorias
  fastify.get(`${prefix}/transactions/categories`, async (request, reply) => {
    const categories = [...new Set(mockTransactions.map(t => t.category))]

    return {
      success: true,
      data: categories
    }
  })

  // GET /api/transactions/summary - Resumo financeiro
  fastify.get(`${prefix}/transactions/summary`, async (request, reply) => {
    const totalIncome = mockTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = mockTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionsCount: mockTransactions.length,
        period: {
          start: '2024-01-01',
          end: new Date().toISOString().split('T')[0]
        }
      }
    }
  })

  // GET /api/transactions/monthly-trend - Tendência mensal
  fastify.get(`${prefix}/transactions/monthly-trend`, async (request, reply) => {
    return {
      success: true,
      data: [
        { month: '2024-01', income: 6400, expenses: 1000, balance: 5400 },
        { month: '2024-02', income: 5200, expenses: 800, balance: 4400 },
        { month: '2024-03', income: 5200, expenses: 900, balance: 4300 }
      ]
    }
  })

  // Rota de teste
  fastify.get(`${prefix}/transactions/test`, async (request, reply) => {
    return {
      success: true,
      message: 'API de transações funcionando!',
      user: mockUser,
      timestamp: new Date().toISOString()
    }
  })
}
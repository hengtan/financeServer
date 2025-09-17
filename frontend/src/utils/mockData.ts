// Mock data utilities for development and fallback scenarios

import type { Transaction } from '@/services/transactions'
import type { Goal } from '@/services/goals'

export const mockTransactions: Transaction[] = [
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
    description: 'Supermercado Carrefour',
    amount: -234.50,
    date: '2024-01-16',
    category: 'Alimentação',
    account: 'Cartão de Crédito',
    type: 'expense',
    status: 'confirmed',
    tags: ['supermercado', 'alimentação'],
    notes: 'Compras do mês',
    createdAt: '2024-01-16T18:45:00Z',
    updatedAt: '2024-01-16T18:45:00Z',
    userId: 1
  },
  {
    id: 4,
    description: 'Gasolina Posto Shell',
    amount: -180,
    date: '2024-01-18',
    category: 'Transporte',
    account: 'Cartão de Débito',
    type: 'expense',
    status: 'confirmed',
    tags: ['combustível', 'carro'],
    createdAt: '2024-01-18T08:15:00Z',
    updatedAt: '2024-01-18T08:15:00Z',
    userId: 1
  },
  {
    id: 5,
    description: 'Academia Smart Fit',
    amount: -89,
    date: '2024-01-20',
    category: 'Saúde',
    account: 'Conta Corrente',
    type: 'expense',
    status: 'confirmed',
    tags: ['academia', 'saúde', 'mensal'],
    createdAt: '2024-01-20T07:00:00Z',
    updatedAt: '2024-01-20T07:00:00Z',
    userId: 1
  },
  {
    id: 6,
    description: 'Netflix',
    amount: -32.90,
    date: '2024-02-05',
    category: 'Entretenimento',
    account: 'Cartão de Crédito',
    type: 'expense',
    status: 'confirmed',
    tags: ['streaming', 'entretenimento', 'mensal'],
    createdAt: '2024-02-05T12:00:00Z',
    updatedAt: '2024-02-05T12:00:00Z',
    userId: 1
  },
  {
    id: 7,
    description: 'Salário',
    amount: 5200,
    date: '2024-02-15',
    category: 'Renda',
    account: 'Conta Corrente',
    type: 'income',
    status: 'confirmed',
    tags: ['trabalho', 'mensal'],
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
    userId: 1
  },
  {
    id: 8,
    description: 'Supermercado Extra',
    amount: -198.30,
    date: '2024-02-18',
    category: 'Alimentação',
    account: 'Cartão de Crédito',
    type: 'expense',
    status: 'confirmed',
    tags: ['supermercado', 'alimentação'],
    createdAt: '2024-02-18T19:20:00Z',
    updatedAt: '2024-02-18T19:20:00Z',
    userId: 1
  },
  {
    id: 9,
    description: 'Investimento CDB',
    amount: -1000,
    date: '2024-02-25',
    category: 'Investimento',
    account: 'Conta Poupança',
    type: 'expense',
    status: 'confirmed',
    tags: ['investimento', 'cdb', 'longo prazo'],
    notes: 'Aplicação em CDB 120% CDI',
    createdAt: '2024-02-25T11:30:00Z',
    updatedAt: '2024-02-25T11:30:00Z',
    userId: 1
  },
  {
    id: 10,
    description: 'Salário',
    amount: 5200,
    date: '2024-03-15',
    category: 'Renda',
    account: 'Conta Corrente',
    type: 'income',
    status: 'confirmed',
    tags: ['trabalho', 'mensal'],
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    userId: 1
  },
  {
    id: 11,
    description: 'Uber',
    amount: -25.50,
    date: '2024-03-02',
    category: 'Transporte',
    account: 'Cartão de Crédito',
    type: 'expense',
    status: 'confirmed',
    tags: ['transporte', 'uber'],
    createdAt: '2024-03-02T20:45:00Z',
    updatedAt: '2024-03-02T20:45:00Z',
    userId: 1
  },
  {
    id: 12,
    description: 'Farmácia Drogasil',
    amount: -47.80,
    date: '2024-03-05',
    category: 'Saúde',
    account: 'Cartão de Débito',
    type: 'expense',
    status: 'confirmed',
    tags: ['farmácia', 'medicamentos'],
    createdAt: '2024-03-05T16:20:00Z',
    updatedAt: '2024-03-05T16:20:00Z',
    userId: 1
  }
]

export const mockGoals: Goal[] = [
  {
    id: 1,
    title: 'Reserva de Emergência',
    description: 'Reserva equivalente a 6 meses de gastos',
    targetAmount: 25000,
    currentAmount: 8500,
    targetDate: '2024-12-31',
    category: 'savings',
    priority: 'high',
    status: 'active',
    progress: 34,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T12:00:00Z',
    userId: 1
  },
  {
    id: 2,
    title: 'Viagem para Europa',
    description: 'Viagem de férias para conhecer a Europa',
    targetAmount: 15000,
    currentAmount: 4200,
    targetDate: '2024-07-01',
    category: 'purchase',
    priority: 'medium',
    status: 'active',
    progress: 28,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T12:00:00Z',
    userId: 1
  },
  {
    id: 3,
    title: 'Carro Novo',
    description: 'Entrada para financiamento de carro novo',
    targetAmount: 20000,
    currentAmount: 12000,
    targetDate: '2024-06-30',
    category: 'purchase',
    priority: 'high',
    status: 'active',
    progress: 60,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T12:00:00Z',
    userId: 1
  }
]

export const mockCategories = [
  'Renda',
  'Renda Extra',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Entretenimento',
  'Investimento',
  'Educação',
  'Casa',
  'Vestuário',
  'Outros'
]

export const mockAccounts = [
  'Conta Corrente',
  'Conta Poupança',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro'
]

// Utility functions for generating more mock data
export const generateRandomTransaction = (id: number): Transaction => {
  const types: ('income' | 'expense')[] = ['income', 'expense']
  const type = types[Math.floor(Math.random() * types.length)]
  const isIncome = type === 'income'

  const incomeCategories = ['Renda', 'Renda Extra', 'Investimento']
  const expenseCategories = ['Alimentação', 'Transporte', 'Saúde', 'Entretenimento', 'Casa', 'Vestuário']

  const categories = isIncome ? incomeCategories : expenseCategories
  const category = categories[Math.floor(Math.random() * categories.length)]

  const descriptions = {
    Renda: ['Salário', 'Bonus', '13º Salário'],
    'Renda Extra': ['Freelance', 'Vendas', 'Consultoria'],
    Alimentação: ['Supermercado', 'Restaurante', 'Lanchonete', 'Delivery'],
    Transporte: ['Gasolina', 'Uber', 'Ônibus', 'Metrô'],
    Saúde: ['Farmácia', 'Consulta', 'Exames', 'Academia'],
    Entretenimento: ['Cinema', 'Netflix', 'Spotify', 'Jogos'],
    Casa: ['Aluguel', 'Condomínio', 'Luz', 'Água', 'Internet'],
    Vestuário: ['Roupa', 'Sapatos', 'Acessórios'],
    Investimento: ['CDB', 'Ações', 'Fundos', 'Previdência']
  }

  const categoryDescriptions = descriptions[category as keyof typeof descriptions] || ['Outros']
  const description = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)]

  const baseAmount = Math.random() * (isIncome ? 3000 : 500) + (isIncome ? 1000 : 20)
  const amount = isIncome ? baseAmount : -baseAmount

  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 90) // Last 90 days
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return {
    id,
    description,
    amount: Math.round(amount * 100) / 100,
    date,
    category,
    account: mockAccounts[Math.floor(Math.random() * mockAccounts.length)],
    type,
    status: Math.random() > 0.1 ? 'confirmed' : 'pending',
    tags: [category.toLowerCase()],
    createdAt: new Date(date).toISOString(),
    updatedAt: new Date(date).toISOString(),
    userId: 1
  }
}

export const generateMockTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = []
  for (let i = 1; i <= count; i++) {
    transactions.push(generateRandomTransaction(i))
  }
  return [...mockTransactions, ...transactions]
}

// Data migration utilities
export const transformApiTransactionToLocal = (apiTransaction: any): Transaction => {
  return {
    id: apiTransaction.id,
    description: apiTransaction.description || 'Sem descrição',
    amount: apiTransaction.amount || 0,
    date: apiTransaction.date || new Date().toISOString().split('T')[0],
    category: apiTransaction.category || 'Outros',
    account: apiTransaction.account || 'Conta Corrente',
    type: apiTransaction.type || 'expense',
    status: apiTransaction.status || 'confirmed',
    tags: apiTransaction.tags || [],
    notes: apiTransaction.notes,
    attachments: apiTransaction.attachments,
    createdAt: apiTransaction.createdAt || new Date().toISOString(),
    updatedAt: apiTransaction.updatedAt || new Date().toISOString(),
    userId: apiTransaction.userId || 1
  }
}

export const transformLocalTransactionToApi = (localTransaction: Transaction): any => {
  const { id, createdAt, updatedAt, userId, ...apiData } = localTransaction
  return apiData
}
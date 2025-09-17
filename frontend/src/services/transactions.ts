// Transactions Service - Gerenciamento de transações
import { apiService, ApiResponse, PaginatedResponse, PaginationParams } from './api'

// Interfaces para Transações
export interface Transaction {
  id?: number
  description: string
  amount: number
  date: string
  category: string
  account: string
  type: 'income' | 'expense'
  status: 'pending' | 'confirmed' | 'cancelled'
  tags?: string[]
  notes?: string
  attachments?: string[]
  createdAt?: string
  updatedAt?: string
  userId?: number
}

export interface TransactionFilters extends PaginationParams {
  category?: string
  type?: 'income' | 'expense'
  status?: 'pending' | 'confirmed' | 'cancelled'
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  search?: string
  account?: string
  tags?: string[]
}

export interface TransactionSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  transactionsCount: number
  period: {
    start: string
    end: string
  }
}

export interface CategorySummary {
  category: string
  amount: number
  count: number
  percentage: number
}

class TransactionsService {
  private readonly baseUrl = '/transactions'

  // CRUD Operations
  async getTransactions(filters?: TransactionFilters): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    return apiService.getPaginated<Transaction>(this.baseUrl, filters)
  }

  async getTransaction(id: number): Promise<ApiResponse<Transaction>> {
    return apiService.get<Transaction>(`${this.baseUrl}/${id}`)
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Transaction>> {
    return apiService.post<Transaction>(this.baseUrl, transaction)
  }

  async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    return apiService.put<Transaction>(`${this.baseUrl}/${id}`, transaction)
  }

  async deleteTransaction(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`)
  }

  // Batch Operations
  async createMultipleTransactions(transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ApiResponse<Transaction[]>> {
    return apiService.post<Transaction[]>(`${this.baseUrl}/batch`, { transactions })
  }

  async deleteMultipleTransactions(ids: number[]): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseUrl}/batch/delete`, { ids })
  }

  async updateMultipleTransactions(updates: Array<{ id: number; data: Partial<Transaction> }>): Promise<ApiResponse<Transaction[]>> {
    return apiService.put<Transaction[]>(`${this.baseUrl}/batch`, { updates })
  }

  // Analytics and Reports
  async getTransactionsSummary(dateFrom?: string, dateTo?: string): Promise<ApiResponse<TransactionSummary>> {
    const params = {
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo })
    }
    return apiService.get<TransactionSummary>(`${this.baseUrl}/summary`, { params })
  }

  async getCategoriesSummary(dateFrom?: string, dateTo?: string): Promise<ApiResponse<CategorySummary[]>> {
    const params = {
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo })
    }
    return apiService.get<CategorySummary[]>(`${this.baseUrl}/categories-summary`, { params })
  }

  async getMonthlyTrend(year?: number): Promise<ApiResponse<Array<{ month: string; income: number; expenses: number; balance: number }>>> {
    const params = year ? { year } : {}
    return apiService.get<Array<{ month: string; income: number; expenses: number; balance: number }>>(
      `${this.baseUrl}/monthly-trend`,
      { params }
    )
  }

  // Import/Export
  async importTransactions(file: File, options?: {
    format?: 'csv' | 'excel' | 'ofx'
    mapping?: Record<string, string>
  }): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }

    return apiService.post<{ imported: number; errors: string[] }>(`${this.baseUrl}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  async exportTransactions(format: 'csv' | 'excel' | 'pdf', filters?: TransactionFilters): Promise<Blob> {
    const response = await apiService.client.get(`${this.baseUrl}/export`, {
      params: { format, ...filters },
      responseType: 'blob'
    })
    return response.data
  }

  // Categories Management
  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`${this.baseUrl}/categories`)
  }

  async createCategory(name: string): Promise<ApiResponse<string>> {
    return apiService.post<string>(`${this.baseUrl}/categories`, { name })
  }

  async deleteCategory(name: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/categories/${encodeURIComponent(name)}`)
  }

  // Accounts Management
  async getAccounts(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`${this.baseUrl}/accounts`)
  }

  // Recurring Transactions
  async createRecurringTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    endDate?: string
    occurrences?: number
  }): Promise<ApiResponse<{ id: number; nextExecution: string }>> {
    return apiService.post<{ id: number; nextExecution: string }>(`${this.baseUrl}/recurring`, transaction)
  }

  async getRecurringTransactions(): Promise<ApiResponse<Array<Transaction & {
    frequency: string
    nextExecution: string
    endDate?: string
    occurrences?: number
  }>>> {
    return apiService.get<Array<Transaction & {
      frequency: string
      nextExecution: string
      endDate?: string
      occurrences?: number
    }>>(`${this.baseUrl}/recurring`)
  }

  // Attachments
  async uploadAttachment(transactionId: number, file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData()
    formData.append('attachment', file)

    return apiService.post<{ url: string; filename: string }>(
      `${this.baseUrl}/${transactionId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  }

  async deleteAttachment(transactionId: number, filename: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${transactionId}/attachments/${encodeURIComponent(filename)}`)
  }

  // Search and Filters
  async searchTransactions(query: string, limit = 10): Promise<ApiResponse<Transaction[]>> {
    return apiService.get<Transaction[]>(`${this.baseUrl}/search`, {
      params: { q: query, limit }
    })
  }

  async getTransactionsByDateRange(dateFrom: string, dateTo: string): Promise<ApiResponse<Transaction[]>> {
    return apiService.get<Transaction[]>(`${this.baseUrl}/date-range`, {
      params: { dateFrom, dateTo }
    })
  }

  // Favorites/Bookmarks
  async addToFavorites(transactionId: number): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseUrl}/${transactionId}/favorite`)
  }

  async removeFromFavorites(transactionId: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${transactionId}/favorite`)
  }

  async getFavoriteTransactions(): Promise<ApiResponse<Transaction[]>> {
    return apiService.get<Transaction[]>(`${this.baseUrl}/favorites`)
  }
}

// Instância singleton
export const transactionsService = new TransactionsService()

// Utilitários para manipulação de transações no frontend
export class TransactionUtils {
  static formatAmount(amount: number, currency = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  static getTransactionIcon(type: 'income' | 'expense'): string {
    return type === 'income' ? '💰' : '💸'
  }

  static getStatusColor(status: 'pending' | 'confirmed' | 'cancelled'): string {
    const colors = {
      pending: 'orange',
      confirmed: 'green',
      cancelled: 'red'
    }
    return colors[status]
  }

  static calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((balance, transaction) => {
      return balance + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
    }, 0)
  }

  static groupByCategory(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce((groups, transaction) => {
      const category = transaction.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(transaction)
      return groups
    }, {} as Record<string, Transaction[]>)
  }

  static groupByMonth(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce((groups, transaction) => {
      const month = new Date(transaction.date).toISOString().substring(0, 7) // YYYY-MM
      if (!groups[month]) {
        groups[month] = []
      }
      groups[month].push(transaction)
      return groups
    }, {} as Record<string, Transaction[]>)
  }

  static isRecent(date: string, days = 7): boolean {
    const transactionDate = new Date(date)
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - days)
    return transactionDate >= daysAgo
  }
}
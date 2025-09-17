export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  phone?: string
}

export interface UserProfile extends User {
  preferences: UserPreferences
  stats: UserStats
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  currency: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    weeklyReports: boolean
    transactionAlerts: boolean
    goalAlerts: boolean
  }
}

export interface UserStats {
  totalTransactions: number
  totalIncome: number
  totalExpense: number
  currentBalance: number
  goalsCompleted: number
  accountsConnected: number
}

export interface Transaction {
  id: string
  userId: string
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  accountId: string
  date: Date
  status: 'pending' | 'completed' | 'cancelled'
  tags?: string[]
  notes?: string
  attachments?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  type: 'income' | 'expense'
  userId: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  currency: string
  userId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  userId: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  status: 'active' | 'completed' | 'paused'
  category: string
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
  twoFactorCode?: string
  rememberMe?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    message: string
    code?: string
    details?: any
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface TransactionFilters extends PaginationParams {
  categoryId?: string
  accountId?: string
  type?: 'income' | 'expense'
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
  status?: 'pending' | 'completed' | 'cancelled'
  search?: string
}

export interface DashboardData {
  stats: {
    totalBalance: number
    monthlyIncome: number
    monthlyExpense: number
    savingsRate: number
  }
  recentTransactions: Transaction[]
  monthlyChart: Array<{
    month: string
    income: number
    expense: number
  }>
  categoryChart: Array<{
    category: string
    amount: number
    percentage: number
  }>
  goals: Goal[]
  alerts: Array<{
    id: string
    type: 'warning' | 'info' | 'success'
    message: string
    timestamp: Date
  }>
}

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  token: string
  password: string
  confirmPassword: string
}
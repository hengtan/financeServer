// API Configuration for Backend Integration

export const API_CONFIG = {
  // Base URL - will be overridden by environment variables
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',

  // Timeout settings
  TIMEOUT: 10000, // 10 seconds

  // Authentication
  AUTH: {
    TOKEN_KEY: 'authToken',
    REFRESH_TOKEN_KEY: 'refreshToken',
    USER_KEY: 'currentUser',
  },

  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      PROFILE: '/auth/profile',
      PASSWORD: '/auth/password',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },

    // Transactions
    TRANSACTIONS: {
      BASE: '/transactions',
      SUMMARY: '/transactions/summary',
      CATEGORIES: '/transactions/categories',
      ACCOUNTS: '/transactions/accounts',
      MONTHLY_TREND: '/transactions/monthly-trend',
      CATEGORIES_SUMMARY: '/transactions/categories-summary',
      IMPORT: '/transactions/import',
      EXPORT: '/transactions/export',
      BATCH: '/transactions/batch',
      BATCH_DELETE: '/transactions/batch/delete',
      RECURRING: '/transactions/recurring',
      SEARCH: '/transactions/search',
      DATE_RANGE: '/transactions/date-range',
      FAVORITES: '/transactions/favorites',
      ATTACHMENTS: (id: number) => `/transactions/${id}/attachments`,
      FAVORITE: (id: number) => `/transactions/${id}/favorite`,
    },

    // Goals
    GOALS: {
      BASE: '/goals',
      ANALYTICS: '/goals/analytics',
      CATEGORIES_SUMMARY: '/goals/categories-summary',
      SIMULATE: '/goals/simulate',
      CONTRIBUTIONS: (id: number) => `/goals/${id}/contributions`,
      PROGRESS: (id: number) => `/goals/${id}/progress`,
      COMPLETE: (id: number) => `/goals/${id}/complete`,
      PAUSE: (id: number) => `/goals/${id}/pause`,
      RESUME: (id: number) => `/goals/${id}/resume`,
    },

    // Reports
    REPORTS: {
      BASE: '/reports',
      FINANCIAL_SUMMARY: '/reports/financial-summary',
      CATEGORY_ANALYSIS: '/reports/category-analysis',
      MONTHLY_TREND: '/reports/monthly-trend',
      EXPENSES_BY_CATEGORY: '/reports/expenses-by-category',
      INCOME_BY_SOURCE: '/reports/income-by-source',
      CASH_FLOW_PROJECTION: '/reports/cash-flow-projection',
      DASHBOARD_STATS: '/reports/dashboard-stats',
      YEARLY_COMPARISON: '/reports/yearly-comparison',
      TOP_TRANSACTIONS: '/reports/top-transactions',
      SPENDING_PATTERNS: '/reports/spending-patterns',
      CUSTOM_REPORT: '/reports/custom-report',
      RECURRING_ANALYSIS: '/reports/recurring-analysis',
      BUDGET_VARIANCE: '/reports/budget-variance',
    },
  },

  // Feature flags for gradual backend integration
  FEATURES: {
    USE_REAL_API: import.meta.env.VITE_USE_REAL_API === 'true',
    ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE !== 'false',
    ENABLE_CACHING: import.meta.env.VITE_ENABLE_CACHING !== 'false',
    DEBUG_API: import.meta.env.DEV,
  },

  // Error messages
  ERRORS: {
    NETWORK: 'Erro de conexão. Verifique sua internet e tente novamente.',
    UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
    FORBIDDEN: 'Acesso negado. Você não tem permissão para esta ação.',
    NOT_FOUND: 'Recurso não encontrado.',
    SERVER: 'Erro interno do servidor. Tente novamente em alguns minutos.',
    VALIDATION: 'Dados inválidos. Verifique os campos e tente novamente.',
    TIMEOUT: 'Tempo limite esgotado. Tente novamente.',
    UNKNOWN: 'Erro desconhecido. Tente novamente.',
  },

  // Cache settings
  CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 100, // Maximum cached items
    KEYS: {
      TRANSACTIONS: 'transactions',
      CATEGORIES: 'categories',
      ACCOUNTS: 'accounts',
      GOALS: 'goals',
      REPORTS: 'reports',
    },
  },
}

// Helper function to check if backend is available
export const isBackendAvailable = async (): Promise<boolean> => {
  if (!API_CONFIG.FEATURES.USE_REAL_API) {
    return false
  }

  try {
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
      timeout: 5000,
    } as RequestInit)
    return response.ok
  } catch {
    return false
  }
}

// Helper function to get full endpoint URL
export const getEndpointUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to build URL with query parameters
export const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  const url = new URL(getEndpointUrl(endpoint))

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}
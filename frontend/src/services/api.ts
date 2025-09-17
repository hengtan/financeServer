// API Service - Central para todas as chamadas HTTP
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Interface para configuração da API
interface ApiConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

// Interface para resposta padrão da API
interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  errors?: string[]
}

// Interface para paginação
interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class ApiService {
  private client: AxiosInstance
  private baseURL: string

  constructor(config?: ApiConfig) {
    this.baseURL = config?.baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config?.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - Adicionar token de autenticação
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Log da request em desenvolvimento
        if (import.meta.env.DEV) {
          console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params
          })
        }

        return config
      },
      (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor - Tratar erros globalmente
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Log da response em desenvolvimento
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
        }

        return response
      },
      (error) => {
        console.error('❌ Response Error:', error)

        // Tratamento específico para diferentes códigos de erro
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem('authToken')
          sessionStorage.removeItem('authToken')

          // Redirecionar para login (pode ser customizado)
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }

        if (error.response?.status === 403) {
          console.error('Acesso negado - Sem permissões suficientes')
        }

        if (error.response?.status >= 500) {
          console.error('Erro interno do servidor')
        }

        return Promise.reject(error)
      }
    )
  }

  // Métodos HTTP básicos
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  // Método para upload de arquivos
  async uploadFile<T = any>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress
    })

    return response.data
  }

  // Método para requests com paginação
  async getPaginated<T = any>(
    url: string,
    params: PaginationParams = {}
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder })
    }

    return this.get<PaginatedResponse<T>>(url, { params: queryParams })
  }

  // Método para atualizar configurações
  updateConfig(config: Partial<ApiConfig>) {
    if (config.baseURL) {
      this.client.defaults.baseURL = config.baseURL
      this.baseURL = config.baseURL
    }

    if (config.timeout) {
      this.client.defaults.timeout = config.timeout
    }

    if (config.headers) {
      this.client.defaults.headers = { ...this.client.defaults.headers, ...config.headers }
    }
  }

  // Método para obter informações da API
  getInfo() {
    return {
      baseURL: this.baseURL,
      timeout: this.client.defaults.timeout,
      headers: this.client.defaults.headers
    }
  }
}

// Instância singleton da API
export const apiService = new ApiService()

// Exportar tipos para uso em outros arquivos
export type { ApiResponse, PaginatedResponse, PaginationParams, ApiConfig }
export { ApiService }

// Método para criar uma nova instância da API (útil para diferentes endpoints)
export const createApiService = (config?: ApiConfig) => new ApiService(config)
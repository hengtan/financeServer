import { apiService, ApiResponse } from './api'

export interface User {
  id: number
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

class AuthService {
  private readonly baseUrl = '/auth'

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>(`${this.baseUrl}/login`, credentials)

    if (response.success && response.data.token) {
      this.setTokens(response.data.token, response.data.refreshToken)
    }

    return response
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>(`${this.baseUrl}/register`, userData)

    if (response.success && response.data.token) {
      this.setTokens(response.data.token, response.data.refreshToken)
    }

    return response
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      await apiService.post<void>(`${this.baseUrl}/logout`)
    } catch (error) {
      console.warn('Logout request failed, but clearing local tokens anyway', error)
    } finally {
      this.clearTokens()
    }

    return { success: true, data: undefined }
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiService.post<AuthResponse>(`${this.baseUrl}/refresh`, {
      refreshToken
    })

    if (response.success && response.data.token) {
      this.setTokens(response.data.token, response.data.refreshToken)
    }

    return response
  }

  async getMe(): Promise<ApiResponse<User>> {
    return apiService.get<User>(`${this.baseUrl}/me`)
  }

  async updateProfile(userData: Partial<Pick<User, 'name' | 'email'>>): Promise<ApiResponse<User>> {
    return apiService.put<User>(`${this.baseUrl}/profile`, userData)
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.put<void>(`${this.baseUrl}/password`, {
      currentPassword,
      newPassword
    })
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseUrl}/forgot-password`, { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseUrl}/reset-password`, {
      token,
      newPassword
    })
  }

  async checkSandboxStatus(): Promise<ApiResponse<{ isSandbox: boolean; email: string }>> {
    return apiService.get<{ isSandbox: boolean; email: string }>('/sandbox/status')
  }

  async seedSandbox(): Promise<ApiResponse<void>> {
    return apiService.post<void>('/sandbox/seed', {})
  }

  async resetSandbox(): Promise<ApiResponse<void>> {
    return apiService.post<void>('/sandbox/reset', {})
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  getToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
  }

  private setTokens(token: string, refreshToken: string, rememberMe = true): void {
    const storage = rememberMe ? localStorage : sessionStorage

    storage.setItem('authToken', token)
    storage.setItem('refreshToken', refreshToken)

    // Clear from the other storage
    const otherStorage = rememberMe ? sessionStorage : localStorage
    otherStorage.removeItem('authToken')
    otherStorage.removeItem('refreshToken')
  }

  clearTokens(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('refreshToken')
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser')
    return userStr ? JSON.parse(userStr) : null
  }

  setCurrentUser(user: User, rememberMe = true): void {
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('currentUser', JSON.stringify(user))

    const otherStorage = rememberMe ? sessionStorage : localStorage
    otherStorage.removeItem('currentUser')
  }

  clearCurrentUser(): void {
    localStorage.removeItem('currentUser')
    sessionStorage.removeItem('currentUser')
  }
}

export const authService = new AuthService()
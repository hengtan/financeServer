import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, authService, AuthResponse } from '@/services/auth'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; email?: string }>
  logout: () => Promise<void>
  verify2FA: (code: string) => Promise<boolean>
  isLoading: boolean
  isAuthenticated: boolean
  pending2FA: boolean
  pendingEmail: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pending2FA, setPending2FA] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken()
      if (token) {
        try {
          const response = await authService.getMe()
          if (response.success) {
            setUser(response.data)
          } else {
            authService.clearTokens()
            authService.clearCurrentUser()
          }
        } catch (error) {
          console.error('Failed to validate token:', error)
          authService.clearTokens()
          authService.clearCurrentUser()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; requires2FA?: boolean; email?: string }> => {
    setIsLoading(true)

    try {
      const response = await authService.login({ email, password })

      if (response.success) {
        setUser(response.data.user)
        authService.setCurrentUser(response.data.user)

        // Check if sandbox user and reset+seed data for clean state
        try {
          const sandboxStatus = await authService.checkSandboxStatus()
          if (sandboxStatus.success && sandboxStatus.data.isSandbox) {
            console.log('🌱 Sandbox user detected, resetting and seeding data...')
            await authService.resetSandbox()
            console.log('✅ Sandbox data reset and seeded successfully')
          }
        } catch (sandboxError) {
          console.warn('Sandbox check/reset failed:', sandboxError)
          // Don't fail login if sandbox operations fail
        }

        setIsLoading(false)
        return { success: true }
      } else {
        setIsLoading(false)
        return { success: false }
      }
    } catch (error) {
      console.error('Login failed:', error)
      setIsLoading(false)
      return { success: false }
    }
  }

  const verify2FA = async (code: string): Promise<boolean> => {
    // 2FA não implementado no backend atual - retorna false por enquanto
    return false
  }

  const logout = async () => {
    // Check if sandbox user and reset data before logout
    try {
      const sandboxStatus = await authService.checkSandboxStatus()
      if (sandboxStatus.success && sandboxStatus.data.isSandbox) {
        console.log('🧹 Sandbox user detected, resetting data...')
        await authService.resetSandbox()
        console.log('✅ Sandbox data reset successfully')
      }
    } catch (sandboxError) {
      console.warn('Sandbox check/reset failed:', sandboxError)
      // Continue with logout even if sandbox reset fails
    }

    try {
      await authService.logout()
    } catch (error) {
      console.warn('Logout request failed, but clearing local state anyway', error)
    }

    setUser(null)
    setPending2FA(false)
    setPendingEmail(null)
    authService.clearTokens()
    authService.clearCurrentUser()
  }

  const value = {
    user,
    login,
    logout,
    verify2FA,
    isLoading,
    isAuthenticated: !!user,
    pending2FA,
    pendingEmail
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
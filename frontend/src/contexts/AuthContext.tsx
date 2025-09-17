import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; email?: string }>
  logout: () => void
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
    const savedUser = localStorage.getItem('financeServer_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; requires2FA?: boolean; email?: string }> => {
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    if (email === 'admin@financeserver.com' && password === '123456') {
      // Verificar se 2FA está habilitado para este usuário
      const stored2FA = localStorage.getItem('financeServer_2fa')
      const twoFactorSettings = stored2FA ? JSON.parse(stored2FA) : { enabled: false }

      if (twoFactorSettings.enabled) {
        setPending2FA(true)
        setPendingEmail(email)
        setIsLoading(false)
        return { success: false, requires2FA: true, email }
      } else {
        const mockUser: User = {
          id: '1',
          name: 'João Silva',
          email: email,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }

        setUser(mockUser)
        localStorage.setItem('financeServer_user', JSON.stringify(mockUser))
        setIsLoading(false)
        return { success: true }
      }
    }

    setIsLoading(false)
    return { success: false }
  }

  const verify2FA = async (code: string): Promise<boolean> => {
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simular verificação 2FA - em produção seria verificado no backend
    const isValid = code === '123456' || code.length === 6

    if (isValid) {
      const mockUser: User = {
        id: '1',
        name: 'João Silva',
        email: pendingEmail || '',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }

      setUser(mockUser)
      localStorage.setItem('financeServer_user', JSON.stringify(mockUser))
      setPending2FA(false)
      setPendingEmail(null)
    }

    setIsLoading(false)
    return isValid
  }

  const logout = () => {
    setUser(null)
    setPending2FA(false)
    setPendingEmail(null)
    localStorage.removeItem('financeServer_user')
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
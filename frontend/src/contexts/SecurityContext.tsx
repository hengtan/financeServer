import React, { createContext, useContext, useState, useEffect } from 'react'

export interface TwoFactorSettings {
  enabled: boolean
  method: 'sms' | 'email' | 'authenticator'
  phone?: string
  email?: string
  backupCodes?: string[]
  secret?: string
}

export interface SecurityContextType {
  twoFactorSettings: TwoFactorSettings
  updateTwoFactorSettings: (settings: Partial<TwoFactorSettings>) => void
  generateBackupCodes: () => string[]
  generateTOTPSecret: () => string
  verifyTOTPCode: (code: string, secret: string) => boolean
  sendVerificationCode: (method: 'sms' | 'email') => Promise<boolean>
  verifyCode: (code: string) => boolean
  isSecuritySetupComplete: boolean
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined)

export const useSecurity = () => {
  const context = useContext(SecurityContext)
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider')
  }
  return context
}

interface SecurityProviderProps {
  children: React.ReactNode
}

// Simples gerador de código TOTP para demonstração
const generateTOTP = (secret: string, timeStep = 30): string => {
  const now = Math.floor(Date.now() / 1000)
  const counter = Math.floor(now / timeStep)

  // Simulação simples do TOTP - em produção seria uma implementação real
  const hash = (secret + counter).split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const code = Math.abs(hash) % 1000000
  return code.toString().padStart(6, '0')
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [twoFactorSettings, setTwoFactorSettings] = useState<TwoFactorSettings>(() => {
    const stored = localStorage.getItem('financeServer_2fa')
    return stored ? JSON.parse(stored) : {
      enabled: false,
      method: 'authenticator',
      backupCodes: [],
      secret: ''
    }
  })

  const [verificationCode, setVerificationCode] = useState<string>('')

  useEffect(() => {
    localStorage.setItem('financeServer_2fa', JSON.stringify(twoFactorSettings))
  }, [twoFactorSettings])

  const updateTwoFactorSettings = (settings: Partial<TwoFactorSettings>) => {
    setTwoFactorSettings(prev => ({ ...prev, ...settings }))
  }

  const generateBackupCodes = (): string[] => {
    const codes = []
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  const generateTOTPSecret = (): string => {
    // Gerar um secret base32 simples para demonstração
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  const verifyTOTPCode = (code: string, secret: string): boolean => {
    // Verificar código atual e códigos de 30s anteriores/posteriores para tolerância
    const now = Math.floor(Date.now() / 1000)
    const timeSteps = [-1, 0, 1] // Janela de tolerância

    for (const step of timeSteps) {
      const counter = Math.floor((now + step * 30) / 30)
      const hash = (secret + counter).split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)

      const expectedCode = Math.abs(hash) % 1000000
      const expectedCodeStr = expectedCode.toString().padStart(6, '0')

      if (code === expectedCodeStr) {
        return true
      }
    }
    return false
  }

  const sendVerificationCode = async (method: 'sms' | 'email'): Promise<boolean> => {
    // Simular envio de código
    await new Promise(resolve => setTimeout(resolve, 1000))

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setVerificationCode(code)

    // Em um app real, seria enviado via SMS/Email
    console.log(`Código de verificação ${method}: ${code}`)

    return true
  }

  const verifyCode = (code: string): boolean => {
    return code === verificationCode
  }

  const isSecuritySetupComplete = twoFactorSettings.enabled &&
    (twoFactorSettings.secret || twoFactorSettings.phone || twoFactorSettings.email)

  const value: SecurityContextType = {
    twoFactorSettings,
    updateTwoFactorSettings,
    generateBackupCodes,
    generateTOTPSecret,
    verifyTOTPCode,
    sendVerificationCode,
    verifyCode,
    isSecuritySetupComplete
  }

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  )
}
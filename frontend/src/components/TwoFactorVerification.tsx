import React, { useState } from 'react'
import { Shield, RefreshCw, Key, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSecurity } from '@/contexts/SecurityContext'

interface TwoFactorVerificationProps {
  onVerificationSuccess: () => void
  onBackToLogin: () => void
  userEmail: string
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onVerificationSuccess,
  onBackToLogin,
  userEmail
}) => {
  const {
    twoFactorSettings,
    verifyTOTPCode,
    sendVerificationCode,
    verifyCode
  } = useSecurity()

  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [useBackupCode, setUseBackupCode] = useState(false)

  const handleVerification = async () => {
    if (verificationCode.length !== 6) {
      setError('Digite um código de 6 dígitos')
      return
    }

    setIsVerifying(true)
    setError('')

    // Simular delay de verificação
    await new Promise(resolve => setTimeout(resolve, 1000))

    let isValid = false

    if (useBackupCode) {
      // Verificar se é um código de backup válido
      const backupCodes = twoFactorSettings.backupCodes || []
      isValid = backupCodes.includes(verificationCode.toUpperCase())
    } else if (twoFactorSettings.method === 'authenticator') {
      isValid = verifyTOTPCode(verificationCode, twoFactorSettings.secret || '')
    } else {
      isValid = verifyCode(verificationCode)
    }

    if (isValid) {
      onVerificationSuccess()
    } else {
      setError('Código incorreto. Tente novamente.')
      setVerificationCode('')
    }

    setIsVerifying(false)
  }

  const handleResendCode = async () => {
    if (twoFactorSettings.method === 'authenticator') return

    setIsResending(true)
    setError('')

    try {
      await sendVerificationCode(twoFactorSettings.method as 'sms' | 'email')
      setError('')
    } catch (err) {
      setError('Erro ao reenviar código. Tente novamente.')
    }

    setIsResending(false)
  }

  const getMethodDescription = () => {
    switch (twoFactorSettings.method) {
      case 'authenticator':
        return 'Digite o código de 6 dígitos do seu app autenticador'
      case 'sms':
        return `Digite o código enviado para ${twoFactorSettings.phone}`
      case 'email':
        return `Digite o código enviado para ${twoFactorSettings.email}`
      default:
        return 'Digite o código de verificação'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerification()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verificação em Duas Etapas
            </CardTitle>
            <CardDescription className="text-gray-600">
              {useBackupCode ? 'Digite um código de backup' : getMethodDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive-background text-destructive p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verification-code">
                {useBackupCode ? 'Código de Backup' : 'Código de Verificação'}
              </Label>
              <Input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
                maxLength={useBackupCode ? 8 : 6}
                className="text-center text-xl tracking-widest font-mono"
                disabled={isVerifying}
                autoFocus
              />
            </div>

            <Button
              onClick={handleVerification}
              disabled={
                (useBackupCode ? verificationCode.length !== 8 : verificationCode.length !== 6) ||
                isVerifying
              }
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isVerifying ? 'Verificando...' : 'Verificar Código'}
            </Button>

            {/* Opções adicionais */}
            <div className="space-y-3">
              {twoFactorSettings.method !== 'authenticator' && !useBackupCode && (
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    'Reenviar Código'
                  )}
                </Button>
              )}

              {!useBackupCode && (
                <Button
                  variant="ghost"
                  onClick={() => setUseBackupCode(true)}
                  className="w-full text-sm"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Usar código de backup
                </Button>
              )}

              {useBackupCode && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setUseBackupCode(false)
                    setVerificationCode('')
                    setError('')
                  }}
                  className="w-full text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para método principal
                </Button>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                onClick={onBackToLogin}
                className="w-full text-gray-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para o login
              </Button>
            </div>

            {/* Informações da conta */}
            <div className="text-center text-xs text-gray-500">
              Verificando acesso para: {userEmail}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
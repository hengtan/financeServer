import React, { useState } from 'react'
import { Mail, ArrowLeft, Check, AlertCircle, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PasswordRecoveryProps {
  onBackToLogin: () => void
  onRecoveryComplete: () => void
}

type RecoveryStep = 'email' | 'code' | 'newPassword' | 'success'

export const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({
  onBackToLogin,
  onRecoveryComplete
}) => {
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('email')
  const [email, setEmail] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const sendRecoveryEmail = async () => {
    if (!email) {
      setError('Digite seu email')
      return
    }

    setIsLoading(true)
    setError('')

    // Simular envio de email
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Em um app real, validaria se o email existe no sistema
    if (email === 'admin@financeserver.com') {
      setCurrentStep('code')
      // Simular código enviado por email
      console.log('Código de recuperação: 123456')
    } else {
      setError('Email não encontrado em nosso sistema')
    }

    setIsLoading(false)
  }

  const verifyRecoveryCode = async () => {
    if (!recoveryCode || recoveryCode.length !== 6) {
      setError('Digite o código de 6 dígitos')
      return
    }

    setIsLoading(true)
    setError('')

    // Simular verificação
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Código simulado para demonstração
    if (recoveryCode === '123456') {
      setCurrentStep('newPassword')
    } else {
      setError('Código incorreto. Tente novamente.')
    }

    setIsLoading(false)
  }

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setIsLoading(true)
    setError('')

    // Simular redefinição de senha
    await new Promise(resolve => setTimeout(resolve, 2000))

    setCurrentStep('success')
    setIsLoading(false)
  }

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Recuperar Senha</h3>
        <p className="text-gray-600">
          Digite seu email para receber um código de recuperação
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-destructive bg-destructive-background p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="recovery-email">Email</Label>
        <Input
          id="recovery-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          disabled={isLoading}
          onKeyPress={(e) => e.key === 'Enter' && sendRecoveryEmail()}
          autoFocus
        />
      </div>

      <Button
        onClick={sendRecoveryEmail}
        disabled={!email || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? 'Enviando...' : 'Enviar Código de Recuperação'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        <p>Lembrou da sua senha?</p>
        <Button
          variant="ghost"
          onClick={onBackToLogin}
          className="text-blue-600 hover:text-blue-700"
        >
          Voltar para o login
        </Button>
      </div>
    </div>
  )

  const renderCodeStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Verifique seu Email</h3>
        <p className="text-gray-600">
          Enviamos um código de 6 dígitos para<br />
          <strong>{email}</strong>
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-destructive bg-destructive-background p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="recovery-code">Código de Recuperação</Label>
        <Input
          id="recovery-code"
          type="text"
          value={recoveryCode}
          onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          maxLength={6}
          className="text-center text-xl tracking-widest font-mono"
          disabled={isLoading}
          onKeyPress={(e) => e.key === 'Enter' && verifyRecoveryCode()}
          autoFocus
        />
      </div>

      <Button
        onClick={verifyRecoveryCode}
        disabled={recoveryCode.length !== 6 || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? 'Verificando...' : 'Verificar Código'}
      </Button>

      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={sendRecoveryEmail}
          disabled={isLoading}
          className="w-full"
        >
          Reenviar Código
        </Button>

        <Button
          variant="ghost"
          onClick={() => setCurrentStep('email')}
          className="w-full text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Alterar Email
        </Button>
      </div>
    </div>
  )

  const renderNewPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
            <Key className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Nova Senha</h3>
        <p className="text-gray-600">
          Crie uma nova senha segura para sua conta
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-destructive bg-destructive-background p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">Nova Senha</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Digite sua nova senha"
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Senha</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme sua nova senha"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && resetPassword()}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Dicas para uma senha segura:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Pelo menos 8 caracteres</li>
          <li>• Combine letras maiúsculas e minúsculas</li>
          <li>• Inclua números e símbolos</li>
          <li>• Evite informações pessoais</li>
        </ul>
      </div>

      <Button
        onClick={resetPassword}
        disabled={!newPassword || !confirmPassword || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
      </Button>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Senha Redefinida!</h3>
        <p className="text-gray-600">
          Sua senha foi alterada com sucesso.<br />
          Você já pode fazer login com sua nova senha.
        </p>
      </div>

      <Button
        onClick={onRecoveryComplete}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
      >
        Fazer Login
      </Button>
    </div>
  )

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
          <CardContent className="p-6">
            {currentStep === 'email' && renderEmailStep()}
            {currentStep === 'code' && renderCodeStep()}
            {currentStep === 'newPassword' && renderNewPasswordStep()}
            {currentStep === 'success' && renderSuccessStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
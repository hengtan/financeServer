import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { TwoFactorVerification } from '@/components/TwoFactorVerification'
import { PasswordRecovery } from '@/components/PasswordRecovery'

export const LoginPage = () => {
  usePageTitle('Login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [currentView, setCurrentView] = useState<'login' | '2fa' | 'recovery'>('login')

  const { login, verify2FA, isLoading, pending2FA, pendingEmail } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    const result = await login(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else if (result.requires2FA) {
      setCurrentView('2fa')
    } else {
      setError('Email ou senha incorretos')
    }
  }

  const handle2FASuccess = () => {
    navigate('/dashboard')
  }

  const handleRecoveryComplete = () => {
    setCurrentView('login')
    setError('')
  }

  const handleBackToLogin = () => {
    setCurrentView('login')
    setError('')
  }

  // Renderizar componentes baseados no estado atual
  if (currentView === '2fa') {
    return (
      <TwoFactorVerification
        onVerificationSuccess={handle2FASuccess}
        onBackToLogin={handleBackToLogin}
        userEmail={pendingEmail || email}
      />
    )
  }

  if (currentView === 'recovery') {
    return (
      <PasswordRecovery
        onBackToLogin={handleBackToLogin}
        onRecoveryComplete={handleRecoveryComplete}
      />
    )
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FinanceServer</span>
          </Link>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-gray-600">
              Entre na sua conta para continuar
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 text-destructive bg-destructive-background p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Sua senha"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Lembrar de mim
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('recovery')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link to="/cadastro" className="text-blue-600 hover:text-blue-500 font-medium">
                  Cadastre-se grátis
                </Link>
              </p>
            </div>

            <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Usuário Sandbox</h3>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="break-all">sandbox@financeserver.dev</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <span className="font-medium text-gray-700">Senha:</span>
                  <span>sandbox</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  💡 Use qualquer email contendo "sandbox" com senha "sandbox"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
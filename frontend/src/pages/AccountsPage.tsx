import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MonthYearPicker } from '@/components/MonthYearPicker'
import { NewAccountModal } from '@/components/NewAccountModal'
import {
  Building2,
  Wallet,
  Plus,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface Account {
  id: string
  name: string
  icon: 'bank' | 'wallet' | 'digital'
  currentBalance: number
  predictedBalance: number
  color: string
}

export const AccountsPage = () => {
  usePageTitle('Contas')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showNewAccountModal, setShowNewAccountModal] = useState(false)

  // Mock data - substituir por dados da API
  const accounts: Account[] = [
    {
      id: '1',
      name: 'Banco Caixa',
      icon: 'bank',
      currentBalance: 100.81,
      predictedBalance: -195.88,
      color: '#0066CC'
    },
    {
      id: '2',
      name: 'Banco Inter',
      icon: 'bank',
      currentBalance: 0.01,
      predictedBalance: 0.01,
      color: '#FF7A00'
    },
    {
      id: '3',
      name: 'Banco Itau',
      icon: 'bank',
      currentBalance: 3272.33,
      predictedBalance: -790.33,
      color: '#EC7000'
    },
    {
      id: '4',
      name: 'Carteira',
      icon: 'wallet',
      currentBalance: 30.00,
      predictedBalance: -156.00,
      color: '#10b981'
    },
    {
      id: '5',
      name: 'Mercado Pago',
      icon: 'digital',
      currentBalance: 0.01,
      predictedBalance: 0.01,
      color: '#00AAFF'
    }
  ]

  const totalCurrent = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
  const totalPredicted = accounts.reduce((sum, acc) => sum + acc.predictedBalance, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Building2 className="h-6 w-6" />
      case 'wallet':
        return <Wallet className="h-6 w-6" />
      case 'digital':
        return <Building2 className="h-6 w-6" />
      default:
        return <Building2 className="h-6 w-6" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas contas e acompanhe seus saldos
            </p>
          </div>
          <MonthYearPicker
            date={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Saldo Atual Total */}
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white/80">Saldo atual</p>
                {totalCurrent >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-white/80" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-white/80" />
                )}
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalCurrent)}</p>
            </CardContent>
          </Card>

          {/* Saldo Previsto Total */}
          <Card className={`border-0 ${
            totalPredicted >= 0
              ? 'bg-gradient-to-br from-green-600 to-emerald-600'
              : 'bg-gradient-to-br from-red-600 to-orange-600'
          } text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white/80">Saldo previsto</p>
                {totalPredicted >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-white/80" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-white/80" />
                )}
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalPredicted)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Add New Account Card */}
          <Card
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group"
            onClick={() => setShowNewAccountModal(true)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[240px] text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nova conta</h3>
              <p className="text-sm text-muted-foreground">
                Adicione uma nova conta bancária, carteira ou conta digital
              </p>
            </CardContent>
          </Card>

          {/* Account Cards */}
          {accounts.map((account) => (
            <Card
              key={account.id}
              className="hover:shadow-lg transition-all group cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: account.color }}
                    >
                      {getAccountIcon(account.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saldo Atual */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Saldo atual</p>
                  <p className={`text-2xl font-bold ${
                    account.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(account.currentBalance)}
                  </p>
                </div>

                {/* Saldo Previsto */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Saldo previsto</p>
                  <p className={`text-xl font-semibold ${
                    account.predictedBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(account.predictedBalance)}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    size="sm"
                  >
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Adicionar despesa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>💡 Dica:</strong> O saldo previsto considera todas as transações futuras agendadas.
              Mantenha suas contas atualizadas para ter uma visão precisa das suas finanças.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* New Account Modal */}
      <NewAccountModal
        isOpen={showNewAccountModal}
        onClose={() => setShowNewAccountModal(false)}
        onSave={(newAccount) => {
          console.log('Nova conta criada:', newAccount)
          // TODO: Salvar conta via API
        }}
      />
    </div>
  )
}

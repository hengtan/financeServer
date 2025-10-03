import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

interface CreditCard {
  id: string
  name: string
  brand: string
  lastDigits: string
  limit: number
  used: number
  available: number
  color: string
  invoice: {
    status: 'open' | 'overdue' | 'paid'
    amount: number
    dueDate: string
    paymentDate?: string
  }
}

export const CardsPage = () => {
  usePageTitle('Cartões')
  const [selectedFilter, setSelectedFilter] = useState<'open' | 'closed'>('open')

  // Mock data - substituir por dados da API
  const cards: CreditCard[] = [
    {
      id: '1',
      name: 'Cartao Inter',
      brand: 'Mastercard',
      lastDigits: '4532',
      limit: 1100.00,
      used: 284.05,
      available: 815.95,
      color: '#FF7A00',
      invoice: {
        status: 'overdue',
        amount: 153.01,
        dueDate: '2025-09-25'
      }
    },
    {
      id: '2',
      name: 'Pao de Acucar',
      brand: 'Visa',
      lastDigits: '8765',
      limit: 1829.00,
      used: 1477.53,
      available: 351.47,
      color: '#00AA00',
      invoice: {
        status: 'overdue',
        amount: 633.12,
        dueDate: '2025-10-02'
      }
    },
    {
      id: '3',
      name: 'Personallite Black',
      brand: 'Mastercard',
      lastDigits: '9012',
      limit: 54050.00,
      used: 2312.73,
      available: 51737.27,
      color: '#000000',
      invoice: {
        status: 'paid',
        amount: 1987.73,
        dueDate: '2025-09-10',
        paymentDate: '2025-09-10'
      }
    }
  ]

  const openCards = cards.filter(card => card.invoice.status !== 'paid')
  const closedCards = cards.filter(card => card.invoice.status === 'paid')
  const displayCards = selectedFilter === 'open' ? openCards : closedCards

  const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0)
  const totalUsed = cards.reduce((sum, card) => sum + card.used, 0)
  const totalAvailable = cards.reduce((sum, card) => sum + card.available, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return ((used / limit) * 100).toFixed(2)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'overdue':
        return {
          label: 'Fatura vencida',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          icon: <AlertCircle className="h-5 w-5" />
        }
      case 'open':
        return {
          label: 'Fatura aberta',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          icon: <CreditCard className="h-5 w-5" />
        }
      case 'paid':
        return {
          label: 'Fatura paga',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          icon: <CheckCircle2 className="h-5 w-5" />
        }
      default:
        return {
          label: 'Fatura aberta',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          icon: <CreditCard className="h-5 w-5" />
        }
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cartões de crédito</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus cartões e acompanhe suas faturas
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Button
            onClick={() => setSelectedFilter('open')}
            className={`${
              selectedFilter === 'open'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Faturas abertas
          </Button>
          <Button
            onClick={() => setSelectedFilter('closed')}
            className={`${
              selectedFilter === 'closed'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Faturas fechadas
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo cartão
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Limite Total */}
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white/80">Limite total</p>
                <CreditCard className="h-5 w-5 text-white/80" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalLimit)}</p>
            </CardContent>
          </Card>

          {/* Valor Usado */}
          <Card className="bg-gradient-to-br from-red-600 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white/80">Valor usado</p>
                <TrendingDown className="h-5 w-5 text-white/80" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalUsed)}</p>
            </CardContent>
          </Card>

          {/* Limite Disponível */}
          <Card className="bg-gradient-to-br from-green-600 to-emerald-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white/80">Limite disponível</p>
                <TrendingUp className="h-5 w-5 text-white/80" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalAvailable)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCards.map((card) => {
            const statusInfo = getStatusInfo(card.invoice.status)
            const usagePercentage = getUsagePercentage(card.used, card.limit)

            return (
              <Card
                key={card.id}
                className="hover:shadow-lg transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: card.color }}
                      >
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{card.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          •••• {card.lastDigits}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Badge */}
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${statusInfo.bgColor}`}>
                    <div className={statusInfo.color}>
                      {statusInfo.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </p>
                    </div>
                  </div>

                  {/* Valor da Fatura */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {card.invoice.status === 'paid' ? 'Valor pago' : 'Valor total'}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(card.invoice.amount)}
                    </p>
                  </div>

                  {/* Data */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {card.invoice.status === 'paid' ? 'Data do pagamento' : 'Venceu em'}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(card.invoice.status === 'paid' && card.invoice.paymentDate
                        ? card.invoice.paymentDate
                        : card.invoice.dueDate)}
                    </p>
                  </div>

                  {/* Usage Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(card.used)} de {formatCurrency(card.limit)}
                      </span>
                      <span className={`font-semibold ${
                        parseFloat(usagePercentage) > 80
                          ? 'text-red-600'
                          : parseFloat(usagePercentage) > 50
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}>
                        {usagePercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          parseFloat(usagePercentage) > 80
                            ? 'bg-red-600'
                            : parseFloat(usagePercentage) > 50
                            ? 'bg-orange-600'
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Limite Disponível {formatCurrency(card.available)}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {card.invoice.status === 'paid' ? (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        FATURA PAGA
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        PAGAR FATURA
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>💡 Dica:</strong> Acompanhe suas faturas e evite juros pagando em dia.
              O limite disponível é atualizado automaticamente após cada compra.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

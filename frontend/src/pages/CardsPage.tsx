import { useState, useEffect } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import {
  CreditCard,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { NewCardModal } from '@/components/NewCardModal'
import { PayInvoiceModal } from '@/components/PayInvoiceModal'
import { apiService } from '@/services/api'

interface CreditCard {
  id: string
  name: string
  brand: string
  lastDigits: string
  limit: number
  used: number
  available: number
  color: string
  closingDay: number
  dueDay: number
  invoice: {
    status: 'current' | 'due_soon' | 'overdue' // current = fatura do mês, due_soon = vence em breve, overdue = vencida
    amount: number
    dueDate: string
    closingDate: string
    daysUntilDue: number
  }
}

export const CardsPage = () => {
  usePageTitle('Cartões')
  const { toast } = useToast()
  const [showNewCardModal, setShowNewCardModal] = useState(false)
  const [showPayInvoiceModal, setShowPayInvoiceModal] = useState(false)
  const [selectedCardForPayment, setSelectedCardForPayment] = useState<CreditCard | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [accounts, setAccounts] = useState<any[]>([])
  const [cards, setCards] = useState<CreditCard[]>([])

  // Carregar cartões e transações
  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      setIsLoading(true)

      // Buscar todas as contas do usuário
      const accountsResponse = await apiService.get('/accounts')
      if (!accountsResponse.success) {
        throw new Error('Erro ao carregar contas')
      }

      const allAccounts = accountsResponse.data || []
      console.log('📊 Total accounts loaded:', allAccounts.length, allAccounts)
      setAccounts(allAccounts)

      // Filtrar apenas cartões de crédito
      const creditCardAccounts = allAccounts.filter((acc: any) => acc.type === 'CREDIT_CARD')
      console.log('💳 Credit card accounts:', creditCardAccounts.length, creditCardAccounts)

      // Buscar transações para calcular os valores
      const transactionsResponse = await apiService.get('/transactions')
      // A resposta vem com { data: { transactions: [...], pagination: {...} } }
      const allTransactions = transactionsResponse.data?.transactions || []

      // Calcular dados de cada cartão
      const cardsData: CreditCard[] = creditCardAccounts.map((account: any) => {
        const metadata = account.metadata || {}
        const creditLimit = parseFloat(account.creditLimit || '0')

        const now = new Date()
        const closingDay = metadata.closingDay || 5
        const dueDay = metadata.dueDay || 10

        // Calcular período da fatura atual (entre fechamento anterior e próximo fechamento)
        // Exemplo: Se hoje é 15/10 e fecha dia 5, a fatura vai de 06/09 a 05/10
        let closingDate = new Date(now.getFullYear(), now.getMonth(), closingDay)
        if (now.getDate() > closingDay) {
          // Já passou do fechamento deste mês, então a próxima fatura fecha no próximo mês
          closingDate.setMonth(closingDate.getMonth() + 1)
        }

        // Data de vencimento é alguns dias após o fechamento
        const dueDate = new Date(closingDate)
        dueDate.setDate(dueDay)
        if (dueDay < closingDay) {
          dueDate.setMonth(dueDate.getMonth() + 1)
        }

        // Período da fatura: do fechamento anterior até o próximo fechamento
        const previousClosing = new Date(closingDate)
        previousClosing.setMonth(previousClosing.getMonth() - 1)

        // Buscar transações do período da fatura
        const cardTransactions = allTransactions.filter((t: any) => {
          const transDate = new Date(t.date)
          return (
            t.accountId === account.id &&
            t.type === 'EXPENSE' &&
            transDate > previousClosing &&
            transDate <= closingDate
          )
        })

        // Calcular total usado
        const totalUsed = cardTransactions.reduce((sum: number, t: any) => {
          return sum + Math.abs(parseFloat(t.amount || '0'))
        }, 0)

        // Calcular disponível
        const available = creditLimit - totalUsed

        // Calcular dias até o vencimento
        const diffTime = dueDate.getTime() - now.getTime()
        const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Determinar status da fatura
        let status: 'current' | 'due_soon' | 'overdue' = 'current'
        if (daysUntilDue < 0) {
          status = 'overdue' // Vencida
        } else if (daysUntilDue <= 10) {
          status = 'due_soon' // Vence em breve (10 dias ou menos)
        }

        return {
          id: account.id,
          name: account.name,
          brand: metadata.brand || account.bankName || 'Visa',
          lastDigits: metadata.lastDigits || account.accountNumber?.slice(-4) || '0000',
          limit: creditLimit,
          used: totalUsed,
          available: available,
          color: account.color || '#3b82f6',
          closingDay,
          dueDay,
          invoice: {
            status,
            amount: totalUsed,
            dueDate: dueDate.toISOString().split('T')[0],
            closingDate: closingDate.toISOString().split('T')[0],
            daysUntilDue
          }
        }
      })

      console.log('💳 Final cards data:', cardsData.length, cardsData)
      setCards(cardsData)
    } catch (error) {
      console.error('Erro ao carregar cartões:', error)
      toast({
        title: 'Erro ao carregar cartões',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para pagar fatura
  const handlePayInvoice = (accountId: string) => {
    if (!selectedCardForPayment) return

    const account = accounts.find(acc => acc.id === accountId)
    if (!account) return

    const invoiceAmount = selectedCardForPayment.invoice.amount

    // Atualizar saldo da conta
    setAccounts(accounts.map(acc =>
      acc.id === accountId
        ? { ...acc, balance: acc.balance - invoiceAmount }
        : acc
    ))

    // Atualizar status da fatura para paga
    const today = new Date().toISOString().split('T')[0]
    setCards(cards.map(card =>
      card.id === selectedCardForPayment.id
        ? {
            ...card,
            used: 0, // Zera valores usados
            available: card.limit, // Restaura limite disponível
            invoice: {
              ...card.invoice,
              status: 'paid' as const,
              paymentDate: today,
              amount: invoiceAmount // Mantém valor pago
            }
          }
        : card
    ))

    toast({
      title: 'Fatura paga com sucesso!',
      description: `Pagamento de ${formatCurrency(invoiceAmount)} realizado com ${account.name}`,
    })

    setSelectedCardForPayment(null)
  }

  const handleOpenPayInvoice = (card: CreditCard) => {
    setSelectedCardForPayment(card)
    setShowPayInvoiceModal(true)
  }

  // Sempre exibir todos os cartões
  const displayCards = cards

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

  const getStatusInfo = (card: CreditCard) => {
    const { status, daysUntilDue } = card.invoice

    switch (status) {
      case 'overdue':
        return {
          label: 'Fatura vencida',
          sublabel: `Venceu há ${Math.abs(daysUntilDue)} dia${Math.abs(daysUntilDue) > 1 ? 's' : ''}`,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          icon: <AlertCircle className="h-5 w-5" />
        }
      case 'due_soon':
        return {
          label: `Vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''}`,
          sublabel: daysUntilDue <= 2 ? '⚠️ Atenção!' : daysUntilDue <= 5 ? '📅 Em breve' : '',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          icon: <AlertCircle className="h-5 w-5" />
        }
      case 'current':
        return {
          label: 'Fatura atual',
          sublabel: `Vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''}`,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          icon: <CreditCard className="h-5 w-5" />
        }
      default:
        return {
          label: 'Fatura atual',
          sublabel: '',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          icon: <CreditCard className="h-5 w-5" />
        }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Carregando cartões...</p>
        </div>
      </div>
    )
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
          {/* Add New Card */}
          <Card
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group"
            onClick={() => setShowNewCardModal(true)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[240px] text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Novo cartão</h3>
              <p className="text-sm text-muted-foreground">
                Adicione um novo cartão de crédito para gerenciar suas faturas
              </p>
            </CardContent>
          </Card>

          {/* Credit Cards */}
          {displayCards.map((card) => {
            const statusInfo = getStatusInfo(card)
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
                      {statusInfo.sublabel && (
                        <p className={`text-xs ${statusInfo.color}`}>
                          {statusInfo.sublabel}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Valor da Fatura */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Valor da fatura</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(card.invoice.amount)}
                    </p>
                  </div>

                  {/* Data */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fecha em</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(card.invoice.closingDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Vence em</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(card.invoice.dueDate)}
                      </p>
                    </div>
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
                    <Button
                      className={`w-full text-white ${
                        card.invoice.status === 'overdue'
                          ? 'bg-red-600 hover:bg-red-700'
                          : card.invoice.status === 'due_soon'
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                      onClick={() => handleOpenPayInvoice(card)}
                    >
                      {card.invoice.status === 'overdue' ? '⚠️ PAGAR AGORA' : 'PAGAR FATURA'}
                    </Button>
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

      {/* New Card Modal */}
      <NewCardModal
        isOpen={showNewCardModal}
        onClose={() => setShowNewCardModal(false)}
        onSave={async (newCard) => {
          try {
            // Criar conta do tipo CREDIT_CARD via API
            const response = await apiService.post('/accounts', {
              name: newCard.name,
              type: 'CREDIT_CARD',
              balance: 0, // Cartões iniciam zerados
              creditLimit: newCard.limit,
              bankName: newCard.brand,
              accountNumber: newCard.lastDigits,
              description: `Cartão ${newCard.brand} - Fecha dia ${newCard.closingDay}, vence dia ${newCard.dueDay}`,
              color: '#' + Math.floor(Math.random()*16777215).toString(16), // Cor aleatória
              metadata: {
                lastDigits: newCard.lastDigits,
                brand: newCard.brand,
                closingDay: newCard.closingDay,
                dueDay: newCard.dueDay
              }
            })

            if (response.success) {
              toast({
                title: 'Cartão criado com sucesso!',
                description: `Cartão ${newCard.name} foi adicionado à sua conta`,
              })
              // Recarregar dados dos cartões
              await loadCards()
            } else {
              throw new Error(response.message || 'Erro ao criar cartão')
            }
          } catch (error) {
            console.error('Erro ao criar cartão:', error)
            toast({
              title: 'Erro ao criar cartão',
              description: error instanceof Error ? error.message : 'Tente novamente',
              variant: 'destructive'
            })
          }
        }}
      />

      {/* Pay Invoice Modal */}
      {selectedCardForPayment && (
        <PayInvoiceModal
          isOpen={showPayInvoiceModal}
          onClose={() => {
            setShowPayInvoiceModal(false)
            setSelectedCardForPayment(null)
          }}
          onPay={handlePayInvoice}
          cardName={selectedCardForPayment.name}
          invoiceAmount={selectedCardForPayment.invoice.amount}
          accounts={accounts}
        />
      )}
    </div>
  )
}

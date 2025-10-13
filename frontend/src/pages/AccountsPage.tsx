import { useState, useEffect } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MonthYearPicker } from '@/components/MonthYearPicker'
import { NewAccountModal } from '@/components/NewAccountModal'
import { QuickExpenseModal } from '@/components/QuickExpenseModal'
import { userCategoriesService } from '@/services/userCategories'
import { transactionsService } from '@/services/transactions'
import { accountsService, Account as ApiAccount } from '@/services/accounts'
import { useToast } from '@/hooks/useToast'
import { useDashboardRefresh } from '@/contexts/DashboardRefreshContext'
import {
  Building2,
  Wallet,
  Plus,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react'

interface Account {
  id: string
  name: string
  icon: 'bank' | 'wallet' | 'digital'
  currentBalance: number
  predictedBalance: number
  color: string
  type: string
}

export const AccountsPage = () => {
  usePageTitle('Contas')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showNewAccountModal, setShowNewAccountModal] = useState(false)
  const [showQuickExpenseModal, setShowQuickExpenseModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [expenseCategories, setExpenseCategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { triggerRefresh } = useDashboardRefresh()

  const totalCurrent = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
  const totalPredicted = accounts.reduce((sum, acc) => sum + acc.predictedBalance, 0)

  // Buscar contas do usuário da API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true)
        const response = await accountsService.getAccounts()

        if (response.success && response.data) {
          // Garantir que response.data seja um array
          const accountsData = Array.isArray(response.data) ? response.data : []

          // Mapear contas da API para o formato local
          const mappedAccounts: Account[] = accountsData.map((acc: ApiAccount) => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            icon: getIconType(acc.type),
            currentBalance: parseFloat(acc.balance),
            predictedBalance: parseFloat(acc.balance), // TODO: Calcular saldo previsto com transações futuras
            color: getAccountColor(acc.type)
          }))

          setAccounts(mappedAccounts)
        }
      } catch (error) {
        console.error('Erro ao buscar contas:', error)
        toast({
          title: 'Erro ao carregar contas',
          description: 'Não foi possível carregar suas contas. Tente novamente.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  // Buscar categorias de despesa do usuário
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await userCategoriesService.getUserCategories()
        if (response.success && response.data?.categories) {
          // Filtrar apenas categorias de despesa da tabela UserCategory do usuário
          const expenseCats = response.data.categories.filter((cat: any) => cat.type === 'EXPENSE')
          setExpenseCategories(expenseCats)
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      }
    }
    fetchCategories()
  }, [])

  // Helper: Determinar tipo de ícone baseado no tipo de conta
  const getIconType = (type: string): 'bank' | 'wallet' | 'digital' => {
    const typeMap: Record<string, 'bank' | 'wallet' | 'digital'> = {
      'CHECKING': 'bank',
      'SAVINGS': 'bank',
      'INVESTMENT': 'bank',
      'CREDIT_CARD': 'bank',
      'LOAN': 'bank',
      'OTHER': 'digital'
    }
    return typeMap[type] || 'bank'
  }

  // Helper: Determinar cor baseado no tipo de conta
  const getAccountColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      'CHECKING': '#0066CC',
      'SAVINGS': '#10b981',
      'INVESTMENT': '#8b5cf6',
      'CREDIT_CARD': '#ef4444',
      'LOAN': '#f59e0b',
      'OTHER': '#6366f1'
    }
    return colorMap[type] || '#6366f1'
  }

  // Função para criar nova conta
  const handleCreateAccount = async (newAccountData: any) => {
    try {
      console.log('📝 Criando nova conta:', newAccountData)

      // Mapear tipo do modal para tipo da API
      const typeMap: Record<string, string> = {
        'bank': 'CHECKING',
        'wallet': 'SAVINGS',
        'digital': 'OTHER'
      }

      const accountData = {
        name: newAccountData.name,
        type: typeMap[newAccountData.type] || 'CHECKING',
        balance: newAccountData.initialBalance.toString(),
        currency: 'BRL',
        status: 'ACTIVE'
      }

      console.log('📤 Enviando para API:', accountData)

      const response = await accountsService.createAccount(accountData)

      console.log('📥 Resposta da API:', response)

      if (response.success) {
        toast({
          title: 'Conta criada com sucesso!',
          description: `${newAccountData.name} foi adicionada às suas contas.`,
        })

        // Recarregar lista de contas
        const accountsResponse = await accountsService.getAccounts()
        if (accountsResponse.success && accountsResponse.data) {
          const accountsData = Array.isArray(accountsResponse.data) ? accountsResponse.data : []
          const mappedAccounts: Account[] = accountsData.map((acc: ApiAccount) => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            icon: getIconType(acc.type),
            currentBalance: parseFloat(acc.balance),
            predictedBalance: parseFloat(acc.balance),
            color: getAccountColor(acc.type)
          }))
          setAccounts(mappedAccounts)
        }
      } else {
        toast({
          title: 'Erro ao criar conta',
          description: response.message || 'Não foi possível criar a conta. Tente novamente.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      toast({
        title: 'Erro ao criar conta',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const handleAddExpense = (account: Account) => {
    setSelectedAccount(account)
    setShowQuickExpenseModal(true)
  }

  const handleCreateCategory = async (name: string, type: 'INCOME' | 'EXPENSE'): Promise<string | null> => {
    try {
      const response = await userCategoriesService.createUserCategory({
        name,
        type,
        isCustom: true
      })

      if (response.success && response.data) {
        toast({
          title: 'Categoria criada!',
          description: `${name} foi adicionada às suas categorias.`,
        })

        // Recarregar categorias
        const categoriesResponse = await userCategoriesService.getUserCategories()
        if (categoriesResponse.success && categoriesResponse.data?.categories) {
          const expenseCats = categoriesResponse.data.categories.filter((cat: any) => cat.type === 'EXPENSE')
          setExpenseCategories(expenseCats)
        }

        return response.data.id
      }

      return null
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      toast({
        title: 'Erro ao criar categoria',
        description: 'Não foi possível criar a categoria. Tente novamente.',
        variant: 'destructive'
      })
      return null
    }
  }

  const handleSubmitExpense = async (expenseData: any) => {
    try {
      // Determinar status baseado em isPaid e ignoreBalance
      let status = 'PENDING'
      if (expenseData.isPaid && !expenseData.ignoreBalance) {
        status = 'COMPLETED' // Atualiza saldo
      } else if (expenseData.ignoreBalance) {
        status = 'PENDING' // Não atualiza saldo
      }

      const transactionData = {
        description: expenseData.description,
        amount: expenseData.amount,
        userCategoryId: expenseData.categoryId,
        accountId: expenseData.accountId,
        type: expenseData.type || 'EXPENSE', // Usar o tipo da transação
        date: new Date(expenseData.date).toISOString(),
        status: status
      }

      const response = await transactionsService.createTransaction(transactionData)

      const isIncome = expenseData.type === 'INCOME'

      if (response.success) {
        toast({
          title: isIncome ? 'Receita adicionada!' : 'Despesa adicionada!',
          description: `${expenseData.description} - R$ ${expenseData.amount.toFixed(2)}`,
        })

        // Recarregar lista de contas para atualizar saldos
        const accountsResponse = await accountsService.getAccounts()
        if (accountsResponse.success && accountsResponse.data) {
          const accountsData = Array.isArray(accountsResponse.data) ? accountsResponse.data : []
          const mappedAccounts: Account[] = accountsData.map((acc: ApiAccount) => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            icon: getIconType(acc.type),
            currentBalance: parseFloat(acc.balance),
            predictedBalance: parseFloat(acc.balance),
            color: getAccountColor(acc.type)
          }))
          setAccounts(mappedAccounts)
        }

        // Trigger dashboard refresh to update graphs
        triggerRefresh()
      } else {
        toast({
          title: isIncome ? 'Erro ao adicionar receita' : 'Erro ao adicionar despesa',
          description: response.message || 'Tente novamente',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error)
      toast({
        title: 'Erro ao adicionar transação',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-muted-foreground">Carregando contas...</span>
          </div>
        ) : (
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
            {accounts.length === 0 ? (
              <Card className="col-span-2 border-0 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Você ainda não tem contas cadastradas. Clique em "Nova conta" para começar!
                  </p>
                </CardContent>
              </Card>
            ) : (
              accounts.map((account) => (
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
                    onClick={() => handleAddExpense(account)}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Nova transação
                  </Button>
                </div>
              </CardContent>
            </Card>
              ))
            )}
          </div>
        )}

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
        onSave={handleCreateAccount}
      />

      {/* Quick Expense Modal */}
      {selectedAccount && (
        <QuickExpenseModal
          isOpen={showQuickExpenseModal}
          onClose={() => {
            setShowQuickExpenseModal(false)
            setSelectedAccount(null)
          }}
          onSubmit={handleSubmitExpense}
          onCreateCategory={handleCreateCategory}
          accountId={selectedAccount.id}
          accountName={selectedAccount.name}
          categories={expenseCategories}
        />
      )}
    </div>
  )
}

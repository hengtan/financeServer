import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NewTransactionModal } from '@/components/NewTransactionModal'
import { apiService } from '@/services/api'
import {
  Calendar,
  Filter,
  Download,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { transactionsService, Transaction } from '@/services/transactions'
import { userCategoriesService, UserCategory } from '@/services/userCategories'
import { LoadingWrapper } from '@/components/LoadingWrapper'
import { useLoading } from '@/hooks/useLoading'

export const TransactionsPage = () => {
  usePageTitle('Transações')

  const [selectedPeriod, setSelectedPeriod] = useState('30-dias')
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false)
  const { isLoading, startLoading, stopLoading } = useLoading({ minimumDuration: 800 })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>(['todas'])
  const [accounts, setAccounts] = useState<any[]>([])
  const [userCategories, setUserCategories] = useState<UserCategory[]>([])
  const [realCategories, setRealCategories] = useState<any[]>([])

  useEffect(() => {
    console.log('🔍 Frontend: Checking authentication status...')
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    console.log('🔍 Frontend: Auth token present:', !!token)
    if (token) {
      console.log('🔍 Frontend: Token preview:', token.substring(0, 20) + '...')
    }

    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar transações, categorias de usuário e contas em paralelo
      const [transactionsResponse, userCategoriesResponse, accountsResponse] = await Promise.all([
        transactionsService.getTransactions({ limit: 50 }),
        userCategoriesService.getActiveUserCategories(),
        apiService.get('/accounts')
      ])

      let categoriesMap = new Map<string, string>()

      if (transactionsResponse.success) {
        // Primeiro, buscar todas as categorias para fazer o mapeamento
        try {
          const allCategoriesResponse = await userCategoriesService.getActiveUserCategories()
          if (allCategoriesResponse.success && allCategoriesResponse.data?.categories) {
            allCategoriesResponse.data.categories.forEach((cat: any) => {
              categoriesMap.set(cat.id, cat.name)
            })
          }
        } catch (err) {
          console.error('Error loading categories for mapping:', err)
        }

        // Converter dados da API para o formato esperado pelo componente
        const formattedTransactions: Transaction[] = transactionsResponse.data.data.map((t: any) => ({
          id: t.id,
          description: t.description,
          amount: parseFloat(t.amount || 0),
          date: t.date,
          category: t.userCategoryId ? (categoriesMap.get(t.userCategoryId) || 'Sem categoria') : (t.category?.name || 'Sem categoria'),
          account: t.account?.name || 'Conta',
          type: t.type === 'INCOME' ? 'income' : 'expense',
          status: t.status === 'COMPLETED' ? 'confirmed' : t.status === 'PENDING' ? 'pending' : 'cancelled'
        }))
        setTransactions(formattedTransactions)
      }

      console.log('🔍 Frontend: User categories response:', userCategoriesResponse)
      if (userCategoriesResponse.success && userCategoriesResponse.data?.categories && Array.isArray(userCategoriesResponse.data.categories)) {
        const categoriesArray = userCategoriesResponse.data.categories
        console.log('✅ Frontend: User categories loaded:', categoriesArray.length)
        setUserCategories(categoriesArray)
        const categoryNames = categoriesArray.map((cat: UserCategory) => cat.name)
        setCategories(['todas', ...categoryNames])
        // Compatibilidade com código existente
        const mapped = categoriesArray.map((cat: UserCategory) => ({
          id: cat.id,
          name: cat.name,
          type: cat.type,
          color: cat.color,
          icon: cat.icon
        }))
        console.log('📋 Frontend: Real categories to pass to modal:', mapped)
        setRealCategories(mapped)
      } else {
        console.log('❌ Frontend: User categories failed or not array:', userCategoriesResponse)
        setUserCategories([])
        setCategories(['todas'])
        setRealCategories([])
      }

      if (accountsResponse.success && accountsResponse.data?.accounts) {
        console.log('✅ Accounts loaded successfully:', accountsResponse.data.accounts)
        setAccounts(accountsResponse.data.accounts)
      } else {
        console.log('❌ Failed to load accounts:', accountsResponse)
        setAccounts([])
      }

    } catch (error) {
      console.error('Erro ao carregar transações:', error)
      setError('Erro ao carregar transações')
      // Em caso de erro, usar array vazio em vez de dados mock
      setTransactions([])
      setUserCategories([])
      setCategories(['todas'])
      setAccounts([])
      setRealCategories([])
    } finally {
      setLoading(false)
    }
  }

  const summary = {
    total: transactions.reduce((sum, t) => sum + t.amount, 0),
    income: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    expenses: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
    count: transactions.length
  }

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'cartão') return '💳'
    if (type === 'pix') return '🔄'
    if (type === 'transferência') return '🔀'
    return amount > 0 ? '↗️' : '↙️'
  }

  const getStatusColor = (status: string) => {
    return status === 'confirmada' ? 'text-success' : 'text-warning'
  }

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'Renda': 'bg-success-background text-success',
      'Renda Extra': 'bg-success-background text-success',
      'Alimentação': 'bg-orange-50 text-orange-600 dark:bg-orange-200/20 dark:text-orange-200',
      'Transporte': 'bg-blue-50 text-blue-600 dark:bg-blue-200/20 dark:text-blue-200',
      'Entretenimento': 'bg-purple-50 text-purple-600 dark:bg-purple-200/20 dark:text-purple-200',
      'Saúde': 'bg-green-50 text-green-600 dark:bg-green-200/20 dark:text-green-200',
      'Educação': 'bg-indigo-50 text-indigo-600 dark:bg-indigo-200/20 dark:text-indigo-200',
      'Vestuário': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-200/20 dark:text-emerald-200',
      'Investimento': 'bg-teal-50 text-teal-600 dark:bg-teal-200/20 dark:text-teal-200',
      'Transferência': 'bg-gray-50 text-gray-600 dark:bg-gray-200/20 dark:text-gray-200'
    }
    return categoryColors[category] || 'bg-gray-50 text-gray-600 dark:bg-gray-200/20 dark:text-gray-200'
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedCategory !== 'todas' && transaction.category !== selectedCategory) {
      return false
    }
    return true
  })

  const handleNewTransaction = async (transaction: any) => {
    try {
      console.log('🔄 Frontend: Transaction data received from modal:', transaction)

      const payload = {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.typeId === 'credit' ? 'INCOME' : 'EXPENSE',
        userCategoryId: transaction.categoryId, // 🚀 Usando nova arquitetura híbrida
        accountId: transaction.accountId,
        date: new Date(transaction.date).toISOString()
      }

      console.log('📤 Frontend: Payload being sent to API:', payload)

      // Enviar para a API
      const response = await apiService.post('/transactions', payload)

      if (response.success) {
        // Adicionar a transação salva ao estado
        const savedTransaction = {
          id: response.data.id,
          description: response.data.description,
          amount: parseFloat(response.data.amount),
          type: response.data.type,
          category: 'Categoria',
          account: 'Conta',
          status: response.data.status,
          date: new Date(response.data.date).toLocaleDateString('pt-BR')
        }
        setTransactions([savedTransaction, ...transactions])

        // Recarregar transações para ter dados atualizados
        loadTransactions()
      }
    } catch (error) {
      console.error('❌ Erro ao salvar transação:', error)
      // Em caso de erro, mostrar mensagem ao usuário
      alert(`Erro ao criar transação: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`)
    }
  }

  const handleExport = () => {
    const csv = [
      ['Data', 'Descrição', 'Valor', 'Categoria', 'Conta', 'Tipo', 'Status'],
      ...filteredTransactions.map(t => [
        t.date,
        t.description,
        t.amount.toString(),
        t.category,
        t.account,
        t.type,
        t.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transacoes.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Transações</h1>
            <p className="text-muted-foreground">Gerencie e acompanhe todas suas movimentações financeiras</p>
          </div>
          <Button
            onClick={() => setIsNewTransactionOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                  <p className={`text-2xl font-bold ${summary.total >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {summary.total >= 0 ? '+' : ''}R$ {summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receitas</p>
                  <p className="text-2xl font-bold text-success">
                    +R$ {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Despesas</p>
                  <p className="text-2xl font-bold text-destructive">
                    -R$ {summary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <ArrowDownLeft className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Transações</p>
                  <p className="text-2xl font-bold text-foreground">{summary.count}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle>Histórico de Transações</CardTitle>
                <CardDescription>
                  Visualize e gerencie todas suas transações
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar transações..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'todas' ? 'Todas as Categorias' : cat}
                    </option>
                  ))}
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                      {getTransactionIcon(transaction.type, transaction.amount)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{transaction.account}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span className={`font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${
                      transaction.amount > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {transaction.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button variant="outline">
                Carregar Mais Transações
              </Button>
            </div>
          </CardContent>
        </Card>

        <NewTransactionModal
          isOpen={isNewTransactionOpen}
          onClose={() => setIsNewTransactionOpen(false)}
          onSubmit={handleNewTransaction}
          accounts={(() => {
            const mappedAccounts = accounts.map(acc => ({
              id: acc.id,
              name: acc.name,
              type: acc.type?.toLowerCase() || 'checking',
              currency: acc.currency || 'BRL'
            }))
            console.log('🔄 Passing accounts to modal:', mappedAccounts)
            return mappedAccounts
          })()}
          categories={realCategories}
          defaultValues={{
            accountId: accounts.length > 0 ? accounts[0].id : undefined,
            categoryId: realCategories.length > 0 ? realCategories[0].id : undefined
          }}
        />
      </div>
    </div>
  )
}
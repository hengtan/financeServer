import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NewTransactionModal } from '@/components/NewTransactionModal'
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

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar transações e categorias em paralelo
      const [transactionsResponse, categoriesResponse] = await Promise.all([
        transactionsService.getTransactions({ limit: 50 }),
        transactionsService.getCategories()
      ])

      if (transactionsResponse.success) {
        // Converter dados da API para o formato esperado pelo componente
        const formattedTransactions: Transaction[] = transactionsResponse.data.data.map((t: any) => ({
          id: t.id,
          description: t.description,
          amount: parseFloat(t.amount || 0),
          date: t.date,
          category: t.category?.name || 'Sem categoria',
          account: t.account?.name || 'Conta',
          type: t.type === 'INCOME' ? 'income' : 'expense',
          status: t.status === 'COMPLETED' ? 'confirmed' : t.status === 'PENDING' ? 'pending' : 'cancelled'
        }))
        setTransactions(formattedTransactions)
      }

      if (categoriesResponse.success) {
        setCategories(['todas', ...categoriesResponse.data])
      }

    } catch (error) {
      console.error('Erro ao carregar transações:', error)
      setError('Erro ao carregar transações')
      // Em caso de erro, usar array vazio em vez de dados mock
      setTransactions([])
      setCategories(['todas'])
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

  const handleNewTransaction = (transaction: any) => {
    setTransactions([transaction, ...transactions])
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
        />
      </div>
    </div>
  )
}
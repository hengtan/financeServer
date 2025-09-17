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
import { useState } from 'react'
import { LoadingWrapper } from '@/components/LoadingWrapper'
import { useLoading } from '@/hooks/useLoading'

export const TransactionsPage = () => {
  usePageTitle('Transações')

  const [selectedPeriod, setSelectedPeriod] = useState('30-dias')
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false)
  const { isLoading, startLoading, stopLoading } = useLoading({ minimumDuration: 800 })
  const [transactions, setTransactions] = useState([
    { id: 1, description: "Salário - Empresa XYZ", amount: 5200.00, date: "2024-01-15", category: "Renda", account: "Conta Corrente", type: "crédito", status: "confirmada" },
    { id: 2, description: "Freelance - Projeto ABC", amount: 1200.00, date: "2024-01-12", category: "Renda Extra", account: "Conta Poupança", type: "pix", status: "confirmada" },
    { id: 3, description: "Supermercado Extra", amount: -234.50, date: "2024-01-16", category: "Alimentação", account: "Conta Corrente", type: "débito", status: "confirmada" },
    { id: 4, description: "Netflix Streaming", amount: -29.90, date: "2024-01-14", category: "Entretenimento", account: "Cartão Visa", type: "cartão", status: "pendente" },
    { id: 5, description: "Uber - Corrida Centro", amount: -18.50, date: "2024-01-14", category: "Transporte", account: "Cartão Mastercard", type: "cartão", status: "confirmada" },
    { id: 6, description: "Farmácia São João", amount: -85.30, date: "2024-01-13", category: "Saúde", account: "Conta Corrente", type: "débito", status: "confirmada" },
    { id: 7, description: "Mercado Livre - Livros", amount: -67.90, date: "2024-01-11", category: "Educação", account: "Cartão Visa", type: "cartão", status: "confirmada" },
    { id: 8, description: "Academia FitLife", amount: -89.90, date: "2024-01-10", category: "Saúde", account: "Conta Corrente", type: "débito", status: "confirmada" },
    { id: 9, description: "Posto Shell", amount: -120.00, date: "2024-01-09", category: "Transporte", account: "Cartão Visa", type: "cartão", status: "confirmada" },
    { id: 10, description: "iFood - Almoço", amount: -45.90, date: "2024-01-08", category: "Alimentação", account: "Cartão Mastercard", type: "cartão", status: "confirmada" },
    { id: 11, description: "Transferência - João", amount: -200.00, date: "2024-01-07", category: "Transferência", account: "Conta Corrente", type: "pix", status: "confirmada" },
    { id: 12, description: "Padaria do Bairro", amount: -15.50, date: "2024-01-07", category: "Alimentação", account: "Conta Corrente", type: "débito", status: "confirmada" },
    { id: 13, description: "Spotify Premium", amount: -16.90, date: "2024-01-06", category: "Entretenimento", account: "Cartão Visa", type: "cartão", status: "confirmada" },
    { id: 14, description: "Amazon - Livro", amount: -35.00, date: "2024-01-05", category: "Educação", account: "Cartão Mastercard", type: "cartão", status: "confirmada" },
    { id: 15, description: "Padaria Central", amount: -12.80, date: "2024-01-05", category: "Alimentação", account: "Conta Corrente", type: "débito", status: "confirmada" },
    { id: 16, description: "Estacionamento Shopping", amount: -8.00, date: "2024-01-04", category: "Transporte", account: "Conta Corrente", type: "débito", status: "confirmada" },
    { id: 17, description: "Pizzaria Bella", amount: -78.50, date: "2024-01-03", category: "Alimentação", account: "Cartão Visa", type: "cartão", status: "confirmada" },
    { id: 18, description: "Cinema Multiplex", amount: -24.00, date: "2024-01-02", category: "Entretenimento", account: "Cartão Mastercard", type: "cartão", status: "confirmada" },
    { id: 19, description: "Loja de Roupas", amount: -189.90, date: "2024-01-01", category: "Vestuário", account: "Cartão Visa", type: "cartão", status: "confirmada" },
    { id: 20, description: "Investimento CDB", amount: -1000.00, date: "2024-01-01", category: "Investimento", account: "Conta Corrente", type: "transferência", status: "confirmada" }
  ])

  const categories = [
    'todas', 'Renda', 'Alimentação', 'Transporte', 'Entretenimento', 'Saúde', 'Educação', 'Vestuário', 'Investimento'
  ]

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
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NewTransactionModal } from '@/components/NewTransactionModal'
import { apiService } from '@/services/api'
import { alertsService, AlertType, AlertSeverity, AlertChannel } from '@/services/alerts'
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
  ArrowDownLeft,
  Edit,
  Paperclip,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { transactionsService, Transaction } from '@/services/transactions'
import { userCategoriesService, UserCategory } from '@/services/userCategories'
import { LoadingWrapper } from '@/components/LoadingWrapper'
import { useLoading } from '@/hooks/useLoading'
import { MonthYearPicker } from '@/components/MonthYearPicker'

export const TransactionsPage = () => {
  usePageTitle('Transações')

  const [searchParams, setSearchParams] = useSearchParams()
  const typeFromUrl = searchParams.get('type')

  const [selectedPeriod, setSelectedPeriod] = useState('30-dias')
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false)
  const { isLoading, startLoading, stopLoading } = useLoading({ minimumDuration: 800 })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>(['todas'])
  const [accounts, setAccounts] = useState<any[]>([])
  const [userCategories, setUserCategories] = useState<UserCategory[]>([])
  const [realCategories, setRealCategories] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: typeFromUrl?.toLowerCase() || 'all', // Converter INCOME/EXPENSE para income/expense
    status: 'all', // 'all', 'pending', 'confirmed', 'cancelled'
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  })

  // Estado para tipo selecionado (seleção única)
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'transfer'>(
    typeFromUrl?.toLowerCase() === 'income' ? 'income' :
    typeFromUrl?.toLowerCase() === 'expense' ? 'expense' : 'all'
  )

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)

  // Estados para ordenação
  const [sortColumn, setSortColumn] = useState<'date' | 'description' | 'category' | 'account' | 'amount' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Estados para máscara de valores dos filtros (em centavos)
  const [amountMinCents, setAmountMinCents] = useState('')
  const [amountMaxCents, setAmountMaxCents] = useState('')

  // Função para formatar centavos para display
  const formatAmountDisplay = (centavos: string): string => {
    if (!centavos) return ''
    const num = parseInt(centavos) || 0
    const reais = Math.floor(num / 100)
    const cents = num % 100
    const reaisFormatted = reais.toLocaleString('pt-BR')
    return `${reaisFormatted},${cents.toString().padStart(2, '0')}`
  }

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

        // Ordenar por data (mais recente primeiro)
        formattedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
    total: transactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount)
    }, 0),
    income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    expenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    count: transactions.length
  }

  const getTransactionIcon = (transactionType: string) => {
    // transactionType é 'income' ou 'expense'
    return transactionType === 'income' ? '↗️' : '↙️'
  }

  const getStatusColor = (status: string) => {
    return status === 'confirmada' ? 'text-success' : 'text-warning'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
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

  // Função para lidar com ordenação
  const handleSort = (column: 'date' | 'description' | 'category' | 'account' | 'amount') => {
    if (sortColumn === column) {
      // Se já está ordenando por esta coluna, inverte a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Nova coluna, começa com ascendente
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Componente para o ícone de ordenação
  const SortIcon = ({ column }: { column: 'date' | 'description' | 'category' | 'account' | 'amount' }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 ml-1" />
      : <ArrowDown className="h-3.5 w-3.5 ml-1" />
  }

  const filteredTransactions = transactions.filter(transaction => {
    // Filtro de pesquisa (descrição, categoria, conta)
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchesDescription = transaction.description?.toLowerCase().includes(search)
      const matchesCategory = transaction.category?.toLowerCase().includes(search)
      const matchesAccount = transaction.account?.toLowerCase().includes(search)

      if (!matchesDescription && !matchesCategory && !matchesAccount) {
        return false
      }
    }

    // Filtro de categoria
    if (selectedCategory !== 'todas' && transaction.category !== selectedCategory) {
      return false
    }

    // Filtro de tipo (seleção única)
    if (selectedType !== 'all' && transaction.type !== selectedType) {
      return false
    }

    // Filtro de status
    if (filters.status !== 'all' && transaction.status !== filters.status) {
      return false
    }

    // Filtro de data inicial
    if (filters.dateFrom && new Date(transaction.date) < new Date(filters.dateFrom)) {
      return false
    }

    // Filtro de data final
    if (filters.dateTo && new Date(transaction.date) > new Date(filters.dateTo)) {
      return false
    }

    // Filtro de valor mínimo
    if (filters.amountMin && transaction.amount < parseFloat(filters.amountMin)) {
      return false
    }

    // Filtro de valor máximo
    if (filters.amountMax && transaction.amount > parseFloat(filters.amountMax)) {
      return false
    }

    return true
  })

  // Ordenação
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortColumn) return 0

    let comparison = 0

    switch (sortColumn) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case 'description':
        comparison = (a.description || '').localeCompare(b.description || '')
        break
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '')
        break
      case 'account':
        comparison = (a.account || '').localeCompare(b.account || '')
        break
      case 'amount':
        comparison = a.amount - b.amount
        break
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  // Paginação
  const totalItems = sortedTransactions.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex)

  // Funções de navegação de página
  const goToFirstPage = () => setCurrentPage(1)
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1))
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1))
  const goToLastPage = () => setCurrentPage(totalPages)

  // Reset página quando mudar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedType, itemsPerPage])

  const handleNewTransaction = async (transaction: any) => {
    try {
      console.log('🔄 Frontend: Transaction data received from modal:', transaction)

      const payload = {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.isIncome ? 'INCOME' : 'EXPENSE', // Usar o campo isIncome
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

        // Criar alerta de transação criada
        try {
          await alertsService.createAlert({
            type: AlertType.TRANSACTION_CREATED,
            severity: AlertSeverity.LOW,
            title: transaction.isIncome ? 'Receita Adicionada' : 'Despesa Adicionada',
            message: `${transaction.isIncome ? 'Receita' : 'Despesa'} de R$ ${transaction.amount.toFixed(2)} foi registrada com sucesso`,
            description: `Descrição: ${transaction.description}`,
            data: {
              amount: transaction.amount,
              transaction: response.data
            },
            channels: [AlertChannel.IN_APP],
            expiresInHours: 24
          })
        } catch (alertError) {
          console.error('Erro ao criar alerta:', alertError)
        }

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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Transações
              {selectedType === 'income' && (
                <span className="ml-3 text-lg font-normal text-green-600">
                  • Receitas
                </span>
              )}
              {selectedType === 'expense' && (
                <span className="ml-3 text-lg font-normal text-red-600">
                  • Despesas
                </span>
              )}
              {selectedType === 'transfer' && (
                <span className="ml-3 text-lg font-normal text-blue-600">
                  • Transferências
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">Gerencie e acompanhe todas suas movimentações financeiras</p>
          </div>
          <div className="flex items-center gap-3">
            <MonthYearPicker
              date={selectedDate}
              onDateChange={setSelectedDate}
            />

            {/* Select de Tipos - Background Branco */}
            <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Transações
                  </div>
                </SelectItem>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    Receitas
                  </div>
                </SelectItem>
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="h-4 w-4 text-red-600" />
                    Despesas
                  </div>
                </SelectItem>
                <SelectItem value="transfer">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Transferências
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setIsNewTransactionOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-muted-foreground">Balanço Mensal</p>
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar transações..."
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
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
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Mais Filtros
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Painel de Filtros - Design Compacto */}
          {showFilters && (
            <div className="px-6 py-3 border-b border-border bg-muted/30">
              <div className="flex flex-wrap items-center gap-3">
                {/* Tipo */}
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background hover:bg-accent transition-colors"
                >
                  <option value="all">Tipo: Todos</option>
                  <option value="income">Receitas</option>
                  <option value="expense">Despesas</option>
                </select>

                {/* Status */}
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background hover:bg-accent transition-colors"
                >
                  <option value="all">Status: Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="cancelled">Cancelado</option>
                </select>

                {/* Período */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                    placeholder="De"
                  />
                  <span className="text-muted-foreground">até</span>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                    placeholder="Até"
                  />
                </div>

                {/* Valor */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formatAmountDisplay(amountMinCents)}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, '')
                      const maxValue = 100000000000 // 1 bilhão em centavos
                      const numValue = parseInt(onlyNumbers) || 0
                      if (numValue <= maxValue) {
                        setAmountMinCents(onlyNumbers)
                        setFilters({ ...filters, amountMin: (numValue / 100).toString() })
                      }
                    }}
                    placeholder="R$ Min"
                    className="w-40 px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                  />
                  <span className="text-muted-foreground">-</span>
                  <input
                    type="text"
                    value={formatAmountDisplay(amountMaxCents)}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, '')
                      const maxValue = 100000000000 // 1 bilhão em centavos
                      const numValue = parseInt(onlyNumbers) || 0
                      if (numValue <= maxValue) {
                        setAmountMaxCents(onlyNumbers)
                        setFilters({ ...filters, amountMax: (numValue / 100).toString() })
                      }
                    }}
                    placeholder="R$ Max"
                    className="w-40 px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                  />
                </div>

                {/* Botão Limpar */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      type: 'all',
                      status: 'all',
                      dateFrom: '',
                      dateTo: '',
                      amountMin: '',
                      amountMax: ''
                    })
                    setAmountMinCents('')
                    setAmountMaxCents('')
                  }}
                  className="ml-auto text-xs"
                >
                  Limpar
                </Button>
              </div>
            </div>
          )}

          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  {selectedType === 'income' ? (
                    <ArrowUpRight className="h-10 w-10 text-green-600" />
                  ) : selectedType === 'expense' ? (
                    <ArrowDownLeft className="h-10 w-10 text-red-600" />
                  ) : (
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {selectedType === 'income'
                    ? 'Nenhuma receita encontrada'
                    : selectedType === 'expense'
                    ? 'Nenhuma despesa encontrada'
                    : 'Nenhuma transação encontrada'}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  {selectedType === 'income'
                    ? 'Você ainda não tem receitas registradas para este período. Adicione sua primeira receita para começar!'
                    : selectedType === 'expense'
                    ? 'Você ainda não tem despesas registradas para este período. Adicione sua primeira despesa para começar!'
                    : 'Você ainda não tem transações registradas. Adicione sua primeira transação para começar a controlar suas finanças!'}
                </p>
                <Button
                  onClick={() => setIsNewTransactionOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {selectedType === 'income'
                    ? 'Adicionar Receita'
                    : selectedType === 'expense'
                    ? 'Adicionar Despesa'
                    : 'Nova Transação'}
                </Button>
              </div>
            ) : (
              <>
                {/* Tabela de Transações - Estilo Moderno e Limpo */}
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Header da Tabela */}
                    <div className="grid grid-cols-[60px_100px_1fr_150px_150px_120px_90px] gap-4 px-4 py-3 bg-muted/10 rounded-t-lg border-b">
                      <div className="text-xs font-medium text-muted-foreground uppercase"></div>

                      {/* Data - Clicável */}
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center text-xs font-medium text-muted-foreground uppercase hover:text-foreground transition-colors group"
                      >
                        Data
                        <SortIcon column="date" />
                      </button>

                      {/* Descrição - Clicável */}
                      <button
                        onClick={() => handleSort('description')}
                        className="flex items-center text-xs font-medium text-muted-foreground uppercase hover:text-foreground transition-colors group text-left"
                      >
                        Descrição
                        <SortIcon column="description" />
                      </button>

                      {/* Categoria - Clicável */}
                      <button
                        onClick={() => handleSort('category')}
                        className="flex items-center text-xs font-medium text-muted-foreground uppercase hover:text-foreground transition-colors group"
                      >
                        Categoria
                        <SortIcon column="category" />
                      </button>

                      {/* Conta - Clicável */}
                      <button
                        onClick={() => handleSort('account')}
                        className="flex items-center text-xs font-medium text-muted-foreground uppercase hover:text-foreground transition-colors group"
                      >
                        Conta
                        <SortIcon column="account" />
                      </button>

                      {/* Valor - Clicável */}
                      <button
                        onClick={() => handleSort('amount')}
                        className="flex items-center justify-end text-xs font-medium text-muted-foreground uppercase hover:text-foreground transition-colors group"
                      >
                        Valor
                        <SortIcon column="amount" />
                      </button>

                      {/* Ações - Não clicável */}
                      <div className="text-xs font-medium text-muted-foreground uppercase text-center">Ações</div>
                    </div>

                    {/* Linhas da Tabela */}
                    <div className="divide-y divide-border">
                      {paginatedTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="grid grid-cols-[60px_100px_1fr_150px_150px_120px_90px] gap-4 px-4 py-3.5 hover:bg-muted/5 transition-colors group"
                        >
                          {/* Ícone de Situação - Discreto */}
                          <div className="flex items-center justify-center">
                            {getStatusIcon(transaction.status)}
                          </div>

                          {/* Data */}
                          <div className="flex items-center">
                            <span className="text-sm text-foreground">
                              {new Date(transaction.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Descrição - Mais destaque */}
                          <div className="flex flex-col justify-center gap-0.5">
                            <p className="font-medium text-foreground text-sm leading-tight">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.status === 'confirmed' ? 'Confirmado' : transaction.status === 'pending' ? 'Pendente' : 'Cancelado'}
                            </p>
                          </div>

                          {/* Categoria - Simples e limpa */}
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground">
                              {transaction.category}
                            </span>
                          </div>

                          {/* Conta */}
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground">
                              {transaction.account}
                            </span>
                          </div>

                          {/* Valor */}
                          <div className="flex items-center justify-end">
                            <span className={`font-semibold text-sm ${
                              transaction.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Ações - Ícones minimalistas */}
                          <div className="flex items-center justify-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                              title="Editar"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
                              title="Anexar arquivo"
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                              title="Excluir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Paginação - Alinhada à direita */}
                <div className="mt-6 flex items-center justify-end gap-6 px-2">
                  {/* Linhas por página */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Linhas por página:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                      <SelectTrigger className="w-[70px] h-8 bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Informação de página */}
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {startIndex + 1}-{endIndex} de {totalItems}
                  </div>

                  {/* Botões de navegação */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
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
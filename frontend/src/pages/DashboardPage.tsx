import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PieChart,
  Calendar,
  Target,
  Bell
} from 'lucide-react'
import { DashboardLabels } from '@/types/configuration'
import { ChartSelector, useChartTypes } from '@/components/charts/ChartSelector'
import { LoadingWrapper } from '@/components/LoadingWrapper'
import { usePageLoading } from '@/hooks/useLoading'
import { DashboardOnboarding } from '@/components/DashboardOnboarding'

export interface DashboardStats {
  id: string
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon?: string
  color?: string
}

export interface RecentTransaction {
  id: string | number
  description: string
  amount: number
  date: string
  category: string
  account: string
  type: string
  icon?: string
  categoryColor?: string
}

export interface FinancialGoal {
  id: string | number
  title: string
  target: number
  current: number
  progress: number
  category?: string
  deadline?: string
  color?: string
}

export interface SmartAlert {
  id: string | number
  type: 'warning' | 'success' | 'info' | 'error'
  title: string
  message: string
  priority?: 'low' | 'medium' | 'high'
  actionable?: boolean
  actionLabel?: string
  onAction?: () => void
}

export interface MonthlySummary {
  month: string
  income: number
  expenses: number
  balance: number
  topCategories: Array<{
    name: string
    amount: number
    icon?: string
  }>
}

export interface DashboardPageProps {
  stats?: DashboardStats[]
  transactions?: RecentTransaction[]
  goals?: FinancialGoal[]
  alerts?: SmartAlert[]
  summary?: MonthlySummary
  labels?: DashboardLabels
  currency?: string
  locale?: string
  onViewAllTransactions?: () => void
  onCreateGoal?: () => void
  onAlertAction?: (alertId: string | number) => void
  customActions?: {
    [key: string]: () => void
  }
}

export const DashboardPage = ({
  stats: externalStats,
  transactions: externalTransactions,
  goals: externalGoals,
  alerts: externalAlerts,
  summary: externalSummary,
  labels,
  currency = 'BRL',
  locale = 'pt-BR',
  onViewAllTransactions,
  onCreateGoal,
  onAlertAction,
  customActions
}: DashboardPageProps) => {
  usePageTitle('Dashboard')

  const { user } = useAuth()
  const { availableCharts, getChartByCategory } = useChartTypes()
  const { isPageLoading } = usePageLoading()

  // Default labels
  const defaultLabels: DashboardLabels = {
    welcome: 'Olá',
    totalBalance: 'Saldo Total',
    monthlyExpenses: 'Gastos do Mês',
    savings: 'Economia',
    investments: 'Investimentos',
    recentTransactions: 'Transações Recentes',
    financialGoals: 'Metas Financeiras',
    smartAlerts: 'Alertas Inteligentes',
    monthlySummary: 'Resumo Mensal'
  }

  const finalLabels = { ...defaultLabels, ...labels }

  // Default stats data
  const defaultStats: DashboardStats[] = [
    {
      id: 'balance',
      title: finalLabels.totalBalance!,
      value: "R$ 15.430,50",
      change: "+12,5%",
      trend: "up",
      icon: "💰"
    },
    {
      id: 'expenses',
      title: finalLabels.monthlyExpenses!,
      value: "R$ 3.200,00",
      change: "-8,2%",
      trend: "down",
      icon: "💳"
    },
    {
      id: 'savings',
      title: finalLabels.savings!,
      value: "R$ 1.800,00",
      change: "+15,3%",
      trend: "up",
      icon: "🏦"
    },
    {
      id: 'investments',
      title: finalLabels.investments!,
      value: "R$ 8.500,00",
      change: "+22,1%",
      trend: "up",
      icon: "📈"
    }
  ]

  // Default transactions data
  const defaultTransactions: RecentTransaction[] = [
    { id: 1, description: "Supermercado Extra", amount: -234.50, date: "2024-01-16", category: "Alimentação", account: "Conta Corrente", type: "débito", icon: "🛒" },
    { id: 2, description: "Salário - Empresa XYZ", amount: 5200.00, date: "2024-01-15", category: "Renda", account: "Conta Corrente", type: "crédito", icon: "💵" },
    { id: 3, description: "Netflix Streaming", amount: -29.90, date: "2024-01-14", category: "Entretenimento", account: "Cartão Visa", type: "cartão", icon: "🎬" },
    { id: 4, description: "Uber - Corrida Centro", amount: -18.50, date: "2024-01-14", category: "Transporte", account: "Cartão Mastercard", type: "cartão", icon: "🚗" },
    { id: 5, description: "Farmácia São João", amount: -85.30, date: "2024-01-13", category: "Saúde", account: "Conta Corrente", type: "débito", icon: "💊" },
    { id: 6, description: "Freelance - Projeto ABC", amount: 1200.00, date: "2024-01-12", category: "Renda Extra", account: "Conta Poupança", type: "pix", icon: "💻" },
    { id: 7, description: "Mercado Livre - Livros", amount: -67.90, date: "2024-01-11", category: "Educação", account: "Cartão Visa", type: "cartão", icon: "📚" },
    { id: 8, description: "Academia FitLife", amount: -89.90, date: "2024-01-10", category: "Saúde", account: "Conta Corrente", type: "débito", icon: "🏋️" }
  ]

  // Default goals data
  const defaultGoals: FinancialGoal[] = [
    { id: 1, title: "Viagem para Europa", target: 15000, current: 8500, progress: 57, category: "Viagem", color: "#3b82f6" },
    { id: 2, title: "Reserva de Emergência", target: 30000, current: 22500, progress: 75, category: "Emergência", color: "#ef4444" },
    { id: 3, title: "Carro Novo", target: 50000, current: 12000, progress: 24, category: "Veículo", color: "#8b5cf6" }
  ]

  // Default alerts data
  const defaultAlerts: SmartAlert[] = [
    {
      id: 1,
      type: 'warning',
      title: 'Gasto Alto Detectado',
      message: 'Você gastou 20% mais em alimentação este mês',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'success',
      title: 'Meta Alcançada',
      message: 'Parabéns! Você atingiu 75% da meta de economia',
      priority: 'high'
    },
    {
      id: 3,
      type: 'info',
      title: 'Oportunidade',
      message: 'Considere investir sua reserva de emergência',
      priority: 'low'
    },
    {
      id: 4,
      type: 'warning',
      title: 'Vencimento Próximo',
      message: 'Cartão Visa vence em 3 dias - R$ 1.234,56',
      priority: 'high',
      actionable: true,
      actionLabel: 'Pagar Agora'
    }
  ]

  // Default monthly summary
  const defaultSummary: MonthlySummary = {
    month: 'Janeiro 2024',
    income: 6400.00,
    expenses: 4200.00,
    balance: 2200.00,
    topCategories: [
      { name: 'Alimentação', amount: 1234.56, icon: '🍽️' },
      { name: 'Transporte', amount: 567.89, icon: '🚗' },
      { name: 'Entretenimento', amount: 234.50, icon: '🎯' }
    ]
  }

  // Sample chart data for financial analysis
  const chartData = [
    { name: 'Jan', value: 4200, income: 6400, expenses: 4200, trend: 4200, change: 0 },
    { name: 'Fev', value: 3800, income: 5800, expenses: 3800, trend: 3800, change: -9.5 },
    { name: 'Mar', value: 4500, income: 6200, expenses: 4500, trend: 4500, change: 18.4 },
    { name: 'Abr', value: 3200, income: 5500, expenses: 3200, trend: 3200, change: -28.9 },
    { name: 'Mai', value: 4800, income: 6800, expenses: 4800, trend: 4800, change: 50.0 },
    { name: 'Jun', value: 4100, income: 6100, expenses: 4100, trend: 4100, change: -14.6 }
  ]

  const expensesCategoryData = [
    { name: 'Alimentação', value: 1234.56, color: '#ef4444' },
    { name: 'Transporte', value: 567.89, color: '#3b82f6' },
    { name: 'Entretenimento', value: 234.50, color: '#8b5cf6' },
    { name: 'Saúde', value: 189.30, color: '#10b981' },
    { name: 'Educação', value: 156.90, color: '#f59e0b' },
    { name: 'Outros', value: 298.75, color: '#6b7280' }
  ]

  // Use external data or fallback to defaults
  const finalStats = externalStats && externalStats.length > 0 ? externalStats : defaultStats
  const finalTransactions = externalTransactions && externalTransactions.length > 0 ? externalTransactions : defaultTransactions
  const finalGoals = externalGoals && externalGoals.length > 0 ? externalGoals : defaultGoals
  const finalAlerts = externalAlerts && externalAlerts.length > 0 ? externalAlerts : defaultAlerts
  const finalSummary = externalSummary || defaultSummary

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount)
  }

  const getStatIcon = (stat: DashboardStats) => {
    if (stat.icon) return stat.icon

    // Fallback icons based on stat ID
    const iconMap: Record<string, React.ReactNode> = {
      'balance': <DollarSign className="h-6 w-6" />,
      'expenses': <CreditCard className="h-6 w-6" />,
      'savings': <PieChart className="h-6 w-6" />,
      'investments': <TrendingUp className="h-6 w-6" />
    }

    return iconMap[stat.id] || <DollarSign className="h-6 w-6" />
  }

  const getCategoryColor = (transaction: RecentTransaction) => {
    if (transaction.categoryColor) {
      return transaction.categoryColor
    }

    // Default category colors
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
    return categoryColors[transaction.category] || 'bg-gray-50 text-gray-600 dark:bg-gray-200/20 dark:text-gray-200'
  }

  const getTransactionIcon = (transaction: RecentTransaction) => {
    if (transaction.icon) return transaction.icon

    // Fallback icons based on type
    if (transaction.type === 'cartão') return '💳'
    if (transaction.type === 'pix') return '🔄'
    if (transaction.amount > 0) return '↗️'
    return '↙️'
  }

  const getAlertStyle = (alert: SmartAlert) => {
    const alertStyles = {
      warning: 'bg-warning-background border border-warning/20 text-warning',
      success: 'bg-success-background border border-success/20 text-success',
      info: 'bg-info-background border border-info/20 text-info',
      error: 'bg-destructive-background border border-destructive/20 text-destructive'
    }
    return alertStyles[alert.type] || alertStyles.info
  }

  const handleAlertAction = (alert: SmartAlert) => {
    if (alert.onAction) {
      alert.onAction()
    } else if (onAlertAction) {
      onAlertAction(alert.id)
    }
  }

  const handleViewAllTransactions = () => {
    if (onViewAllTransactions) {
      onViewAllTransactions()
    } else if (customActions?.viewAllTransactions) {
      customActions.viewAllTransactions()
    }
  }

  const handleCreateGoal = () => {
    if (onCreateGoal) {
      onCreateGoal()
    } else if (customActions?.createGoal) {
      customActions.createGoal()
    }
  }

  return (
    <LoadingWrapper isLoading={isPageLoading} skeleton="dashboard">
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-3xl font-bold text-foreground">
              {finalLabels.welcome}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Aqui está um resumo das suas finanças hoje, {new Date().toLocaleDateString(locale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slideIn" data-onboarding="stats-cards">
            {finalStats.map((stat, index) => (
              <Card
                key={stat.id}
                className="hover:shadow-lg transition-shadow animate-scaleIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                      </div>
                      <div className={`flex items-center mt-2 text-sm ${
                        stat.trend === 'up' ? 'text-success' : 'text-destructive'
                      }`}>
                        {stat.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {stat.change} vs mês anterior
                      </div>
                    </div>
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: stat.color ? `${stat.color}20` : '#dbeafe',
                        color: stat.color || '#3b82f6'
                      }}
                    >
                      {typeof stat.icon === 'string' ? (
                        <span className="text-2xl">{stat.icon}</span>
                      ) : (
                        <div className="text-inherit">
                          {getStatIcon(stat)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-8 animate-fadeIn" style={{ animationDelay: '400ms' }} data-onboarding="charts">
            <LoadingWrapper isLoading={false} skeleton="chart">
              <ChartSelector
                title="Análise Financeira"
                description="Visualize seus dados financeiros de diferentes formas"
                chartTypes={availableCharts}
                defaultChartType="bar"
                data={chartData}
                className="w-full"
              />
            </LoadingWrapper>
          </div>

          <div className="mb-8 animate-fadeIn" style={{ animationDelay: '500ms' }}>
            <LoadingWrapper isLoading={false} skeleton="chart">
              <ChartSelector
                title="Distribuição de Gastos por Categoria"
                description="Veja como seus gastos estão distribuídos"
                chartTypes={getChartByCategory('expenses')}
                defaultChartType="pie"
                data={expensesCategoryData}
                className="w-full"
              />
            </LoadingWrapper>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn" style={{ animationDelay: '600ms' }}>
            <div className="lg:col-span-2">
              <LoadingWrapper isLoading={false} skeleton="transactions">
                <Card data-onboarding="transactions">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {finalLabels.recentTransactions}
                    </CardTitle>
                    <CardDescription>
                      Suas últimas movimentações financeiras
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {finalTransactions.slice(0, 6).map((transaction, index) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors animate-slideIn"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(transaction)}`}>
                              <span className="text-lg">{getTransactionIcon(transaction)}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{transaction.description}</p>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>{transaction.category}</span>
                                <span>•</span>
                                <span>{transaction.account}</span>
                                <span>•</span>
                                <span>{new Date(transaction.date).toLocaleDateString(locale)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-lg ${
                              transaction.amount > 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {transaction.type}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <Button variant="outline" className="w-full" onClick={handleViewAllTransactions}>
                        Ver Todas as Transações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </LoadingWrapper>
            </div>

            <div className="space-y-6">
              <LoadingWrapper isLoading={false} skeleton="card">
                <Card data-onboarding="goals">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      {finalLabels.financialGoals}
                    </CardTitle>
                    <CardDescription>
                      Acompanhe seu progresso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {finalGoals.map((goal, index) => (
                        <div
                          key={goal.id}
                          className="animate-slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-foreground">{goal.title}</span>
                            <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${goal.progress}%`,
                                background: goal.color ? `linear-gradient(to right, ${goal.color}88, ${goal.color})` : 'linear-gradient(to right, #3b82f6, #8b5cf6)'
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formatCurrency(goal.current)}</span>
                            <span>{formatCurrency(goal.target)}</span>
                          </div>
                          {goal.deadline && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Prazo: {new Date(goal.deadline).toLocaleDateString(locale)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <Button variant="outline" className="w-full" onClick={handleCreateGoal}>
                        <Target className="h-4 w-4 mr-2" />
                        Criar Nova Meta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </LoadingWrapper>

              <LoadingWrapper isLoading={false} skeleton="card">
                <Card data-onboarding="alerts">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      {finalLabels.smartAlerts}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {finalAlerts.map((alert, index) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg ${getAlertStyle(alert)} animate-slideIn`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{alert.title}</p>
                              <p className="text-sm">{alert.message}</p>
                            </div>
                            {alert.priority && (
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                alert.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-200/20 dark:text-red-200' :
                                alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200/20 dark:text-yellow-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-200/20 dark:text-gray-200'
                              }`}>
                                {alert.priority}
                              </span>
                            )}
                          </div>
                          {alert.actionable && alert.actionLabel && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAlertAction(alert)}
                                className="text-xs"
                              >
                                {alert.actionLabel}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </LoadingWrapper>

              <LoadingWrapper isLoading={false} skeleton="card">
                <Card data-onboarding="summary">
                  <CardHeader>
                    <CardTitle>{finalLabels.monthlySummary}</CardTitle>
                    <CardDescription>
                      {finalSummary.month}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Receitas</span>
                        <span className="font-semibold text-success">{formatCurrency(finalSummary.income)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Despesas</span>
                        <span className="font-semibold text-destructive">{formatCurrency(finalSummary.expenses)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">Saldo</span>
                          <span className={`font-bold ${finalSummary.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(finalSummary.balance)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Top Categorias</h4>
                        <div className="space-y-2">
                          {finalSummary.topCategories.map((category, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm animate-slideIn"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <span className="text-muted-foreground">
                                {category.icon && <span className="mr-1">{category.icon}</span>}
                                {category.name}
                              </span>
                              <span className="font-medium">{formatCurrency(category.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LoadingWrapper>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Tutorial */}
      <DashboardOnboarding autoStart={true} />
    </LoadingWrapper>
  )
}

/*
EXEMPLO DE USO AVANÇADO COM MICROSERVIÇOS:

// 1. Uso básico (mantém compatibilidade)
<DashboardPage />

// 2. Uso com dados vindos do microserviço
const statsFromAPI: DashboardStats[] = [
  {
    id: 'balance',
    title: 'Saldo Total',
    value: 'R$ 25.430,50',
    change: '+18,2%',
    trend: 'up',
    icon: '💰',
    color: '#10b981'
  },
  // ... mais estatísticas
]

const transactionsFromAPI: RecentTransaction[] = [
  {
    id: 'tx_001',
    description: 'Pagamento Freelance',
    amount: 2500.00,
    date: '2024-01-20',
    category: 'Renda',
    account: 'Conta Digital',
    type: 'pix',
    icon: '💻',
    categoryColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-200/20 dark:text-emerald-200'
  },
  // ... mais transações
]

<DashboardPage
  stats={statsFromAPI}
  transactions={transactionsFromAPI}
  goals={goalsFromAPI}
  alerts={alertsFromAPI}
  summary={summaryFromAPI}
  labels={{
    welcome: 'Bem-vindo',
    totalBalance: 'Patrimônio Total',
    recentTransactions: 'Últimas Movimentações',
    financialGoals: 'Objetivos Financeiros'
  }}
  currency="BRL"
  locale="pt-BR"
  onViewAllTransactions={() => navigate('/transacoes')}
  onCreateGoal={() => setShowGoalModal(true)}
  onAlertAction={(alertId) => {
    console.log('Action for alert:', alertId)
    // Lógica personalizada de ação
  }}
/>

// 3. Configuração empresarial com moeda diferente
<DashboardPage
  stats={[
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: '$45,230.00',
      change: '+12.5%',
      trend: 'up',
      icon: '📊',
      color: '#3b82f6'
    },
    {
      id: 'expenses',
      title: 'Operating Costs',
      value: '$23,100.00',
      change: '-5.2%',
      trend: 'down',
      icon: '💸',
      color: '#ef4444'
    }
  ]}
  transactions={enterpriseTransactions}
  goals={businessGoals}
  alerts={businessAlerts}
  labels={{
    welcome: 'Welcome',
    totalBalance: 'Total Assets',
    monthlyExpenses: 'Monthly Costs',
    savings: 'Profit',
    investments: 'Investments',
    recentTransactions: 'Recent Transactions',
    financialGoals: 'Business Goals',
    smartAlerts: 'Business Alerts',
    monthlySummary: 'Monthly Report'
  }}
  currency="USD"
  locale="en-US"
  customActions={{
    viewAllTransactions: () => router.push('/enterprise/transactions'),
    createGoal: () => openBusinessGoalModal(),
    exportData: () => triggerDataExport()
  }}
/>

// 4. Dashboard personalizado com ações customizadas
<DashboardPage
  stats={customStats}
  transactions={recentCustomTransactions}
  goals={personalGoals}
  alerts={[
    {
      id: 'custom_alert_1',
      type: 'info',
      title: 'Análise Personalizada',
      message: 'Sua carteira está bem balanceada este mês',
      priority: 'low',
      actionable: true,
      actionLabel: 'Ver Detalhes',
      onAction: () => showDetailedAnalysis()
    }
  ]}
  summary={{
    month: 'Fevereiro 2024',
    income: 8500.00,
    expenses: 5200.00,
    balance: 3300.00,
    topCategories: [
      { name: 'Consultoria', amount: 4500.00, icon: '💼' },
      { name: 'Investimentos', amount: 1200.00, icon: '📈' },
      { name: 'Cursos Online', amount: 890.00, icon: '🎓' }
    ]
  }}
  onAlertAction={(alertId) => {
    // Ação customizada por alert
    switch(alertId) {
      case 'payment_due':
        redirectToPayment()
        break
      case 'goal_achieved':
        showCelebration()
        break
      default:
        showGenericAction(alertId)
    }
  }}
/>

// 5. Dashboard minimalista
<DashboardPage
  stats={[
    {
      id: 'balance',
      title: 'Saldo',
      value: 'R$ 5.430,00',
      change: '+2,1%',
      trend: 'up',
      icon: '💰'
    }
  ]}
  transactions={[]}  // Sem transações
  goals={[]}         // Sem metas
  alerts={[]}        // Sem alertas
  summary={{
    month: 'Este Mês',
    income: 3200.00,
    expenses: 1800.00,
    balance: 1400.00,
    topCategories: []
  }}
  labels={{
    welcome: 'Olá',
    totalBalance: 'Meu Saldo'
  }}
/>
*/
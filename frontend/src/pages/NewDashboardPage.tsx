import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardWithRealData } from '@/components/DashboardWithRealData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  ChevronRight,
  CalendarDays,
  PiggyBank
} from 'lucide-react'
import { MonthYearPicker } from '@/components/MonthYearPicker'
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart as RechartsBar,
  Bar,
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export const NewDashboardPage = () => {
  usePageTitle('Dashboard')
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <DashboardWithRealData selectedDate={selectedDate}>
      {(dashboardData) => (
        <DashboardContent
          user={user}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dashboardData={dashboardData}
        />
      )}
    </DashboardWithRealData>
  )
}

// Componente interno com o conteúdo do dashboard
const DashboardContent = ({ user, selectedDate, setSelectedDate, dashboardData: apiData }: any) => {
  const navigate = useNavigate()

  // Usar dados da API ou fallback se não existirem
  const dashboardData = apiData || {
    balance: 0,
    income: 0,
    expenses: 0,
    creditCards: 0,
    monthlyBalance: {
      income: 0,
      expenses: 2581.45,
      balance: -2581.45
    },
    expensesByCategory: [
      { name: 'Alimentação', value: 850.45, color: '#ef4444', percentage: 32.9 },
      { name: 'Transporte', value: 567.89, color: '#3b82f6', percentage: 22.0 },
      { name: 'Lazer', value: 445.50, color: '#8b5cf6', percentage: 17.3 },
      { name: 'Moradia', value: 400.00, color: '#10b981', percentage: 15.5 },
      { name: 'Saúde', value: 234.61, color: '#f59e0b', percentage: 9.1 },
      { name: 'Outros', value: 83.00, color: '#6b7280', percentage: 3.2 }
    ],
    spendingFrequency: [
      { name: '25 set', value: 120.50 },
      { name: '26 set', value: 85.30 },
      { name: '27 set', value: 145.20 },
      { name: '28 set', value: 67.80 },
      { name: '29 set', value: 0 },
      { name: '30 set', value: 234.50 },
      { name: '01 out', value: 156.90 }
    ],
    incomeByCategory: [],
    last6MonthsBalance: [
      { name: '5/2025', value: -1200 },
      { name: '6/2025', value: 800 },
      { name: '7/2025', value: -500 },
      { name: '8/2025', value: 1500 },
      { name: '9/2025', value: -800 },
      { name: '10/2025', value: -2581.45 }
    ],
    creditCardsList: [
      {
        id: 1,
        name: 'Cartao Inter',
        status: 'overdue',
        amount: 153.01,
        dueDate: '2025-09-15',
        limit: 969.96,
        used: 153.01,
        percentage: 25.82,
        isPaid: false
      },
      {
        id: 2,
        name: 'Pao de Acucar',
        status: 'open',
        amount: 633.12,
        dueDate: '2025-10-02',
        limit: 984.59,
        used: 633.12,
        percentage: 80.78,
        isPaid: false
      },
      {
        id: 3,
        name: 'Personallite Black',
        status: 'paid',
        amount: 1987.73,
        limit: 53725.00,
        used: 1987.73,
        percentage: 4.28,
        isPaid: true
      },
      {
        id: 4,
        name: 'Latam Black',
        status: 'paid',
        amount: 2182.76,
        limit: 14903.90,
        used: 2182.76,
        percentage: 20.59,
        isPaid: true
      }
    ],
    monthlySavings: 0,
    savingsPercentage: 0
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Months array for date formatting
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-primary font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com Seletor de Mês/Ano */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Olá, {user?.name?.split(' ')[0]}! Veja seu resumo financeiro
            </p>
          </div>
          <MonthYearPicker
            date={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Saldo Atual */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/contas')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saldo atual</p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {formatCurrency(dashboardData.balance)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receitas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receitas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {formatCurrency(dashboardData.income)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <ArrowUpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Despesas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                    {formatCurrency(dashboardData.expenses)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cartão de Crédito */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cartão de crédito</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {formatCurrency(dashboardData.creditCards)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Título Seção */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground">Meu Desempenho</h2>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Despesas por Categoria */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Despesas por categoria</CardTitle>
                <CardDescription className="text-lg font-semibold text-foreground mt-1">
                  {formatCurrency(dashboardData.expenses)}
                  <span className="text-sm text-muted-foreground ml-2">Total</span>
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                VER MAIS <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPie>
                  <Pie
                    data={dashboardData.expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {dashboardData.expensesByCategory.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-muted-foreground">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
                      <span className="text-xs text-muted-foreground">{category.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Frequência de Gastos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Frequência de gastos</CardTitle>
                <CardDescription>Últimos 7 dias</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                VER MAIS <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <RechartsBar data={dashboardData.spendingFrequency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                </RechartsBar>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Balanço Mensal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Balanço mensal</CardTitle>
              <Button variant="ghost" size="sm">
                VER MAIS <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Receitas</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(dashboardData.monthlyBalance.income)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Despesas</span>
                  <span className="text-lg font-semibold text-red-600">
                    {formatCurrency(dashboardData.monthlyBalance.expenses)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Balanço</span>
                    <span className={`text-xl font-bold ${
                      dashboardData.monthlyBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(dashboardData.monthlyBalance.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Planejamento Mensal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Planejamento mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-muted-foreground mb-2">
                  Opa! Você ainda não possui um planejamento definido para este mês.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Melhore seu controle financeiro agora!
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  DEFINIR MEU PLANEJAMENTO
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Receitas por Categoria */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Receitas por categoria</CardTitle>
              <Button variant="ghost" size="sm">
                VER MAIS <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-muted-foreground mb-2">
                  Opa! Você ainda não possui receitas este mês.
                </p>
                <p className="text-sm text-muted-foreground">
                  Adicione seus ganhos no mês atual através do botão (+), para ver seus gráficos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Balanço 6 meses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Balanço (Receitas - Despesas) nos últimos 6 meses</CardTitle>
              <Button variant="ghost" size="sm">
                VER MAIS <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RechartsLine data={dashboardData.last6MonthsBalance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </RechartsLine>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cartões de Crédito */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cartões de crédito</CardTitle>
            <Button variant="ghost" size="sm">
              VER MAIS <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="open" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="open">Faturas abertas</TabsTrigger>
                <TabsTrigger value="closed">Faturas fechadas</TabsTrigger>
              </TabsList>

              <TabsContent value="open">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.creditCardsList
                    .filter((card) => !card.isPaid)
                    .map((card) => (
                      <Card
                        key={card.id}
                        className={`border-l-4 ${
                          card.status === 'overdue'
                            ? 'border-l-red-500'
                            : 'border-l-yellow-500'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-foreground">{card.name}</h3>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  card.status === 'overdue'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                }`}
                              >
                                {card.status === 'overdue' ? 'Fatura vencida' : `Vence em ${new Date(card.dueDate).getDate()} de ${months[new Date(card.dueDate).getMonth()].toLowerCase()} de ${new Date(card.dueDate).getFullYear()}`}
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {formatCurrency(card.amount)}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Limite usado</span>
                                <span className="font-medium">{card.percentage.toFixed(2)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    card.percentage > 80
                                      ? 'bg-red-500'
                                      : card.percentage > 50
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${card.percentage}%` }}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Limite Disponível {formatCurrency(card.limit - card.used)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="closed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.creditCardsList
                    .filter((card) => card.isPaid)
                    .map((card) => (
                      <Card key={card.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-foreground">{card.name}</h3>
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                Fatura paga
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {formatCurrency(card.amount)}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Limite usado</span>
                                <span className="font-medium">{card.percentage.toFixed(2)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-green-500"
                                  style={{ width: `${card.percentage}%` }}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Limite Disponível {formatCurrency(card.limit - card.used)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">TOTAL</span>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(
                    dashboardData.creditCardsList.reduce((sum, card) => sum + card.amount, 0)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Economia Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Economia mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl font-bold text-foreground mb-4">
                {dashboardData.savingsPercentage}%
              </div>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <PiggyBank className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-xl font-semibold text-foreground mb-2">Ooops!</p>
              <p className="text-muted-foreground mb-2">
                Você não teve economias este mês.
              </p>
              <p className="text-sm text-muted-foreground">
                Mas nós não vamos desistir, né? Mês que vem vai ser melhor!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

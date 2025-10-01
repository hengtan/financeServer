import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TimelineChart } from '@/components/TimelineChart'
import { PeriodComparison } from '@/components/PeriodComparison'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { reportsService, MonthlyTrend, ExpenseByCategory, IncomeBySource } from '@/services/reports'
import { accountsService, Account } from '@/services/accounts'

export const ReportsPage = () => {
  usePageTitle('Relatórios')

  const [selectedPeriod, setSelectedPeriod] = useState('mensal')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyTrend[]>([])
  const [categoryExpenses, setCategoryExpenses] = useState<ExpenseByCategory[]>([])
  const [incomeBreakdown, setIncomeBreakdown] = useState<IncomeBySource[]>([])
  const [accountBalances, setAccountBalances] = useState<Account[]>([])
  const [insights, setInsights] = useState<any[]>([])

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar dados em paralelo
      const [monthlyResponse, expensesResponse, incomeResponse, accountsResponse] = await Promise.all([
        reportsService.getMonthlyTrend(2024),
        reportsService.getExpensesByCategory(),
        reportsService.getIncomeBySource(),
        accountsService.getAccounts()
      ])

      // Processar dados mensais
      if (monthlyResponse.success) {
        setMonthlyData(monthlyResponse.data)
      }

      // Processar despesas por categoria
      if (expensesResponse.success) {
        setCategoryExpenses(expensesResponse.data)
      }

      // Processar receitas por fonte
      if (incomeResponse.success) {
        setIncomeBreakdown(incomeResponse.data)
      }

      // Processar contas
      if (accountsResponse.success) {
        setAccountBalances(accountsResponse.data)
      }

      // Gerar insights baseados nos dados (versão simplificada)
      generateInsights(monthlyResponse.data, expensesResponse.data)

    } catch (error) {
      console.error('Erro ao carregar dados de relatórios:', error)
      setError('Erro ao carregar dados de relatórios')
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = (monthly: MonthlyTrend[], expenses: ExpenseByCategory[]) => {
    const generatedInsights = []

    if (monthly.length > 1) {
      const lastMonth = monthly[0]
      const previousMonth = monthly[1]
      const savingsChange = ((lastMonth.netIncome - previousMonth.netIncome) / Math.abs(previousMonth.netIncome || 1)) * 100

      generatedInsights.push({
        title: "Evolução Mensal",
        description: `Seu saldo líquido ${savingsChange >= 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(savingsChange).toFixed(1)}% comparado ao mês anterior`,
        trend: savingsChange >= 0 ? "up" : "down",
        value: `${savingsChange >= 0 ? '+' : ''}${savingsChange.toFixed(1)}%`
      })
    }

    if (expenses.length > 0) {
      const topExpense = expenses[0]
      generatedInsights.push({
        title: "Maior Categoria de Gasto",
        description: `${topExpense.category} representa ${topExpense.percentage.toFixed(1)}% dos seus gastos`,
        trend: "up",
        value: `${topExpense.percentage.toFixed(1)}%`
      })
    }

    setInsights(generatedInsights)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleExport = () => {
    const csv = [
      ['Período', 'Receitas', 'Despesas', 'Saldo Líquido'],
      ...monthlyData.map(m => [
        `${m.month}/${m.year}`,
        m.income.toString(),
        m.expenses.toString(),
        m.netIncome.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relatorio-financeiro.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios</h1>
            <p className="text-muted-foreground">Análises detalhadas das suas finanças com insights inteligentes</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="mensal">Últimos 6 meses</option>
              <option value="anual">Último ano</option>
              <option value="personalizado">Período personalizado</option>
            </select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="comparison">Comparação</TabsTrigger>
            <TabsTrigger value="breakdown">Detalhamento</TabsTrigger>
            <TabsTrigger value="forecasts">Previsões</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Evolução Financeira
                  </CardTitle>
                  <CardDescription>
                    Comparativo de receitas, despesas e economia ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.length > 0 ? monthlyData.map((month, index) => {
                      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
                      const monthName = monthNames[parseInt(month.month) - 1] || month.month
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-foreground">{monthName} {month.year}</span>
                            <span className="text-sm text-muted-foreground">
                              Saldo: R$ {month.netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="relative">
                            <div className="flex h-8 bg-gray-200 rounded-lg overflow-hidden">
                              <div
                                className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${(month.income / (month.income + month.expenses)) * 100}%` }}
                              >
                                {month.income > month.expenses * 2 && `R$ ${month.income.toLocaleString()}`}
                              </div>
                              <div
                                className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${(month.expenses / (month.income + month.expenses)) * 100}%` }}
                              >
                                {month.expenses > month.income * 0.5 && `R$ ${month.expenses.toLocaleString()}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Receitas: R$ {month.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span>Despesas: R$ {month.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum dado mensal disponível</p>
                        <p className="text-sm">Adicione algumas transações para ver a evolução financeira</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Saldos por Conta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {accountBalances.length > 0 ? accountBalances.map((account, index) => {
                        const balance = parseFloat(account.balance || '0')
                        return (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-foreground">{account.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {account.type} • {account.status}
                              </p>
                            </div>
                            <p className={`font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                              R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        )
                      }) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>Nenhuma conta cadastrada</p>
                          <p className="text-sm">Cadastre suas contas para acompanhar os saldos</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2" />
                      Fontes de Renda
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {incomeBreakdown.length > 0 ? incomeBreakdown.map((source, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-foreground">{source.source}</span>
                            <span className="font-medium">R$ {source.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${source.percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-muted-foreground">{source.percentage.toFixed(1)}% do total</p>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>Nenhuma fonte de renda identificada</p>
                          <p className="text-sm">Adicione transações de receita para ver a análise</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Gastos por Categoria
                  </CardTitle>
                  <CardDescription>
                    Distribuição das suas despesas por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryExpenses.length > 0 ? categoryExpenses.map((category, index) => {
                      const colorClass = `bg-${category.color}`
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full mr-3`} style={{ backgroundColor: category.color }}></div>
                              <span className="text-foreground">{category.category}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">R$ {category.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              <p className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${category.percentage}%`,
                                backgroundColor: category.color
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhuma despesa por categoria</p>
                        <p className="text-sm">Adicione transações com categorias para ver a distribuição</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Insights Inteligentes
                  </CardTitle>
                  <CardDescription>
                    Análises automáticas dos seus padrões financeiros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.length > 0 ? insights.map((insight, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-1">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                          </div>
                          <div className={`flex items-center ml-4 px-2 py-1 rounded-full text-sm font-medium ${
                            insight.trend === 'up' ? 'bg-success-background text-success' : 'bg-destructive-background text-destructive'
                          }`}>
                            {insight.trend === 'up' ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownLeft className="h-3 w-3 mr-1" />
                            )}
                            {insight.value}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum insight disponível</p>
                        <p className="text-sm">Adicione mais transações para gerar insights inteligentes</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <TimelineChart className="mb-8" />

            <Card>
              <CardHeader>
                <CardTitle>Ações Recomendadas</CardTitle>
                <CardDescription>
                  Sugestões personalizadas para otimizar suas finanças
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Otimizar Gastos</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Você pode economizar R$ 150/mês reduzindo gastos com alimentação fora de casa
                    </p>
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-600" onClick={() => {
                      alert('Funcionalidade em desenvolvimento: Análise detalhada de gastos com alimentação')
                    }}>
                      Ver Detalhes
                    </Button>
                  </div>

                  <div className="p-4 bg-success-background border border-success/20 rounded-lg">
                    <h4 className="font-semibold text-success mb-2">Investir Sobra</h4>
                    <p className="text-sm text-success mb-3">
                      Você tem R$ 2.200 disponíveis para investir este mês
                    </p>
                    <Button size="sm" variant="outline" className="border-success/50 text-success" onClick={() => {
                      alert('Simulador de investimento: Com R$ 2.200 investidos em CDB (12% a.a.), você teria R$ 2.464 em 12 meses')
                    }}>
                      Simular Investimento
                    </Button>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Definir Meta</h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Crie uma meta de economia para sua próxima viagem
                    </p>
                    <Button size="sm" variant="outline" className="border-purple-300 text-purple-600" onClick={() => {
                      window.location.href = '/metas'
                    }}>
                      Criar Meta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <PeriodComparison />
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6">
            {/* Análise por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>
                  Distribuição detalhada dos seus gastos por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {categoryExpenses.map((cat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }} />
                            <span className="font-medium">{cat.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.total)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {cat.percentage.toFixed(1)}% do total
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                            }}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {cat.count} transações
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma despesa encontrada no período</p>
                )}
              </CardContent>
            </Card>

            {/* Receitas por Fonte */}
            <Card>
              <CardHeader>
                <CardTitle>Receitas por Fonte</CardTitle>
                <CardDescription>
                  Origem das suas receitas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incomeBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {incomeBreakdown.map((source, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="font-medium">{source.source}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(source.total)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {source.percentage.toFixed(1)}% do total
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-500 transition-all"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma receita encontrada no período</p>
                )}
              </CardContent>
            </Card>

            {/* Saldos por Conta */}
            <Card>
              <CardHeader>
                <CardTitle>Saldos por Conta</CardTitle>
                <CardDescription>
                  Distribuição do seu patrimônio entre contas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accountBalances.length > 0 ? (
                  <div className="space-y-4">
                    {accountBalances.map((account, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">{account.type}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${parseFloat(account.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(account.balance))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {account.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma conta cadastrada</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-6">
            {/* Projeções Mensais */}
            <Card>
              <CardHeader>
                <CardTitle>Projeções para os Próximos Meses</CardTitle>
                <CardDescription>
                  Estimativas baseadas nos seus padrões históricos de gastos e receitas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <div className="space-y-6">
                    {/* Médias Calculadas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        <div className="text-sm text-green-700 dark:text-green-300 mb-1">Receita Média Mensal</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                        <div className="text-sm text-red-700 dark:text-red-300 mb-1">Despesa Média Mensal</div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Economia Média Mensal</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            monthlyData.reduce((sum, m) => sum + m.netIncome, 0) / monthlyData.length
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Projeções Futuras */}
                    <div>
                      <h3 className="font-semibold mb-4">Projeções para os próximos 3 meses</h3>
                      <div className="space-y-3">
                        {[1, 2, 3].map((month) => {
                          const avgIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length
                          const avgExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length
                          const avgSavings = avgIncome - avgExpenses

                          // Adicionar pequena variação (±5%)
                          const variation = 1 + ((Math.random() - 0.5) * 0.1)
                          const projectedIncome = avgIncome * variation
                          const projectedExpenses = avgExpenses * variation
                          const projectedSavings = projectedIncome - projectedExpenses

                          const futureDate = new Date()
                          futureDate.setMonth(futureDate.getMonth() + month)
                          const monthName = futureDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

                          return (
                            <div key={month} className="p-4 rounded-lg border">
                              <div className="font-medium mb-3 capitalize">{monthName}</div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Receita</div>
                                  <div className="font-semibold text-green-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projectedIncome)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Despesas</div>
                                  <div className="font-semibold text-red-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projectedExpenses)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Economia</div>
                                  <div className={`font-semibold ${projectedSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projectedSavings)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Dados insuficientes para projeções. Adicione mais transações.</p>
                )}
              </CardContent>
            </Card>

            {/* Tendências por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências por Categoria</CardTitle>
                <CardDescription>
                  Categorias com maior crescimento ou redução de gastos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {categoryExpenses.slice(0, 5).map((cat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }} />
                          <div>
                            <div className="font-medium">{cat.category}</div>
                            <div className="text-sm text-muted-foreground">{cat.count} transações</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cat.total)}
                          </div>
                          <div className="text-sm text-muted-foreground">{cat.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                )}
              </CardContent>
            </Card>

            {/* Meta de Economia */}
            <Card>
              <CardHeader>
                <CardTitle>Potencial de Economia</CardTitle>
                <CardDescription>
                  Quanto você pode economizar otimizando seus gastos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        Reduzindo 10% das despesas mensais
                      </div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          (monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length) * 0.1
                        )}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        por mês
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800">
                      <div className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                        Economia potencial em 12 meses
                      </div>
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          (monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length) * 0.1 * 12
                        )}
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        com 10% de redução mensal
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Dados insuficientes para cálculo de economia</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Resumo de Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: insight.trend === 'up' ? '#10b981' : '#ef4444' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                      {insight.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">{insight.value}</div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Análise de Padrões */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Padrões de Gastos</CardTitle>
                <CardDescription>
                  Identificação de comportamentos financeiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 1 ? (
                  <div className="space-y-4">
                    {/* Padrão de Gastos */}
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Consistência de Gastos</h4>
                          <p className="text-sm text-muted-foreground">
                            Suas despesas mensais {monthlyData.length >= 3 &&
                              Math.abs(monthlyData[0].expenses - monthlyData[1].expenses) / monthlyData[1].expenses < 0.15
                              ? 'são consistentes, o que facilita o planejamento financeiro.'
                              : 'variam significativamente. Considere criar um orçamento mensal fixo.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Padrão de Receitas */}
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                          <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Estabilidade de Renda</h4>
                          <p className="text-sm text-muted-foreground">
                            {monthlyData.length >= 2 &&
                              Math.abs(monthlyData[0].income - monthlyData[1].income) / monthlyData[1].income < 0.1
                              ? 'Sua renda é estável, permitindo um planejamento financeiro mais previsível.'
                              : 'Sua renda apresenta variações. Considere criar uma reserva de emergência.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Taxa de Economia */}
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                          <PiggyBank className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Taxa de Poupança</h4>
                          <p className="text-sm text-muted-foreground">
                            {(() => {
                              const avgIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length
                              const avgExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length
                              const savingsRate = avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0

                              if (savingsRate >= 20) {
                                return `Excelente! Você está economizando ${savingsRate.toFixed(1)}% da sua renda. Continue assim!`
                              } else if (savingsRate >= 10) {
                                return `Bom! Você economiza ${savingsRate.toFixed(1)}% da sua renda. Tente aumentar para 20%.`
                              } else if (savingsRate > 0) {
                                return `Você economiza ${savingsRate.toFixed(1)}% da sua renda. Tente aumentar para pelo menos 10%.`
                              } else {
                                return 'Suas despesas são iguais ou superiores à renda. É importante criar uma margem de economia.'
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Dados insuficientes para análise de padrões. Adicione mais transações.</p>
                )}
              </CardContent>
            </Card>

            {/* Recomendações Personalizadas */}
            <Card>
              <CardHeader>
                <CardTitle>Recomendações Personalizadas</CardTitle>
                <CardDescription>
                  Ações sugeridas para melhorar sua saúde financeira
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Recomendações baseadas em dados */}
                  {categoryExpenses.length > 0 && categoryExpenses[0].percentage > 40 && (
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-600 mt-2" />
                        <div>
                          <div className="font-semibold text-orange-900 dark:text-orange-100">
                            Categoria dominante detectada
                          </div>
                          <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                            {categoryExpenses[0].category} representa {categoryExpenses[0].percentage.toFixed(1)}% dos seus gastos.
                            Considere revisar essa categoria para oportunidades de economia.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {monthlyData.length > 0 && (() => {
                    const avgIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length
                    const avgExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length
                    return avgExpenses > avgIncome * 0.9
                  })() && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-600 mt-2" />
                        <div>
                          <div className="font-semibold text-red-900 dark:text-red-100">
                            Margem de segurança baixa
                          </div>
                          <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                            Suas despesas estão muito próximas da sua renda. Tente reduzir gastos ou aumentar receitas.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {accountBalances.length === 0 && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                        <div>
                          <div className="font-semibold text-blue-900 dark:text-blue-100">
                            Diversifique suas contas
                          </div>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                            Considere ter pelo menos duas contas: uma para despesas do dia a dia e outra para poupança.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {monthlyData.length > 0 && (() => {
                    const avgIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length
                    const avgExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length
                    const savingsRate = avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0
                    return savingsRate >= 20
                  })() && (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-600 mt-2" />
                        <div>
                          <div className="font-semibold text-green-900 dark:text-green-100">
                            Ótima taxa de poupança! 🎉
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                            Você está economizando bem. Considere investir esse dinheiro para fazê-lo crescer.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recomendação padrão */}
                  {insights.length === 0 && categoryExpenses.length === 0 && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border">
                      <p className="text-sm text-muted-foreground">
                        Continue registrando suas transações para receber recomendações personalizadas baseadas nos seus hábitos financeiros.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Score de Saúde Financeira */}
            <Card>
              <CardHeader>
                <CardTitle>Score de Saúde Financeira</CardTitle>
                <CardDescription>
                  Avaliação geral da sua situação financeira
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const avgIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length
                      const avgExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length
                      const avgSavings = avgIncome - avgExpenses
                      const savingsRate = avgIncome > 0 ? (avgSavings / avgIncome) * 100 : 0

                      // Calcular score (0-100)
                      let score = 0
                      if (savingsRate >= 20) score += 40
                      else if (savingsRate >= 10) score += 25
                      else if (savingsRate > 0) score += 10

                      if (categoryExpenses.length > 0 && categoryExpenses[0].percentage < 40) score += 20
                      if (accountBalances.length >= 2) score += 20
                      if (monthlyData.length >= 3) score += 20

                      const scoreColor = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      const scoreText = score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Regular' : 'Precisa melhorar'

                      return (
                        <>
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <div className="text-5xl font-bold">{score}</div>
                              <div className="text-sm text-muted-foreground mt-1">{scoreText}</div>
                            </div>
                            <div className={`w-24 h-24 rounded-full ${scoreColor} flex items-center justify-center text-white text-2xl font-bold`}>
                              {score}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Taxa de Poupança</span>
                              <span className="font-medium">{savingsRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500 transition-all"
                                style={{ width: `${Math.min(savingsRate * 5, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-2">Como melhorar seu score:</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {savingsRate < 20 && <li>• Aumente sua taxa de poupança para pelo menos 20%</li>}
                              {categoryExpenses.length > 0 && categoryExpenses[0].percentage >= 40 && (
                                <li>• Reduza gastos na categoria {categoryExpenses[0].category}</li>
                              )}
                              {accountBalances.length < 2 && <li>• Diversifique suas contas financeiras</li>}
                              {monthlyData.length < 3 && <li>• Continue registrando transações por mais meses</li>}
                            </ul>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Dados insuficientes para calcular score. Adicione mais transações.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
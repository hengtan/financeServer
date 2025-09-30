import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TimelineChart } from '@/components/TimelineChart'
import { PeriodComparison } from '@/components/PeriodComparison'
import { TrendForecast } from '@/components/TrendForecast'
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
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento Avançado</CardTitle>
                <CardDescription>
                  Análise detalhada por categoria e subcategoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Detalhamento avançado será implementado em breve...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-6">
            <TrendForecast />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Insights Avançados</CardTitle>
                <CardDescription>
                  Análises preditivas e recomendações personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Insights avançados serão implementados em breve...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
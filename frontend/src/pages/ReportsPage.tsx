import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TimelineChart } from '@/components/TimelineChart'
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
import { useState } from 'react'

export const ReportsPage = () => {
  usePageTitle('Relatórios')

  const [selectedPeriod, setSelectedPeriod] = useState('mensal')

  const monthlyData = [
    { month: 'Jan 2024', income: 6400, expenses: 4200, savings: 2200 },
    { month: 'Dez 2023', income: 5800, expenses: 3900, savings: 1900 },
    { month: 'Nov 2023', income: 6200, expenses: 4100, savings: 2100 },
    { month: 'Out 2023', income: 5900, expenses: 3800, savings: 2100 },
    { month: 'Set 2023', income: 6100, expenses: 4000, savings: 2100 },
    { month: 'Ago 2023', income: 5700, expenses: 3600, savings: 2100 },
  ]

  const categoryExpenses = [
    { category: 'Alimentação', amount: 1234.56, percentage: 29.3, color: 'bg-red-500' },
    { category: 'Transporte', amount: 567.89, percentage: 13.5, color: 'bg-blue-500' },
    { category: 'Entretenimento', amount: 234.50, percentage: 5.6, color: 'bg-green-500' },
    { category: 'Saúde', amount: 175.20, percentage: 4.2, color: 'bg-yellow-500' },
    { category: 'Educação', amount: 102.90, percentage: 2.4, color: 'bg-purple-500' },
    { category: 'Vestuário', amount: 189.90, percentage: 4.5, color: 'bg-emerald-500' },
    { category: 'Investimento', amount: 1000.00, percentage: 23.8, color: 'bg-indigo-500' },
    { category: 'Outros', amount: 695.05, percentage: 16.7, color: 'bg-gray-500' }
  ]

  const incomeBreakdown = [
    { source: 'Salário Principal', amount: 5200.00, percentage: 81.3 },
    { source: 'Freelance', amount: 1200.00, percentage: 18.7 }
  ]

  const insights = [
    {
      title: "Maior Economia do Ano",
      description: "Janeiro foi seu melhor mês com R$ 2.200 economizados",
      trend: "up",
      value: "+15.8%"
    },
    {
      title: "Categoria em Alta",
      description: "Gastos com alimentação aumentaram 20% comparado ao mês anterior",
      trend: "up",
      value: "+20%"
    },
    {
      title: "Meta Atingida",
      description: "Você conseguiu economizar mais de R$ 2.000 este mês",
      trend: "up",
      value: "Meta ✓"
    },
    {
      title: "Oportunidade",
      description: "Seus gastos com transporte diminuíram 12%",
      trend: "down",
      value: "-12%"
    }
  ]

  const accountBalances = [
    { account: 'Conta Corrente', balance: 8430.50, change: 12.5 },
    { account: 'Conta Poupança', balance: 4200.00, change: 8.3 },
    { account: 'Investimentos CDB', balance: 2800.00, change: 5.2 },
    { account: 'Cartão Visa (Limite)', balance: -1234.56, change: -15.2 }
  ]

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
            <Button variant="outline" onClick={() => {
              const csv = [
                ['Período', 'Receitas', 'Despesas', 'Economia'],
                ...monthlyData.map(m => [m.month, m.income.toString(), m.expenses.toString(), m.savings.toString()])
              ].map(row => row.join(',')).join('\n')

              const blob = new Blob([csv], { type: 'text/csv' })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'relatorio-financeiro.csv'
              a.click()
              window.URL.revokeObjectURL(url)
            }}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

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
                {monthlyData.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">{month.month}</span>
                      <span className="text-sm text-muted-foreground">
                        Economia: R$ {month.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                      <span>Receitas: R$ {month.income.toLocaleString()}</span>
                      <span>Despesas: R$ {month.expenses.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
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
                  {accountBalances.map((account, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">{account.account}</p>
                        <p className={`text-sm flex items-center ${account.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {account.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {account.change >= 0 ? '+' : ''}{account.change}% este mês
                        </p>
                      </div>
                      <p className={`font-bold ${account.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                        R$ {Math.abs(account.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
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
                  {incomeBreakdown.map((source, index) => (
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
                      <p className="text-sm text-muted-foreground">{source.percentage}% do total</p>
                    </div>
                  ))}
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
                {categoryExpenses.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 ${category.color}`}></div>
                        <span className="text-foreground">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {category.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-muted-foreground">{category.percentage}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
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
                {insights.map((insight, index) => (
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
                ))}
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
      </div>
    </div>
  )
}
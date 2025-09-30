import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, BarChart3, Calendar, Target, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { transactionsService, reportsService } from '@/services'

interface Transaction {
  id: number
  description: string
  amount: number
  date: string
  category: string
  type: 'income' | 'expense'
}

interface TrendData {
  period: string
  actual?: number
  predicted: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
}

interface ForecastResult {
  category: string
  currentTrend: 'up' | 'down' | 'stable'
  nextMonthPrediction: number
  confidence: number
  data: TrendData[]
  insights: string[]
}

export const TrendForecast = () => {
  const [forecastPeriod, setForecastPeriod] = useState<'3' | '6' | '12'>('6')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<string[]>(['all'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dados simulados de transações (fallback quando API não estiver disponível)
  const mockTransactions: Transaction[] = useMemo(() => [
    { id: 1, description: 'Salário', amount: 5200, date: '2024-01-15', category: 'Renda', type: 'income' },
    { id: 2, description: 'Freelance', amount: 1200, date: '2024-01-12', category: 'Renda Extra', type: 'income' },
    { id: 3, description: 'Supermercado', amount: -234.50, date: '2024-01-16', category: 'Alimentação', type: 'expense' },
    { id: 4, description: 'Gasolina', amount: -180, date: '2024-01-18', category: 'Transporte', type: 'expense' },
    { id: 5, description: 'Academia', amount: -89, date: '2024-01-20', category: 'Saúde', type: 'expense' },
    { id: 6, description: 'Netflix', amount: -32.90, date: '2024-02-05', category: 'Entretenimento', type: 'expense' },
    { id: 7, description: 'Salário', amount: 5200, date: '2024-02-15', category: 'Renda', type: 'income' },
    { id: 8, description: 'Supermercado', amount: -198.30, date: '2024-02-18', category: 'Alimentação', type: 'expense' },
    { id: 9, description: 'Investimento', amount: -1000, date: '2024-02-25', category: 'Investimento', type: 'expense' },
    { id: 10, description: 'Salário', amount: 5200, date: '2024-03-15', category: 'Renda', type: 'income' },
  ], [])

  // Carregar dados da API
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Tentar carregar dados reais da API
      const [transactionsResponse, categoriesResponse] = await Promise.all([
        transactionsService.getTransactions({ limit: 1000 }),
        transactionsService.getCategories()
      ])

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data.data)
        setCategories(['all', ...categoriesResponse.data || []])
      } else {
        // Se API falhou, mostrar dados vazios
        console.warn('API não disponível, mostrando estado vazio')
        setTransactions([])
        setCategories(['all'])
      }
    } catch (error) {
      console.warn('Erro ao carregar dados da API, mostrando estado vazio:', error)
      setTransactions([])
      setCategories(['all'])
    } finally {
      setLoading(false)
    }
  }

  // Algoritmo simples de previsão baseado em tendências
  const generateForecast = (transactions: Transaction[], category: string): ForecastResult => {
    const filteredTransactions = category === 'all'
      ? transactions
      : transactions.filter(t => t.category === category)

    // Agrupar por mês
    const monthlyData = filteredTransactions.reduce((acc, transaction) => {
      const month = transaction.date.substring(0, 7) // YYYY-MM
      if (!acc[month]) acc[month] = 0
      acc[month] += transaction.amount
      return acc
    }, {} as Record<string, number>)

    const months = Object.keys(monthlyData).sort()
    const values = months.map(month => monthlyData[month])

    // Calcular tendência (regressão linear simples)
    const n = values.length
    if (n < 2) {
      return {
        category,
        currentTrend: 'stable',
        nextMonthPrediction: 0,
        confidence: 0,
        data: [],
        insights: ['Dados insuficientes para análise']
      }
    }

    const sumX = values.map((_, i) => i).reduce((a, b) => a + b, 0)
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = values.map((y, i) => i * y).reduce((a, b) => a + b, 0)
    const sumXX = values.map((_, i) => i * i).reduce((a, b) => a + b, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Determinar tendência
    const currentTrend: 'up' | 'down' | 'stable' =
      Math.abs(slope) < 50 ? 'stable' :
      slope > 0 ? 'up' : 'down'

    // Prever próximos períodos
    const data: TrendData[] = []
    const forecastMonths = parseInt(forecastPeriod)

    // Adicionar dados históricos
    months.forEach((month, index) => {
      data.push({
        period: month,
        actual: monthlyData[month],
        predicted: intercept + slope * index,
        confidence: 85,
        trend: currentTrend
      })
    })

    // Adicionar previsões
    for (let i = 1; i <= forecastMonths; i++) {
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + i)
      const futureMonth = futureDate.toISOString().substring(0, 7)

      const predicted = intercept + slope * (n - 1 + i)
      const confidence = Math.max(95 - (i * 10), 40) // Confiança diminui com o tempo

      data.push({
        period: futureMonth,
        predicted,
        confidence,
        trend: currentTrend
      })
    }

    // Calcular previsão do próximo mês
    const nextMonthPrediction = intercept + slope * n

    // Gerar insights
    const insights: string[] = []
    const lastValue = values[values.length - 1]
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length
    const trend = ((nextMonthPrediction - lastValue) / Math.abs(lastValue)) * 100

    if (category === 'all') {
      insights.push(`Saldo previsto para próximo mês: ${nextMonthPrediction > 0 ? '+' : ''}R$ ${nextMonthPrediction.toFixed(2)}`)
    }

    if (currentTrend === 'up') {
      insights.push(`📈 Tendência crescente detectada (${Math.abs(trend).toFixed(1)}%)`)
    } else if (currentTrend === 'down') {
      insights.push(`📉 Tendência decrescente detectada (${Math.abs(trend).toFixed(1)}%)`)
    } else {
      insights.push(`📊 Comportamento estável nos últimos meses`)
    }

    if (Math.abs(nextMonthPrediction) > Math.abs(avgValue) * 1.2) {
      insights.push(`⚠️ Valor previsto ${Math.abs(nextMonthPrediction) > Math.abs(avgValue) ? 'acima' : 'abaixo'} da média histórica`)
    }

    return {
      category,
      currentTrend,
      nextMonthPrediction,
      confidence: Math.round((1 - Math.abs(slope) / Math.abs(avgValue)) * 100),
      data,
      insights
    }
  }

  const forecast = generateForecast(transactions, selectedCategory)

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200'
      case 'down': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Previsões e Tendências
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Atualizar
            </Button>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Categoria:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.slice(1).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Período:</label>
              <Select value={forecastPeriod} onValueChange={(v) => setForecastPeriod(v as '3' | '6' | '12')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Carregando dados e calculando previsões...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-2 py-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumo da Tendência */}
          <Card className={cn("border-2", getTrendColor(forecast.currentTrend))}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tendência Atual</span>
              {getTrendIcon(forecast.currentTrend)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold">
                  {forecast.nextMonthPrediction > 0 ? '+' : ''}
                  R$ {forecast.nextMonthPrediction.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Previsão próximo mês</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {forecast.confidence}% confiança
                </Badge>
                <Badge variant={forecast.currentTrend === 'up' ? 'default' :
                              forecast.currentTrend === 'down' ? 'destructive' : 'secondary'}>
                  {forecast.currentTrend === 'up' ? 'Crescendo' :
                   forecast.currentTrend === 'down' ? 'Declinando' : 'Estável'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Tendência */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Projeção Temporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Gráfico simplificado */}
              <div className="h-64 bg-gradient-to-t from-slate-50 to-white dark:from-slate-900/20 rounded-lg border p-4">
                <div className="h-full flex items-end justify-between gap-1">
                  {forecast.data.map((point, index) => {
                    const maxValue = Math.max(...forecast.data.map(p => Math.abs(p.predicted)))
                    const height = Math.max((Math.abs(point.predicted) / maxValue) * 100, 5)
                    const isPrediction = !point.actual
                    const isPositive = point.predicted > 0

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group max-w-[40px]">
                        <div className="relative w-full h-full flex flex-col justify-end">
                          <div
                            className={cn(
                              "rounded-t-md transition-all duration-300",
                              isPrediction
                                ? "bg-gradient-to-t from-orange-400 to-orange-300 opacity-70 border-2 border-dashed border-orange-500"
                                : isPositive
                                ? "bg-gradient-to-t from-green-500 to-green-400"
                                : "bg-gradient-to-t from-red-500 to-red-400"
                            )}
                            style={{
                              height: `${height}%`,
                              minHeight: '8px'
                            }}
                          />
                        </div>

                        <span className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-top-left">
                          {point.period.substring(5)}
                        </span>

                        {/* Tooltip */}
                        <div className="invisible group-hover:visible absolute bottom-full mb-2 bg-popover border rounded-lg p-2 shadow-lg z-10 min-w-32">
                          <div className="text-xs space-y-1">
                            <p className="font-medium">{point.period}</p>
                            {point.actual && (
                              <p>Real: <span className="font-mono">R$ {point.actual.toFixed(2)}</span></p>
                            )}
                            <p>Previsto: <span className="font-mono">R$ {point.predicted.toFixed(2)}</span></p>
                            <p>Confiança: {point.confidence}%</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Legenda */}
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-t from-green-500 to-green-400 rounded-sm"></div>
                  <span>Dados Reais</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-t from-orange-400 to-orange-300 border border-dashed border-orange-500 rounded-sm"></div>
                  <span>Previsões</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecast.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-primary mt-0.5">•</span>
                <span className="text-sm">{insight}</span>
              </div>
            ))}

            {forecast.currentTrend !== 'stable' && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">💡 Recomendação:</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {forecast.currentTrend === 'up'
                    ? 'Aproveite o momento positivo para aumentar seus investimentos ou criar uma reserva maior.'
                    : 'Considere revisar seus gastos e identificar oportunidades de economia para reverter a tendência.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}
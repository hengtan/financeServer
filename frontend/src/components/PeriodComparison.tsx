import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
  BarChart3,
  DollarSign,
  CreditCard,
  PiggyBank
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { dashboardService } from '@/services/dashboard'

interface PeriodData {
  label: string
  amount: number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
}

interface ComparisonPeriod {
  id: string
  label: string
  current: string
  previous: string
}

const comparisonPeriods: ComparisonPeriod[] = [
  {
    id: 'month',
    label: 'Mensal',
    current: 'Este Mês',
    previous: 'Mês Anterior'
  },
  {
    id: 'quarter',
    label: 'Trimestral',
    current: 'Este Trimestre',
    previous: 'Trimestre Anterior'
  },
  {
    id: 'year',
    label: 'Anual',
    current: 'Este Ano',
    previous: 'Ano Anterior'
  },
  {
    id: 'custom',
    label: 'Personalizado',
    current: 'Período Atual',
    previous: 'Período Anterior'
  }
]

// Função para calcular dados reais de comparação
const getComparisonData = async (periodId: string): Promise<PeriodData[]> => {
  try {
    // Definir períodos de comparação
    const periodDays: Record<string, number> = {
      month: 30,
      quarter: 90,
      year: 365,
      custom: 30
    }

    const currentPeriod = periodDays[periodId] || 30
    const previousPeriod = currentPeriod * 2 // Dobro para comparar período anterior

    // Buscar dados dos dois períodos
    const [currentData, previousData] = await Promise.all([
      dashboardService.getOverview(currentPeriod),
      dashboardService.getOverview(previousPeriod)
    ])

    if (!currentData.success || !currentData.data || !previousData.success || !previousData.data) {
      return []
    }

    const current = currentData.data.financial
    const previous = previousData.data.financial

    // Calcular mudanças percentuais
    const calculateChange = (currentVal: number, previousVal: number) => {
      if (previousVal === 0) return 0
      return ((currentVal - previousVal) / previousVal) * 100
    }

    // Economia = receitas - despesas
    const currentSavings = current.totalIncome - current.totalExpenses
    const previousSavings = previous.totalIncome - previous.totalExpenses

    // Investimentos (usando saldo líquido como proxy)
    const currentInvestments = current.netIncome
    const previousInvestments = previous.netIncome

    return [
      {
        label: 'Receitas',
        amount: current.totalIncome,
        change: calculateChange(current.totalIncome, previous.totalIncome),
        changeType: 'increase' as const
      },
      {
        label: 'Despesas',
        amount: current.totalExpenses,
        change: calculateChange(current.totalExpenses, previous.totalExpenses),
        changeType: 'decrease' as const
      },
      {
        label: 'Economia',
        amount: currentSavings,
        change: calculateChange(currentSavings, previousSavings),
        changeType: 'increase' as const
      },
      {
        label: 'Investimentos',
        amount: currentInvestments,
        change: calculateChange(currentInvestments, previousInvestments),
        changeType: 'increase' as const
      }
    ]
  } catch (error) {
    console.error('Erro ao carregar dados de comparação:', error)
    return []
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

const formatPercent = (percent: number) => {
  return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`
}

const getIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case 'receitas':
      return <DollarSign className="h-5 w-5" />
    case 'despesas':
      return <CreditCard className="h-5 w-5" />
    case 'economia':
      return <PiggyBank className="h-5 w-5" />
    case 'investimentos':
      return <BarChart3 className="h-5 w-5" />
    default:
      return <TrendingUp className="h-5 w-5" />
  }
}

const getChangeColor = (changeType: string, change: number) => {
  if (changeType === 'neutral') return 'text-muted-foreground'

  // Para despesas, uma diminuição é positiva (verde)
  if (changeType === 'decrease') {
    return change < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  // Para receitas, economia e investimentos, um aumento é positivo (verde)
  return change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
}

export interface PeriodComparisonProps {
  className?: string
}

export function PeriodComparison({ className }: PeriodComparisonProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<PeriodData[]>([])

  const currentPeriod = comparisonPeriods.find(p => p.id === selectedPeriod)

  useEffect(() => {
    loadComparisonData()
  }, [])

  const loadComparisonData = async () => {
    setIsLoading(true)
    const comparisonData = await getComparisonData(selectedPeriod)
    setData(comparisonData)
    setIsLoading(false)
  }

  const handlePeriodChange = async (periodId: string) => {
    setIsLoading(true)
    setSelectedPeriod(periodId)
    const comparisonData = await getComparisonData(periodId)
    setData(comparisonData)
    setIsLoading(false)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com seletor de período */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Comparação de Períodos</h2>
          <p className="text-muted-foreground">
            Compare o desempenho financeiro entre diferentes períodos
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Período:</span>
          </div>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {comparisonPeriods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Indicador de período atual */}
      {currentPeriod && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3 text-blue-700 dark:text-blue-300">
              <span className="font-medium">{currentPeriod.previous}</span>
              <ArrowRight className="h-4 w-4" />
              <span className="font-semibold">{currentPeriod.current}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de comparações */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.map((item, index) => (
          <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-muted/50">
                  {getIcon(item.label)}
                </div>
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold">
                  {formatCurrency(item.amount)}
                </div>

                <div className="flex items-center gap-2">
                  <div className={cn('flex items-center gap-1', getChangeColor(item.changeType, item.change))}>
                    {item.change > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : item.change < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {formatPercent(Math.abs(item.change))}
                    </span>
                  </div>

                  <Badge
                    variant={item.change > 0 ? 'default' : item.change < 0 ? 'secondary' : 'outline'}
                    className={cn(
                      'text-xs',
                      item.change > 0 && item.changeType !== 'decrease' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                      item.change < 0 && item.changeType === 'decrease' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                      item.change > 0 && item.changeType === 'decrease' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                      item.change < 0 && item.changeType !== 'decrease' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    )}
                  >
                    {item.change > 0 ? 'Aumento' : item.change < 0 ? 'Redução' : 'Estável'}
                  </Badge>
                </div>

                {/* Barra de progresso visual */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-500',
                      item.change > 0 && item.changeType !== 'decrease' ? 'bg-green-500' : 'bg-blue-500'
                    )}
                    style={{
                      width: `${Math.min(Math.abs(item.change) * 2, 100)}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Resumo da comparação */}
      {!isLoading && data.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumo da Comparação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.filter(item =>
                  (item.change > 0 && item.changeType !== 'decrease') ||
                  (item.change < 0 && item.changeType === 'decrease')
                ).length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Métricas Melhoradas
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {data.filter(item =>
                  (item.change < 0 && item.changeType !== 'decrease') ||
                  (item.change > 0 && item.changeType === 'decrease')
                ).length}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Métricas Piores
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.filter(item => item.change === 0).length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Métricas Estáveis
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
import { useState } from 'react'
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

// Dados simulados para demonstração
const getMockData = (periodId: string): PeriodData[] => {
  const baseData = {
    month: [
      { label: 'Receitas', amount: 8500, change: 12.5, changeType: 'increase' as const },
      { label: 'Despesas', amount: 6200, change: -8.3, changeType: 'decrease' as const },
      { label: 'Economia', amount: 2300, change: 45.2, changeType: 'increase' as const },
      { label: 'Investimentos', amount: 1500, change: 23.1, changeType: 'increase' as const }
    ],
    quarter: [
      { label: 'Receitas', amount: 25500, change: 18.7, changeType: 'increase' as const },
      { label: 'Despesas', amount: 18600, change: -5.4, changeType: 'decrease' as const },
      { label: 'Economia', amount: 6900, change: 62.3, changeType: 'increase' as const },
      { label: 'Investimentos', amount: 4500, change: 31.8, changeType: 'increase' as const }
    ],
    year: [
      { label: 'Receitas', amount: 102000, change: 15.2, changeType: 'increase' as const },
      { label: 'Despesas', amount: 74400, change: -3.8, changeType: 'decrease' as const },
      { label: 'Economia', amount: 27600, change: 58.9, changeType: 'increase' as const },
      { label: 'Investimentos', amount: 18000, change: 42.1, changeType: 'increase' as const }
    ]
  }

  return baseData[periodId as keyof typeof baseData] || baseData.month
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
  const [isLoading, setIsLoading] = useState(false)

  const currentPeriod = comparisonPeriods.find(p => p.id === selectedPeriod)
  const data = getMockData(selectedPeriod)

  const handlePeriodChange = async (periodId: string) => {
    setIsLoading(true)
    // Simula carregamento de dados
    await new Promise(resolve => setTimeout(resolve, 500))
    setSelectedPeriod(periodId)
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

      {/* Resumo da comparação */}
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
    </div>
  )
}
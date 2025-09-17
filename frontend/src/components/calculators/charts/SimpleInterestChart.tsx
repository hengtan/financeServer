import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, BarChart3, PieChart } from 'lucide-react'

// Função para formatação consistente de moeda
const formatCurrency = (value: number): string => {
  if (isNaN(value) || !isFinite(value)) {
    return 'R$ 0,00'
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

interface SimpleInterestChartProps {
  principal: number
  interestRate: number
  timePeriod: number
  timeUnit: 'months' | 'years'
  totalInterest: number
  finalAmount: number
}

export function SimpleInterestChart({
  principal,
  interestRate,
  timePeriod,
  timeUnit,
  totalInterest,
  finalAmount
}: SimpleInterestChartProps) {
  const [chartType, setChartType] = useState<'comparison' | 'timeline' | 'breakdown'>('comparison')

  const timeInYears = timeUnit === 'months' ? timePeriod / 12 : timePeriod
  const timeInMonths = timeUnit === 'years' ? timePeriod * 12 : timePeriod

  // Debug values (remover em produção)
  // console.log('Chart Props:', { principal, interestRate, totalInterest, finalAmount })

  const renderComparisonChart = () => {
    // Recalcular juros simples para garantir consistência
    const calculatedSimpleInterest = principal * (interestRate / 100) * timeInYears
    const simpleInterest = calculatedSimpleInterest
    const compoundInterest = principal * (Math.pow(1 + (interestRate / 100), timeInYears) - 1)
    const difference = compoundInterest - simpleInterest

    // Para períodos de exatamente 1 ano, juros simples e compostos são matematicamente iguais

    // Para evitar divisão por zero no cálculo de porcentagem
    const maxValue = Math.max(simpleInterest, compoundInterest, 1)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Juros Simples vs Compostos</h3>
          <Badge variant="outline">
            {timeInYears.toFixed(1)} anos
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Juros Simples</span>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  Atual
                </Badge>
              </div>
              <span className="text-sm font-mono">{formatCurrency(simpleInterest)}</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                <div
                  className="h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(simpleInterest / maxValue) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Juros Compostos</span>
                <Badge variant="outline" className="text-xs">
                  Referência
                </Badge>
              </div>
              <span className="text-sm font-mono">{formatCurrency(compoundInterest)}</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                <div
                  className="h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${(compoundInterest / maxValue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Diferença:</span>
            <span className={`font-bold ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(difference))}
            </span>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            {Math.abs(difference) < 0.01
              ? `✅ Para ${timeInYears} ano${timeInYears !== 1 ? 's' : ''}, a diferença é mínima (menos de R$ 0,01).`
              : difference > 0
              ? `💰 Com juros compostos você ganharia ${formatCurrency(difference)} a mais!`
              : `⚠️ Juros simples seria ${formatCurrency(Math.abs(difference))} maior (caso incomum).`
            }
          </p>
        </div>
      </div>
    )
  }

  const renderTimelineChart = () => {
    // Validações de entrada
    if (principal <= 0 || interestRate <= 0 || timeInMonths <= 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p>Configure os valores para ver o gráfico</p>
        </div>
      )
    }

    // Timeline de crescimento linear dos juros simples
    const periods = Math.max(Math.min(Math.ceil(timeInMonths / 3), 16), 4) // Min 4, Max 16 pontos
    const timeline: Array<{period: string, interest: number, total: number, months: number}> = []

    for (let i = 0; i <= periods; i++) {
      const currentMonths = (timeInMonths / periods) * i
      const currentYears = currentMonths / 12
      const currentInterest = principal * (interestRate / 100) * currentYears
      const currentAmount = principal + currentInterest

      timeline.push({
        period: `${Math.round(currentMonths)}m`,
        interest: currentInterest,
        total: currentAmount,
        months: currentMonths
      })
    }

    const maxAmount = Math.max(...timeline.map(t => t.total))

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Crescimento Linear</h3>
          <Badge variant="outline">
            Taxa: {interestRate}% a.a.
          </Badge>
        </div>

        <div className="relative h-64 bg-gradient-to-t from-slate-50 to-white dark:from-slate-900/20 to-transparent rounded-lg p-4 border">
          <div className="relative h-full flex items-end justify-between gap-2">
            {timeline.map((data, index) => {
              // Altura baseada no valor total, não no valor máximo fixo
              const progress = index / (timeline.length - 1)
              const height = Math.max((data.total / maxAmount) * 100, 12) // Altura mínima de 12px
              const isLast = index === timeline.length - 1

              // Cores gradativas do verde ao azul
              const getBarColor = () => {
                if (isLast) return 'bg-gradient-to-t from-green-500 to-green-400'
                if (progress > 0.7) return 'bg-gradient-to-t from-blue-500 to-blue-400'
                if (progress > 0.4) return 'bg-gradient-to-t from-indigo-500 to-indigo-400'
                return 'bg-gradient-to-t from-slate-400 to-slate-300'
              }

              return (
                <div key={index} className="flex-1 flex flex-col items-center group max-w-[60px]">
                  <div className="relative w-full h-full flex flex-col justify-end">
                    <div
                      className={`rounded-t-md transition-all duration-500 hover:scale-105 shadow-sm ${getBarColor()}`}
                      style={{
                        height: `${height}%`,
                        minHeight: '12px',
                        width: '100%'
                      }}
                    />
                  </div>

                  <span className="text-xs text-muted-foreground mt-1">
                    {data.period}
                  </span>

                  {/* Tooltip on hover */}
                  <div className="invisible group-hover:visible absolute bottom-full mb-2 bg-popover border rounded-lg p-2 shadow-lg z-10 min-w-32">
                    <div className="text-xs space-y-1">
                      <p className="font-medium">{data.period}</p>
                      <p>Total: <span className="font-mono">{formatCurrency(data.total)}</span></p>
                      <p>Juros: <span className="font-mono">{formatCurrency(data.interest)}</span></p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
            <span>Período inicial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-400 rounded-sm"></div>
            <span>Meio período</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
            <span>Quase final</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <span>Valor final</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            📈 <span className="font-bold">Crescimento Linear:</span> Os juros simples crescem de forma constante,
            sempre sobre o mesmo valor principal de {formatCurrency(principal)}.
          </p>
        </div>
      </div>
    )
  }

  const renderBreakdownChart = () => {
    // Recalcular para garantir consistência
    const calculatedTotalInterest = principal * (interestRate / 100) * timeInYears
    const calculatedFinalAmount = principal + calculatedTotalInterest

    // Breakdown do montante final
    const principalPercentage = (principal / calculatedFinalAmount) * 100
    const interestPercentage = (calculatedTotalInterest / calculatedFinalAmount) * 100

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Composição do Montante</h3>
          <Badge variant="outline">
            {formatCurrency(calculatedFinalAmount)}
          </Badge>
        </div>

        {/* Donut Chart Simulation */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="30"
                stroke="currentColor"
                strokeWidth="20"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />

              {/* Principal segment */}
              <circle
                cx="50"
                cy="50"
                r="30"
                stroke="#3b82f6"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${principalPercentage * 1.88} 188`}
                strokeDashoffset="0"
              />

              {/* Interest segment */}
              <circle
                cx="50"
                cy="50"
                r="30"
                stroke="#10b981"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${interestPercentage * 1.88} 188`}
                strokeDashoffset={-principalPercentage * 1.88}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold">
                  {interestPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">de juros</div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">Capital Inicial</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{formatCurrency(principal)}</div>
              <div className="text-xs text-muted-foreground">{principalPercentage.toFixed(1)}%</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Juros Ganhos</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{formatCurrency(calculatedTotalInterest)}</div>
              <div className="text-xs text-muted-foreground">{interestPercentage.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Taxa Mensal</div>
              <div className="font-mono text-sm">{(interestRate / 12).toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Rendimento/Mês</div>
              <div className="font-mono text-sm">{formatCurrency(calculatedTotalInterest / timeInMonths)}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart Type Selector */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={chartType === 'comparison' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('comparison')}
          className="flex-1"
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          Comparação
        </Button>
        <Button
          variant={chartType === 'timeline' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('timeline')}
          className="flex-1"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Evolução
        </Button>
        <Button
          variant={chartType === 'breakdown' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('breakdown')}
          className="flex-1"
        >
          <PieChart className="h-4 w-4 mr-1" />
          Composição
        </Button>
      </div>

      {/* Chart Content */}
      {chartType === 'comparison' && renderComparisonChart()}
      {chartType === 'timeline' && renderTimelineChart()}
      {chartType === 'breakdown' && renderBreakdownChart()}
    </div>
  )
}
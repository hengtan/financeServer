import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface EmergencyChartProps {
  monthlyExpenses: number
  currentSavings: number
  targetAmount: number
  monthsToTarget: number
  monthlyContribution: number
  targetMonths: number
}

export function EmergencyChart({
  monthlyExpenses,
  currentSavings,
  targetAmount,
  monthsToTarget,
  monthlyContribution,
  targetMonths
}: EmergencyChartProps) {
  const [chartType, setChartType] = useState<'progress' | 'categories' | 'timeline'>('progress')

  const currentMonths = currentSavings / monthlyExpenses
  const progressPercentage = Math.min((currentSavings / targetAmount) * 100, 100)
  const isComplete = currentSavings >= targetAmount

  const renderProgressChart = () => {
    const levels = [
      { months: 1, color: 'bg-red-500', label: 'Crítico', description: 'Muito baixo' },
      { months: 3, color: 'bg-orange-500', label: 'Mínimo', description: 'Básico' },
      { months: 6, color: 'bg-yellow-500', label: 'Recomendado', description: 'Bom' },
      { months: 12, color: 'bg-green-500', label: 'Excelente', description: 'Muito bom' }
    ]

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Status da Reserva</h3>
          <Badge variant={isComplete ? "default" : "secondary"}>
            {currentMonths.toFixed(1)} meses
          </Badge>
        </div>

        {/* Progress Bar with Levels */}
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
            <div
              className={`h-8 rounded-full transition-all duration-700 ${
                isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>

          {/* Level markers */}
          {levels.map((level, index) => {
            const position = (level.months / Math.max(targetMonths, 12)) * 100
            const isReached = currentMonths >= level.months

            return (
              <div
                key={index}
                className="absolute top-0 transform -translate-x-1/2"
                style={{ left: `${Math.min(position, 95)}%` }}
              >
                <div className={`w-1 h-8 ${isReached ? 'bg-white' : 'bg-gray-400'}`} />
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
                  <div className={`text-xs px-2 py-1 rounded ${
                    isReached ? level.color + ' text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {level.months}m
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                    {level.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Current Status */}
        <div className="mt-16 space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <span className="text-sm font-medium">Reserva atual:</span>
            <span className="font-bold text-blue-600">R$ {currentSavings.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <span className="text-sm font-medium">Meta da reserva:</span>
            <span className="font-bold text-green-600">R$ {targetAmount.toLocaleString()}</span>
          </div>

          <div className={`flex justify-between items-center p-3 rounded-lg ${
            isComplete
              ? 'bg-green-50 dark:bg-green-950/20'
              : 'bg-red-50 dark:bg-red-950/20'
          }`}>
            <span className="text-sm font-medium">
              {isComplete ? 'Superávit:' : 'Ainda falta:'}
            </span>
            <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-red-600'}`}>
              R$ {Math.abs(targetAmount - currentSavings).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Status Message */}
        <div className={`p-3 rounded-lg border ${
          isComplete
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            : currentMonths >= 3
            ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-2">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            )}
            <p className={`text-sm ${
              isComplete
                ? 'text-green-700 dark:text-green-300'
                : currentMonths >= 3
                ? 'text-orange-700 dark:text-orange-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {isComplete
                ? '🎉 Excelente! Sua reserva de emergência está completa e você está protegido.'
                : currentMonths >= 3
                ? '👍 Você tem uma reserva básica, mas considere aumentá-la para maior segurança.'
                : '⚠️ Sua reserva está baixa. Priorize formar uma reserva de pelo menos 3 meses.'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderCategoriesChart = () => {
    const categories = [
      { name: 'Moradia', percentage: 35, amount: monthlyExpenses * 0.35, color: 'bg-blue-500' },
      { name: 'Alimentação', percentage: 25, amount: monthlyExpenses * 0.25, color: 'bg-green-500' },
      { name: 'Transporte', percentage: 15, amount: monthlyExpenses * 0.15, color: 'bg-purple-500' },
      { name: 'Saúde', percentage: 10, amount: monthlyExpenses * 0.10, color: 'bg-red-500' },
      { name: 'Serviços', percentage: 10, amount: monthlyExpenses * 0.10, color: 'bg-orange-500' },
      { name: 'Outros', percentage: 5, amount: monthlyExpenses * 0.05, color: 'bg-gray-500' }
    ]

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Gastos Essenciais por Categoria</h3>
          <Badge variant="outline">
            R$ {monthlyExpenses.toLocaleString()}/mês
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

              {/* Category segments */}
              {(() => {
                let cumulativePercentage = 0
                return categories.map((category, index) => {
                  const segmentLength = (category.percentage / 100) * 188 // 2π * 30 ≈ 188
                  const offset = 188 - (cumulativePercentage / 100) * 188
                  cumulativePercentage += category.percentage

                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="30"
                      stroke={category.color.replace('bg-', '#')}
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray={`${segmentLength} 188`}
                      strokeDashoffset={offset}
                      className={category.color.replace('bg-', 'stroke-')}
                    />
                  )
                })
              })()}
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold">
                  {targetMonths} meses
                </div>
                <div className="text-xs text-muted-foreground">cobertura</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-2">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <span className="text-sm">{category.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">R$ {category.amount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{category.percentage}%</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <span className="font-bold">Dica:</span> A reserva deve cobrir apenas gastos essenciais.
            Revisar o orçamento pode reduzir o valor necessário.
          </p>
        </div>
      </div>
    )
  }

  const renderTimelineChart = () => {
    const timeline = []
    let currentAmount = currentSavings

    for (let month = 0; month <= Math.min(monthsToTarget, 24); month += 3) {
      const quarterContribution = monthlyContribution * 3
      timeline.push({
        quarter: `${month}m`,
        amount: currentAmount,
        monthsCovered: currentAmount / monthlyExpenses
      })
      currentAmount += quarterContribution
    }

    const maxAmount = Math.max(...timeline.map(t => t.amount))

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Crescimento da Reserva</h3>
          <Badge variant="outline">
            R$ {monthlyContribution.toLocaleString()}/mês
          </Badge>
        </div>

        <div className="relative h-48 bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-950/20 rounded-lg p-4">
          <div className="relative h-full flex items-end justify-between gap-1">
            {timeline.map((data, index) => {
              const height = (data.amount / maxAmount) * 100
              const isTarget = data.amount >= targetAmount

              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full h-full flex flex-col justify-end">
                    <div
                      className={`rounded-t-sm transition-all duration-300 ${
                        isTarget
                          ? 'bg-green-500 dark:bg-green-600'
                          : 'bg-blue-500 dark:bg-blue-600'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span className="text-xs text-muted-foreground mt-1">
                    {data.quarter}
                  </span>

                  {/* Tooltip on hover */}
                  <div className="invisible group-hover:visible absolute bottom-full mb-2 bg-popover border rounded-lg p-2 shadow-lg z-10 min-w-32">
                    <div className="text-xs space-y-1">
                      <p className="font-medium">Mês {data.quarter}</p>
                      <p>Reserva: <span className="font-mono">R$ {data.amount.toLocaleString()}</span></p>
                      <p>Cobertura: <span className="font-mono">{data.monthsCovered.toFixed(1)} meses</span></p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Target line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-green-500"
            style={{ bottom: `${(targetAmount / maxAmount) * 100 * 0.8 + 20}%` }}
          >
            <span className="absolute -top-6 right-0 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              Meta: {targetMonths} meses
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span>Em formação</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span>Meta atingida</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-green-500"></div>
            <span>Linha da meta</span>
          </div>
        </div>

        {monthsToTarget > 0 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">
              📅 Com aportes de R$ {monthlyContribution.toLocaleString()}/mês, você atingirá sua meta em{' '}
              <span className="font-bold">{Math.ceil(monthsToTarget)} meses</span>.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart Type Selector */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={chartType === 'progress' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('progress')}
          className="flex-1"
        >
          <Shield className="h-4 w-4 mr-1" />
          Status
        </Button>
        <Button
          variant={chartType === 'categories' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('categories')}
          className="flex-1"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          Gastos
        </Button>
        <Button
          variant={chartType === 'timeline' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('timeline')}
          className="flex-1"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Progresso
        </Button>
      </div>

      {/* Chart Content */}
      {chartType === 'progress' && renderProgressChart()}
      {chartType === 'categories' && renderCategoriesChart()}
      {chartType === 'timeline' && renderTimelineChart()}
    </div>
  )
}
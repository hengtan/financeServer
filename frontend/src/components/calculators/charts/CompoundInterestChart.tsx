import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, BarChart3, PieChart } from 'lucide-react'

interface CompoundInterestChartProps {
  principal: number
  monthlyContribution: number
  totalFinalValue: number
  totalInvested: number
  totalInterest: number
  timePeriod: number
  interestRate: number
}

export function CompoundInterestChart({
  principal,
  monthlyContribution,
  totalFinalValue,
  totalInvested,
  totalInterest,
  timePeriod,
  interestRate
}: CompoundInterestChartProps) {
  const [chartType, setChartType] = useState<'growth' | 'breakdown' | 'comparison'>('growth')

  // Simular crescimento ano a ano para o gráfico de linha
  const yearlyData: Array<{year: number, value: number, contributed: number, interest: number}> = []
  let currentValue = principal
  const monthlyRate = interestRate / 100 / 12
  let totalContributed = principal

  for (let year = 0; year <= timePeriod; year++) {
    const yearValue = year === 0 ? principal : currentValue
    yearlyData.push({
      year,
      value: yearValue,
      contributed: totalContributed,
      interest: yearValue - totalContributed
    })

    if (year < timePeriod) {
      // Simular 12 meses de crescimento
      for (let month = 0; month < 12; month++) {
        currentValue = currentValue * (1 + monthlyRate) + monthlyContribution
        totalContributed += monthlyContribution
      }
    }
  }

  const maxValue = Math.max(...yearlyData.map(d => d.value))

  const renderGrowthChart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Crescimento ao Longo do Tempo</h3>
        <Badge variant="outline">
          {interestRate}% a.a.
        </Badge>
      </div>

      <div className="relative h-48 bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-950/20 rounded-lg p-4">
        <div className="relative h-full flex items-end justify-between gap-1">
          {yearlyData.map((data, index) => {
            const height = (data.value / maxValue) * 100
            const contributedHeight = (data.contributed / maxValue) * 100

            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full h-full flex flex-col justify-end">
                  {/* Barra de contribuições */}
                  <div
                    className="bg-blue-300 dark:bg-blue-700 rounded-t-sm transition-all duration-300 group-hover:bg-blue-400 dark:group-hover:bg-blue-600"
                    style={{ height: `${contributedHeight}%` }}
                  />
                  {/* Barra de juros */}
                  <div
                    className="bg-green-500 dark:bg-green-600 rounded-t-sm transition-all duration-300 group-hover:bg-green-400 dark:group-hover:bg-green-500"
                    style={{ height: `${height - contributedHeight}%` }}
                  />
                </div>

                <span className="text-xs text-muted-foreground mt-1">
                  {index === 0 ? 'Início' : `${index}a`}
                </span>

                {/* Tooltip on hover */}
                <div className="invisible group-hover:visible absolute bottom-full mb-2 bg-popover border rounded-lg p-2 shadow-lg z-10 min-w-32">
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Ano {index}</p>
                    <p>Total: <span className="font-mono">R$ {data.value.toLocaleString()}</span></p>
                    <p>Investido: <span className="font-mono">R$ {data.contributed.toLocaleString()}</span></p>
                    <p>Juros: <span className="font-mono">R$ {data.interest.toLocaleString()}</span></p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-300 dark:bg-blue-700 rounded-sm"></div>
            <span>Contribuições</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-sm"></div>
            <span>Juros</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBreakdownChart = () => {
    const principalPercentage = (principal / totalFinalValue) * 100
    const contributionsPercentage = ((totalInvested - principal) / totalFinalValue) * 100
    const interestPercentage = (totalInterest / totalFinalValue) * 100

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Composição Final</h3>
          <Badge variant="outline">
            R$ {totalFinalValue.toLocaleString()}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Capital Inicial</span>
              <span>R$ {principal.toLocaleString()} ({principalPercentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${principalPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Aportes Mensais</span>
              <span>R$ {(totalInvested - principal).toLocaleString()} ({contributionsPercentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${contributionsPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Juros Compostos</span>
              <span>R$ {totalInterest.toLocaleString()} ({interestPercentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${interestPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            <span className="font-bold">{interestPercentage.toFixed(1)}%</span> do valor final veio dos juros compostos!
          </p>
        </div>
      </div>
    )
  }

  const renderComparisonChart = () => {
    const simpleInterestTotal = principal + (principal * (interestRate / 100) * timePeriod)
    const compoundAdvantage = totalFinalValue - simpleInterestTotal

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Juros Simples vs Compostos</h3>
          <Badge variant="outline" className="bg-green-100 text-green-700">
            +R$ {compoundAdvantage.toLocaleString()}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Juros Compostos</span>
              <span className="font-bold text-green-600">R$ {totalFinalValue.toLocaleString()}</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                  style={{ width: '100%' }}
                >
                  <span className="text-xs text-white font-medium">100%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Juros Simples</span>
              <span className="font-bold text-orange-600">R$ {simpleInterestTotal.toLocaleString()}</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                <div
                  className="bg-gradient-to-r from-orange-400 to-orange-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                  style={{ width: `${(simpleInterestTotal / totalFinalValue) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">
                    {((simpleInterestTotal / totalFinalValue) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Os juros compostos rendem <span className="font-bold">R$ {compoundAdvantage.toLocaleString()}</span> a mais
            que juros simples em {timePeriod} anos!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart Type Selector */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={chartType === 'growth' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('growth')}
          className="flex-1"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Crescimento
        </Button>
        <Button
          variant={chartType === 'breakdown' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('breakdown')}
          className="flex-1"
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          Composição
        </Button>
        <Button
          variant={chartType === 'comparison' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('comparison')}
          className="flex-1"
        >
          <PieChart className="h-4 w-4 mr-1" />
          Comparação
        </Button>
      </div>

      {/* Chart Content */}
      {chartType === 'growth' && renderGrowthChart()}
      {chartType === 'breakdown' && renderBreakdownChart()}
      {chartType === 'comparison' && renderComparisonChart()}
    </div>
  )
}
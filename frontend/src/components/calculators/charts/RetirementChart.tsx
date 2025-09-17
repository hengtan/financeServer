import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, Target } from 'lucide-react'

interface RetirementChartProps {
  currentAge: number
  retirementAge: number
  lifeExpectancy: number
  totalAccumulated: number
  valueNeeded: number
  monthlyExpenses: number
  inflationRate: number
  currentSavings: number
  monthlyContribution: number
}

export function RetirementChart({
  currentAge,
  retirementAge,
  lifeExpectancy,
  totalAccumulated,
  valueNeeded,
  monthlyExpenses,
  inflationRate,
  currentSavings,
  monthlyContribution
}: RetirementChartProps) {
  const [chartType, setChartType] = useState<'timeline' | 'progress' | 'scenarios'>('timeline')

  const yearsToRetirement = retirementAge - currentAge
  // const yearsInRetirement = lifeExpectancy - retirementAge

  const renderTimelineChart = () => {
    // Simular crescimento por década
    const decades: Array<{ageRange: string, value: number, phase: string, description: string}> = []
    let currentValue = currentSavings
    const monthlyRate = 0.08 / 12 // 8% ao ano

    for (let age = currentAge; age <= lifeExpectancy; age += 10) {
      const endAge = Math.min(age + 10, lifeExpectancy)
      const yearsInPeriod = endAge - age

      if (age < retirementAge) {
        // Fase de acumulação
        const monthsInPeriod = Math.min(yearsInPeriod * 12, (retirementAge - age) * 12)
        for (let month = 0; month < monthsInPeriod; month++) {
          currentValue = currentValue * (1 + monthlyRate) + monthlyContribution
        }
        decades.push({
          ageRange: `${age}-${endAge}`,
          value: currentValue,
          phase: 'accumulation',
          description: 'Acumulação'
        })
      } else {
        // Fase de aposentadoria
        const adjustedExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, age - retirementAge)
        const monthsInPeriod = yearsInPeriod * 12
        currentValue = Math.max(0, currentValue - (adjustedExpenses * monthsInPeriod))

        decades.push({
          ageRange: `${age}-${endAge}`,
          value: currentValue,
          phase: 'retirement',
          description: 'Aposentadoria'
        })
      }
    }

    const maxValue = Math.max(...decades.map(d => d.value))

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Linha do Tempo Financeira</h3>
          <Badge variant="outline">
            {currentAge} → {lifeExpectancy} anos
          </Badge>
        </div>

        <div className="space-y-3">
          {decades.map((decade, index) => {
            const barWidth = (decade.value / maxValue) * 100
            const isRetirement = decade.phase === 'retirement'

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{decade.ageRange} anos</span>
                    <Badge
                      variant={isRetirement ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {decade.description}
                    </Badge>
                  </div>
                  <span className="text-sm font-mono">
                    R$ {decade.value.toLocaleString()}
                  </span>
                </div>

                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        isRetirement
                          ? 'bg-gradient-to-r from-orange-400 to-red-500'
                          : 'bg-gradient-to-r from-blue-500 to-green-500'
                      }`}
                      style={{ width: `${Math.max(barWidth, 5)}%` }}
                    />
                  </div>

                  {index === decades.findIndex(d => d.phase === 'retirement') && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded border">
                        Aposentadoria
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-sm"></div>
            <span>Acumulação</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-sm"></div>
            <span>Aposentadoria</span>
          </div>
        </div>
      </div>
    )
  }

  const renderProgressChart = () => {
    const progressPercentage = Math.min((totalAccumulated / valueNeeded) * 100, 100)
    const isOnTrack = progressPercentage >= 100

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Progresso da Meta</h3>
          <Badge variant={isOnTrack ? "default" : "secondary"}>
            {progressPercentage.toFixed(1)}%
          </Badge>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${progressPercentage * 2.51} 251`}
                className={isOnTrack ? "text-green-500" : "text-orange-500"}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-lg font-bold ${isOnTrack ? 'text-green-500' : 'text-orange-500'}`}>
                  {progressPercentage.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">da meta</div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <span className="text-sm font-medium">Valor que terá:</span>
            <span className="font-bold text-green-600">R$ {totalAccumulated.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <span className="text-sm font-medium">Valor necessário:</span>
            <span className="font-bold text-blue-600">R$ {valueNeeded.toLocaleString()}</span>
          </div>

          <div className={`flex justify-between items-center p-3 rounded-lg ${
            isOnTrack
              ? 'bg-green-50 dark:bg-green-950/20'
              : 'bg-red-50 dark:bg-red-950/20'
          }`}>
            <span className="text-sm font-medium">
              {isOnTrack ? 'Superávit:' : 'Déficit:'}
            </span>
            <span className={`font-bold ${isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
              R$ {Math.abs(totalAccumulated - valueNeeded).toLocaleString()}
            </span>
          </div>
        </div>

        <div className={`mt-4 p-3 rounded-lg border ${
          isOnTrack
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
        }`}>
          <p className={`text-sm ${isOnTrack ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
            {isOnTrack
              ? `🎉 Parabéns! Você está no caminho certo para se aposentar com tranquilidade.`
              : `⚠️ Considere aumentar seus aportes ou revisar suas metas para garantir uma aposentadoria confortável.`
            }
          </p>
        </div>
      </div>
    )
  }

  const renderScenariosChart = () => {
    // Cenários: Pessimista (6%), Base (8%), Otimista (10%)
    const scenarios = [
      { name: 'Pessimista', rate: 0.06, color: 'from-red-400 to-red-500' },
      { name: 'Base', rate: 0.08, color: 'from-blue-400 to-blue-500' },
      { name: 'Otimista', rate: 0.10, color: 'from-green-400 to-green-500' }
    ]

    const scenarioResults = scenarios.map(scenario => {
      const monthlyRate = scenario.rate / 12
      const months = yearsToRetirement * 12

      const futureValue = currentSavings * Math.pow(1 + monthlyRate, months) +
        monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate

      return {
        ...scenario,
        value: futureValue
      }
    })

    const maxValue = Math.max(...scenarioResults.map(s => s.value))

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Cenários de Rentabilidade</h3>
          <Badge variant="outline">
            Em {yearsToRetirement} anos
          </Badge>
        </div>

        <div className="space-y-4">
          {scenarioResults.map((scenario, index) => {
            const barWidth = (scenario.value / maxValue) * 100
            const isEnough = scenario.value >= valueNeeded

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{scenario.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {(scenario.rate * 100).toFixed(0)}% a.a.
                    </Badge>
                    {isEnough && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                        ✓ Suficiente
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-mono">
                    R$ {scenario.value.toLocaleString()}
                  </span>
                </div>

                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full bg-gradient-to-r ${scenario.color} transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  {/* Goal line */}
                  <div
                    className="absolute top-0 w-1 h-4 bg-yellow-500"
                    style={{ left: `${(valueNeeded / maxValue) * 100}%` }}
                    title={`Meta: R$ ${valueNeeded.toLocaleString()}`}
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  {isEnough
                    ? `Superávit de R$ ${(scenario.value - valueNeeded).toLocaleString()}`
                    : `Falta R$ ${(valueNeeded - scenario.value).toLocaleString()}`
                  }
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-yellow-500"></div>
            <span>Meta necessária</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <span className="font-bold">Dica:</span> Diversificar investimentos pode ajudar a alcançar
            uma rentabilidade próxima ao cenário otimista com menor risco.
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
          variant={chartType === 'timeline' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('timeline')}
          className="flex-1"
        >
          <Clock className="h-4 w-4 mr-1" />
          Linha do Tempo
        </Button>
        <Button
          variant={chartType === 'progress' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('progress')}
          className="flex-1"
        >
          <Target className="h-4 w-4 mr-1" />
          Progresso
        </Button>
        <Button
          variant={chartType === 'scenarios' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setChartType('scenarios')}
          className="flex-1"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Cenários
        </Button>
      </div>

      {/* Chart Content */}
      {chartType === 'timeline' && renderTimelineChart()}
      {chartType === 'progress' && renderProgressChart()}
      {chartType === 'scenarios' && renderScenariosChart()}
    </div>
  )
}
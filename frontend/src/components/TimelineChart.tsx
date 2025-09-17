import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, TrendingUp, TrendingDown, Circle } from 'lucide-react'

export interface TransactionData {
  date: string
  income: number
  expenses: number
  balance: number
  description?: string
}

interface TimelineChartProps {
  className?: string
  data?: TransactionData[]
  title?: string
  description?: string
  showControls?: boolean
}

export const TimelineChart = ({
  className,
  data: externalData,
  title = "Evolução Financeira",
  description,
  showControls = true
}: TimelineChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month')
  const [selectedYear, setSelectedYear] = useState(2024)
  const [selectedMonth, setSelectedMonth] = useState(1)

  const generateDailyData = (year: number, month: number): TransactionData[] => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const dailyData: TransactionData[] = []

    for (let day = 1; day <= Math.min(daysInMonth, 15); day += 2) {
      const income = Math.random() * 500 + 200
      const expenses = Math.random() * 400 + 100
      const balance = income - expenses

      dailyData.push({
        date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        income,
        expenses,
        balance,
      })
    }

    return dailyData
  }

  const generateMonthlyData = (year: number): TransactionData[] => {
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]

    const monthlyData: TransactionData[] = []

    for (let month = 1; month <= 12; month++) {
      const income = Math.random() * 3000 + 4000
      const expenses = Math.random() * 2500 + 2000
      const balance = income - expenses

      monthlyData.push({
        date: `${year}-${month.toString().padStart(2, '0')}`,
        income,
        expenses,
        balance,
        description: monthNames[month - 1]
      })
    }

    return monthlyData
  }

  // Use external data if provided, otherwise generate mock data
  const data = useMemo(() => {
    if (externalData && externalData.length > 0) {
      return externalData
    }
    return selectedPeriod === 'month'
      ? generateDailyData(selectedYear, selectedMonth)
      : generateMonthlyData(selectedYear)
  }, [externalData, selectedPeriod, selectedYear, selectedMonth])

  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0)
  const maxExpense = Math.max(...data.map(d => d.expenses))
  const minExpense = Math.min(...data.map(d => d.expenses))

  const getDateLabel = (date: string, index: number) => {
    if (selectedPeriod === 'month') {
      const day = new Date(date).getDate()
      return `${day}`
    } else {
      return data[index].description || new Date(date).toLocaleDateString('pt-BR', { month: 'short' })
    }
  }

  const formatAmount = (amount: number) => {
    return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              {title}
            </CardTitle>
            <CardDescription>
              {description || (selectedPeriod === 'month'
                ? `Receitas vs Despesas - ${monthNames[selectedMonth - 1]} ${selectedYear}`
                : `Receitas vs Despesas - ${selectedYear}`
              )}
            </CardDescription>
          </div>
          {showControls && (
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Por Mês
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('year')}
              >
                Por Ano
              </Button>
            </div>
          )}
        </div>

        {showControls && selectedPeriod === 'month' && (
          <div className="flex gap-2 mt-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
            </select>
          </div>
        )}

        {showControls && selectedPeriod === 'year' && (
          <div className="mt-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
            </select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Chart Container */}
          <div className="relative bg-gradient-to-b from-gray-50/30 to-white dark:from-gray-800/10 dark:to-gray-900/5 rounded-xl border border-gray-200/50 dark:border-gray-700/30 p-6">

            {/* Horizontal Timeline */}
            <div className="relative h-48">
              {/* Main horizontal line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-full"></div>

              {/* Timeline Points */}
              {data.map((item, index) => {
                const percentage = (item.expenses / totalExpenses) * 100
                const leftPosition = (index / (data.length - 1)) * 100
                const isAbove = index % 2 === 0 // Alterna entre acima e abaixo
                // Increased line height range for better proportions
                const normalizedHeight = (item.expenses - minExpense) / (maxExpense - minExpense)
                const lineHeight = Math.max(normalizedHeight * 70 + 20, 25)

                return (
                  <div
                    key={index}
                    className="absolute top-1/2 transform -translate-y-1/2 group"
                    style={{ left: `${leftPosition}%` }}
                  >
                    {/* Vertical indicator line */}
                    <div
                      className={`absolute w-0.5 bg-gradient-to-${isAbove ? 'b' : 't'} from-red-500 to-red-300 rounded-full shadow-sm transition-all duration-300 group-hover:from-red-600 group-hover:to-red-400`}
                      style={{
                        height: `${lineHeight}px`,
                        transform: 'translateX(-50%)',
                        [isAbove ? 'bottom' : 'top']: '0px'
                      }}
                    ></div>

                    {/* Point circle at end of line */}
                    <div
                      className="absolute -translate-x-1/2"
                      style={{
                        [isAbove ? 'bottom' : 'top']: `${lineHeight}px`
                      }}
                    >
                      <div className="w-5 h-5 bg-white border-2 border-red-500 rounded-full shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-125 hover:border-red-600 hover:shadow-xl group-hover:border-red-600">
                        <div className="absolute inset-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full transition-all duration-200 group-hover:from-red-500 group-hover:to-red-700"></div>

                        {/* Pulse effect on hover */}
                        <div className="absolute inset-0 rounded-full border-2 border-red-400 scale-150 opacity-0 group-hover:opacity-30 group-hover:scale-200 transition-all duration-500"></div>
                      </div>

                      {/* Tooltip */}
                      <div className={`absolute ${isAbove ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10`}>
                        <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl border border-gray-700 min-w-max backdrop-blur-sm">
                          <div className="font-semibold text-center mb-1 text-gray-100">
                            {getDateLabel(item.date, index)}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between gap-3">
                              <span className="text-gray-300">Despesa:</span>
                              <span className="text-red-300 font-medium">{formatAmount(item.expenses)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-gray-300">Receita:</span>
                              <span className="text-emerald-300 font-medium">{formatAmount(item.income)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-gray-300">Participação:</span>
                              <span className="text-blue-300 font-medium">{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className={`absolute ${isAbove ? 'bottom-full' : 'top-full'} left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 ${isAbove ? 'border-b-4 border-b-gray-900 dark:border-b-gray-800' : 'border-t-4 border-t-gray-900 dark:border-t-gray-800'} border-transparent`}></div>
                        </div>
                      </div>
                    </div>

                    {/* Connection point on main line */}
                    <div className="absolute w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm transition-all duration-200 group-hover:bg-red-600 group-hover:scale-125"></div>
                  </div>
                )
              })}
            </div>

            {/* Date labels */}
            <div className="flex justify-between mt-8 px-2">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="text-xs text-muted-foreground font-medium text-center"
                  style={{ width: `${100 / data.length}%` }}
                >
                  {getDateLabel(item.date, index)}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-200 dark:border-red-700/30">
                <div className="w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded-full"></div>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">Despesas no período</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 rounded-lg border border-red-200/50 dark:border-red-700/30">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-700 dark:text-red-300">Total Despesas</p>
              <p className="text-lg font-bold text-red-800 dark:text-red-200">
                {formatAmount(totalExpenses)}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
              <Circle className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-blue-700 dark:text-blue-300">Média {selectedPeriod === 'month' ? 'Diária' : 'Mensal'}</p>
              <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {formatAmount(totalExpenses / data.length)}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-lg border border-yellow-200/50 dark:border-yellow-700/30">
              <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Maior Despesa</p>
              <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                {formatAmount(maxExpense)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/*
EXEMPLO DE USO COM DADOS EXTERNOS:

// Estrutura dos dados esperados
interface TransactionData {
  date: string        // formato: "2024-01-15" ou "2024-01"
  income: number      // valor das receitas
  expenses: number    // valor das despesas
  balance: number     // saldo (income - expenses)
  description?: string // descrição opcional (ex: "Janeiro", "15")
}

// Exemplo de uso simples (usando dados mock internos)
<TimelineChart />

// Exemplo de uso com dados do microserviço
const dadosDoMicroservico: TransactionData[] = [
  {
    date: "2024-01-01",
    income: 5000,
    expenses: 2500,
    balance: 2500,
    description: "Janeiro"
  },
  // ... mais dados
]

<TimelineChart
  data={dadosDoMicroservico}
  title="Análise Financeira Personalizada"
  description="Dados em tempo real do seu negócio"
  showControls={false}  // Remove controles de período se usando dados externos
  className="my-4"
/>

// Exemplo para dashboard sem controles
<TimelineChart
  data={transacoesDashboard}
  title="Overview Financeiro"
  showControls={false}
/>
*/
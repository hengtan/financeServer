import { useState, useCallback } from 'react'
import { CalculatorBase, CalculatorField, CalculatorResult } from './CalculatorBase'
import { RetirementChart } from './charts/RetirementChart'
import { PiggyBank } from 'lucide-react'

interface RetirementData {
  currentAge: number
  retirementAge: number
  currentSavings: number
  monthlyContribution: number
  monthlyExpenses: number
  inflationRate: number
  interestRate: number
  lifeExpectancy: number
}

export function RetirementCalculator() {
  const [data, setData] = useState<RetirementData>({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    monthlyExpenses: 5000,
    inflationRate: 4,
    interestRate: 8,
    lifeExpectancy: 85
  })

  const [results, setResults] = useState<CalculatorResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  const fields: CalculatorField[] = [
    {
      id: 'currentAge',
      label: 'Idade Atual',
      type: 'years',
      value: data.currentAge,
      min: 18,
      max: 80,
      description: 'Sua idade atual em anos'
    },
    {
      id: 'retirementAge',
      label: 'Idade de Aposentadoria',
      type: 'years',
      value: data.retirementAge,
      min: data.currentAge + 1,
      max: 85,
      description: 'Idade em que pretende se aposentar'
    },
    {
      id: 'currentSavings',
      label: 'Patrimônio Atual',
      type: 'currency',
      value: data.currentSavings,
      min: 0,
      description: 'Valor já acumulado para aposentadoria'
    },
    {
      id: 'monthlyContribution',
      label: 'Contribuição Mensal',
      type: 'currency',
      value: data.monthlyContribution,
      min: 0,
      description: 'Valor que irá investir mensalmente'
    },
    {
      id: 'monthlyExpenses',
      label: 'Gastos Mensais na Aposentadoria',
      type: 'currency',
      value: data.monthlyExpenses,
      min: 0,
      description: 'Quanto precisa por mês na aposentadoria'
    },
    {
      id: 'interestRate',
      label: 'Taxa de Retorno Anual',
      type: 'percentage',
      value: data.interestRate,
      min: 0,
      max: 50,
      step: 0.1,
      description: 'Rentabilidade esperada dos investimentos'
    },
    {
      id: 'inflationRate',
      label: 'Taxa de Inflação Anual',
      type: 'percentage',
      value: data.inflationRate,
      min: 0,
      max: 20,
      step: 0.1,
      description: 'Inflação esperada por ano'
    },
    {
      id: 'lifeExpectancy',
      label: 'Expectativa de Vida',
      type: 'years',
      value: data.lifeExpectancy,
      min: data.retirementAge + 1,
      max: 120,
      description: 'Idade até quando o dinheiro deve durar'
    }
  ]

  const calculateRetirement = useCallback(() => {
    setIsCalculating(true)

    // Simular loading
    setTimeout(() => {
      const yearsToRetirement = data.retirementAge - data.currentAge
      const yearsInRetirement = data.lifeExpectancy - data.retirementAge
      const monthsToRetirement = yearsToRetirement * 12
      const monthsInRetirement = yearsInRetirement * 12

      // Taxa mensal
      const monthlyRate = data.interestRate / 100 / 12
      const monthlyInflation = data.inflationRate / 100 / 12

      // Valor futuro do patrimônio atual
      const futureValueCurrentSavings = data.currentSavings * Math.pow(1 + monthlyRate, monthsToRetirement)

      // Valor futuro das contribuições mensais (anuidade)
      const futureValueContributions = monthsToRetirement > 0
        ? data.monthlyContribution * (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate
        : 0

      // Total acumulado na aposentadoria
      const totalAccumulated = futureValueCurrentSavings + futureValueContributions

      // Gastos mensais ajustados pela inflação
      const adjustedMonthlyExpenses = data.monthlyExpenses * Math.pow(1 + monthlyInflation, monthsToRetirement)

      // Valor necessário para sustentar os gastos (considerando rendimento na aposentadoria)
      const realReturnRate = (data.interestRate - data.inflationRate) / 100 / 12
      const valueNeeded = realReturnRate > 0
        ? adjustedMonthlyExpenses * (1 - Math.pow(1 + realReturnRate, -monthsInRetirement)) / realReturnRate
        : adjustedMonthlyExpenses * monthsInRetirement

      // Déficit ou superávit
      const surplus = totalAccumulated - valueNeeded

      // Contribuição necessária se há déficit
      let recommendedContribution = data.monthlyContribution
      if (surplus < 0) {
        const deficit = Math.abs(surplus)
        recommendedContribution = monthsToRetirement > 0
          ? (deficit * monthlyRate) / (Math.pow(1 + monthlyRate, monthsToRetirement) - 1)
          : deficit / monthsToRetirement
      }

      // Taxa de retirada segura (4% rule ajustada)
      const safeWithdrawalRate = 0.04 / 12 // 4% ao ano = 0.33% ao mês
      const safeMonthlyWithdrawal = totalAccumulated * safeWithdrawalRate

      setResults([
        {
          label: 'Total Acumulado na Aposentadoria',
          value: totalAccumulated,
          format: 'currency',
          highlight: true,
          description: `Em ${yearsToRetirement} anos de contribuições`
        },
        {
          label: 'Valor Necessário',
          value: valueNeeded,
          format: 'currency',
          description: `Para sustentar ${yearsInRetirement} anos de aposentadoria`
        },
        {
          label: surplus >= 0 ? 'Superávit' : 'Déficit',
          value: Math.abs(surplus),
          format: 'currency',
          description: surplus >= 0 ? 'Você terá dinheiro sobrando!' : 'Falta para atingir o objetivo'
        },
        {
          label: 'Retirada Mensal Segura',
          value: safeMonthlyWithdrawal,
          format: 'currency',
          description: 'Valor que pode retirar mensalmente (regra 4%)'
        },
        {
          label: 'Gastos Ajustados pela Inflação',
          value: adjustedMonthlyExpenses,
          format: 'currency',
          description: `Gastos mensais em ${yearsToRetirement} anos`
        },
        {
          label: surplus < 0 ? 'Contribuição Recomendada' : 'Contribuição Atual',
          value: surplus < 0 ? recommendedContribution : data.monthlyContribution,
          format: 'currency',
          description: surplus < 0 ? 'Para atingir o objetivo' : 'Está no caminho certo!'
        }
      ])

      setIsCalculating(false)
    }, 1000)
  }, [data])

  const handleFieldChange = useCallback((fieldId: string, value: number) => {
    setData(prev => ({ ...prev, [fieldId]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setData({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      monthlyExpenses: 5000,
      inflationRate: 4,
      interestRate: 8,
      lifeExpectancy: 85
    })
    setResults([])
  }, [])

  const tips = [
    'Comece a investir o quanto antes - o tempo é seu maior aliado devido aos juros compostos',
    'Considere aumentar suas contribuições mensais sempre que possível (promoções, bonus)',
    'A regra dos 4% sugere que você pode retirar 4% do patrimônio por ano com segurança',
    'Mantenha uma reserva de emergência separada do valor da aposentadoria',
    'Diversifique seus investimentos para reduzir riscos',
    'Revise seus cálculos periodicamente e ajuste conforme necessário'
  ]

  const chartComponent = results.length > 0 ? (
    <RetirementChart
      currentAge={data.currentAge}
      retirementAge={data.retirementAge}
      lifeExpectancy={data.lifeExpectancy}
      totalAccumulated={results.find(r => r.label === 'Total Acumulado na Aposentadoria')?.value || 0}
      valueNeeded={results.find(r => r.label === 'Valor Necessário')?.value || 0}
      monthlyExpenses={data.monthlyExpenses}
      inflationRate={data.inflationRate}
      currentSavings={data.currentSavings}
      monthlyContribution={data.monthlyContribution}
    />
  ) : undefined

  return (
    <CalculatorBase
      title="Calculadora de Aposentadoria"
      description="Calcule quanto você precisa investir para se aposentar com tranquilidade financeira"
      icon={<PiggyBank className="h-6 w-6" />}
      fields={fields}
      results={results}
      onFieldChange={handleFieldChange}
      onCalculate={calculateRetirement}
      onReset={handleReset}
      isCalculating={isCalculating}
      tips={tips}
      chartComponent={chartComponent}
    />
  )
}
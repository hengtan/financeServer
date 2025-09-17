import { useState, useCallback } from 'react'
import { CalculatorBase, CalculatorField, CalculatorResult } from './CalculatorBase'
import { CompoundInterestChart } from './charts/CompoundInterestChart'
import { BarChart3 } from 'lucide-react'

interface CompoundInterestData {
  principal: number
  monthlyContribution: number
  interestRate: number
  timePeriod: number
  timeUnit: 'months' | 'years'
  compoundingFrequency: number // 1=anual, 12=mensal, 365=diário
}

export function CompoundInterestCalculator() {
  const [data, setData] = useState<CompoundInterestData>({
    principal: 10000,
    monthlyContribution: 500,
    interestRate: 12,
    timePeriod: 5,
    timeUnit: 'years',
    compoundingFrequency: 12 // mensal por padrão
  })

  const [results, setResults] = useState<CalculatorResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  const fields: CalculatorField[] = [
    {
      id: 'principal',
      label: 'Valor Inicial',
      type: 'currency',
      value: data.principal,
      min: 0,
      description: 'Capital inicial investido'
    },
    {
      id: 'monthlyContribution',
      label: 'Aporte Mensal',
      type: 'currency',
      value: data.monthlyContribution,
      min: 0,
      description: 'Valor adicionado mensalmente'
    },
    {
      id: 'interestRate',
      label: 'Taxa de Juros Anual',
      type: 'percentage',
      value: data.interestRate,
      min: 0,
      max: 100,
      step: 0.01,
      description: 'Taxa de juros compostos ao ano'
    },
    {
      id: 'timePeriod',
      label: data.timeUnit === 'months' ? 'Período (Meses)' : 'Período (Anos)',
      type: data.timeUnit === 'months' ? 'months' : 'years',
      value: data.timePeriod,
      min: 1,
      max: data.timeUnit === 'months' ? 600 : 50,
      description: 'Tempo do investimento'
    }
  ]

  const calculateCompoundInterest = useCallback(() => {
    setIsCalculating(true)

    setTimeout(() => {
      // Converter tempo para anos se necessário
      const timeInYears = data.timeUnit === 'months' ? data.timePeriod / 12 : data.timePeriod
      const totalMonths = timeInYears * 12

      // Taxa de juros mensal
      const monthlyRate = data.interestRate / 100 / 12

      // Cálculo do valor futuro do principal com juros compostos
      // FV = PV(1 + r)^n
      const futureValuePrincipal = data.principal * Math.pow(1 + monthlyRate, totalMonths)

      // Cálculo do valor futuro dos aportes mensais (anuidade)
      // FV = PMT × [((1 + r)^n - 1) / r]
      let futureValueContributions = 0
      if (data.monthlyContribution > 0 && monthlyRate > 0) {
        futureValueContributions = data.monthlyContribution *
          (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate
      } else if (data.monthlyContribution > 0) {
        // Se taxa for 0, é apenas a soma dos aportes
        futureValueContributions = data.monthlyContribution * totalMonths
      }

      // Valor total final
      const totalFinalValue = futureValuePrincipal + futureValueContributions

      // Total investido
      const totalInvested = data.principal + (data.monthlyContribution * totalMonths)

      // Total de juros ganhos
      const totalInterest = totalFinalValue - totalInvested

      // Retorno percentual total
      const totalReturn = ((totalFinalValue - totalInvested) / totalInvested) * 100

      // Comparação com juros simples
      const simpleInterestTotal = data.principal + (data.principal * (data.interestRate / 100) * timeInYears)
      const compoundAdvantage = totalFinalValue - simpleInterestTotal

      // Valor só dos juros sobre principal (sem aportes)
      const interestOnPrincipal = futureValuePrincipal - data.principal

      // Valor só dos juros sobre aportes
      const interestOnContributions = futureValueContributions - (data.monthlyContribution * totalMonths)

      // Contribuição dos juros compostos
      const compoundingEffect = totalInterest - (data.principal * (data.interestRate / 100) * timeInYears)

      setResults([
        {
          label: 'Valor Final Total',
          value: totalFinalValue,
          format: 'currency',
          highlight: true,
          description: 'Principal + aportes + juros compostos'
        },
        {
          label: 'Total Investido',
          value: totalInvested,
          format: 'currency',
          description: 'Capital inicial + aportes mensais'
        },
        {
          label: 'Total de Juros Ganhos',
          value: totalInterest,
          format: 'currency',
          description: 'Ganho total com juros compostos'
        },
        {
          label: 'Retorno Percentual',
          value: totalReturn,
          format: 'percentage',
          description: 'Retorno sobre o valor investido'
        },
        {
          label: 'Juros sobre Capital Inicial',
          value: interestOnPrincipal,
          format: 'currency',
          description: `Juros apenas sobre os R$ ${data.principal.toLocaleString('pt-BR')}`
        },
        {
          label: 'Juros sobre Aportes',
          value: interestOnContributions,
          format: 'currency',
          description: 'Juros gerados pelos aportes mensais'
        },
        {
          label: 'Vantagem vs Juros Simples',
          value: compoundAdvantage,
          format: 'currency',
          description: 'Quanto a mais você ganha com juros compostos'
        },
        {
          label: 'Efeito dos Juros Compostos',
          value: compoundingEffect,
          format: 'currency',
          description: 'Ganho extra devido à capitalização'
        }
      ])

      setIsCalculating(false)
    }, 800)
  }, [data])

  const handleFieldChange = useCallback((fieldId: string, value: number) => {
    setData(prev => ({ ...prev, [fieldId]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setData({
      principal: 10000,
      monthlyContribution: 500,
      interestRate: 12,
      timePeriod: 5,
      timeUnit: 'years',
      compoundingFrequency: 12
    })
    setResults([])
  }, [])

  const tips = [
    'Juros compostos são "juros sobre juros" - o rendimento é reinvestido automaticamente',
    'Quanto mais tempo, maior a diferença entre juros simples e compostos',
    'Aportes regulares potencializam o efeito dos juros compostos',
    'Albert Einstein chamou os juros compostos de "oitava maravilha do mundo"',
    'Comece o quanto antes - o tempo é o fator mais importante',
    'Mesmo pequenos valores, com tempo e constância, podem gerar grandes resultados'
  ]

  // Preparar dados para o gráfico
  const totalInvested = data.principal + (data.monthlyContribution * data.timePeriod * 12)
  const timeInYears = data.timeUnit === 'months' ? data.timePeriod / 12 : data.timePeriod

  const chartComponent = results.length > 0 ? (
    <CompoundInterestChart
      principal={data.principal}
      monthlyContribution={data.monthlyContribution}
      totalFinalValue={results.find(r => r.label === 'Valor Final Total')?.value || 0}
      totalInvested={totalInvested}
      totalInterest={results.find(r => r.label === 'Total de Juros Ganhos')?.value || 0}
      timePeriod={timeInYears}
      interestRate={data.interestRate}
    />
  ) : undefined

  return (
    <CalculatorBase
      title="Calculadora de Juros Compostos"
      description="Simule o crescimento dos seus investimentos com o poder dos juros compostos e aportes regulares"
      icon={<BarChart3 className="h-6 w-6" />}
      fields={fields}
      results={results}
      onFieldChange={handleFieldChange}
      onCalculate={calculateCompoundInterest}
      onReset={handleReset}
      isCalculating={isCalculating}
      tips={tips}
      chartComponent={chartComponent}
    />
  )
}
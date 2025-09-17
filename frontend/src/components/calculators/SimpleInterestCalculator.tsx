import { useState, useCallback } from 'react'
import { CalculatorBase, CalculatorField, CalculatorResult } from './CalculatorBase'
import { SimpleInterestChart } from './charts/SimpleInterestChart'
import { TrendingUp } from 'lucide-react'

interface SimpleInterestData {
  principal: number
  interestRate: number
  timePeriod: number
  timeUnit: 'months' | 'years'
}

export function SimpleInterestCalculator() {
  const [data, setData] = useState<SimpleInterestData>({
    principal: 10000,
    interestRate: 10,
    timePeriod: 12,
    timeUnit: 'months'
  })

  const [results, setResults] = useState<CalculatorResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  const fields: CalculatorField[] = [
    {
      id: 'principal',
      label: 'Valor Principal (Capital)',
      type: 'currency',
      value: data.principal,
      min: 0,
      description: 'Valor inicial investido ou emprestado'
    },
    {
      id: 'interestRate',
      label: 'Taxa de Juros Anual',
      type: 'percentage',
      value: data.interestRate,
      min: 0,
      max: 100,
      step: 0.01,
      description: 'Taxa de juros simples ao ano'
    },
    {
      id: 'timePeriod',
      label: data.timeUnit === 'months' ? 'Período (Meses)' : 'Período (Anos)',
      type: data.timeUnit === 'months' ? 'months' : 'years',
      value: data.timePeriod,
      min: 1,
      max: data.timeUnit === 'months' ? 600 : 50,
      description: 'Tempo que o dinheiro ficará aplicado'
    },
    {
      id: 'timeUnit',
      label: `Unidade de Tempo (${data.timeUnit === 'months' ? 'Meses' : 'Anos'})`,
      type: 'number',
      value: data.timeUnit === 'months' ? 0 : 1,
      min: 0,
      max: 1,
      step: 1,
      description: 'Clique em 0 para Meses ou 1 para Anos'
    }
  ]

  const calculateSimpleInterest = useCallback(() => {
    setIsCalculating(true)

    setTimeout(() => {
      // Converter tempo para anos se necessário
      const timeInYears = data.timeUnit === 'months' ? data.timePeriod / 12 : data.timePeriod

      // Fórmula: J = P × i × t
      const interest = data.principal * (data.interestRate / 100) * timeInYears

      // Montante final: M = P + J
      const finalAmount = data.principal + interest

      // Taxa de retorno total
      const totalReturn = (interest / data.principal) * 100

      // Rendimento mensal médio
      const monthlyInterest = interest / (timeInYears * 12)

      // Rendimento diário médio
      const dailyInterest = interest / (timeInYears * 365)

      // Valor por período
      const interestPerPeriod = data.timeUnit === 'months'
        ? interest / data.timePeriod
        : interest / data.timePeriod

      setResults([
        {
          label: 'Valor dos Juros',
          value: interest,
          format: 'currency',
          highlight: true,
          description: 'Total de juros ganhos no período'
        },
        {
          label: 'Montante Final',
          value: finalAmount,
          format: 'currency',
          description: 'Capital inicial + juros'
        },
        {
          label: 'Retorno Total',
          value: totalReturn,
          format: 'percentage',
          description: 'Percentual de ganho sobre o capital'
        },
        {
          label: 'Rendimento Mensal',
          value: monthlyInterest,
          format: 'currency',
          description: 'Juros ganhos por mês (média)'
        },
        {
          label: 'Rendimento Diário',
          value: dailyInterest,
          format: 'currency',
          description: 'Juros ganhos por dia (média)'
        },
        {
          label: `Rendimento por ${data.timeUnit === 'months' ? 'Mês' : 'Ano'}`,
          value: interestPerPeriod,
          format: 'currency',
          description: `Juros ganhos a cada ${data.timeUnit === 'months' ? 'mês' : 'ano'}`
        }
      ])

      setIsCalculating(false)
    }, 500)
  }, [data])

  const handleFieldChange = useCallback((fieldId: string, value: number) => {
    if (fieldId === 'timeUnit') {
      // Converter o período quando mudar a unidade
      const newTimeUnit = value === 1 ? 'years' : 'months'
      let newTimePeriod = data.timePeriod

      if (data.timeUnit === 'months' && newTimeUnit === 'years') {
        newTimePeriod = data.timePeriod / 12
      } else if (data.timeUnit === 'years' && newTimeUnit === 'months') {
        newTimePeriod = data.timePeriod * 12
      }

      setData(prev => ({
        ...prev,
        timeUnit: newTimeUnit,
        timePeriod: Math.round(newTimePeriod * 100) / 100
      }))
    } else {
      setData(prev => ({ ...prev, [fieldId]: value }))
    }
  }, [data])

  const handleReset = useCallback(() => {
    setData({
      principal: 10000,
      interestRate: 10,
      timePeriod: 12,
      timeUnit: 'months'
    })
    setResults([])
  }, [])

  const tips = [
    'Juros simples são calculados apenas sobre o valor principal, não sobre os juros acumulados',
    'Fórmula: Juros = Principal × Taxa × Tempo (J = P × i × t)',
    'É menos vantajoso que juros compostos para investimentos de longo prazo',
    'Comum em empréstimos simples, financiamentos específicos e alguns títulos',
    'A taxa de juros deve estar sempre na mesma unidade de tempo (anual, mensal, etc.)',
    'Compare sempre com opções de juros compostos para tomar a melhor decisão'
  ]

  const chartComponent = results.length > 0 ? (
    <SimpleInterestChart
      principal={data.principal}
      interestRate={data.interestRate}
      timePeriod={data.timePeriod}
      timeUnit={data.timeUnit}
      totalInterest={results.find(r => r.label === 'Valor dos Juros')?.value || 0}
      finalAmount={results.find(r => r.label === 'Montante Final')?.value || 0}
    />
  ) : undefined

  return (
    <CalculatorBase
      title="Calculadora de Juros Simples"
      description="Calcule juros simples para investimentos e empréstimos onde os juros incidem apenas sobre o capital inicial"
      icon={<TrendingUp className="h-6 w-6" />}
      fields={fields}
      results={results}
      onFieldChange={handleFieldChange}
      onCalculate={calculateSimpleInterest}
      onReset={handleReset}
      isCalculating={isCalculating}
      tips={tips}
      chartComponent={chartComponent}
    />
  )
}
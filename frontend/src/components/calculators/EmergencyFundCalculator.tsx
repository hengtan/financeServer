import { useState, useCallback } from 'react'
import { CalculatorBase, CalculatorField, CalculatorResult } from './CalculatorBase'
import { EmergencyChart } from './charts/EmergencyChart'
import { Shield } from 'lucide-react'

interface EmergencyFundData {
  monthlyExpenses: number
  currentSavings: number
  monthlyContribution: number
  interestRate: number
  targetMonths: number
  dependents: number
  jobStability: 'high' | 'medium' | 'low'
  hasInsurance: boolean
}

export function EmergencyFundCalculator() {
  const [data, setData] = useState<EmergencyFundData>({
    monthlyExpenses: 5000,
    currentSavings: 10000,
    monthlyContribution: 500,
    interestRate: 1,
    targetMonths: 6,
    dependents: 0,
    jobStability: 'medium',
    hasInsurance: false
  })

  const [results, setResults] = useState<CalculatorResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  const fields: CalculatorField[] = [
    {
      id: 'monthlyExpenses',
      label: 'Gastos Mensais Essenciais',
      type: 'currency',
      value: data.monthlyExpenses,
      min: 0,
      description: 'Soma de todos os gastos essenciais mensais'
    },
    {
      id: 'currentSavings',
      label: 'Reserva Atual',
      type: 'currency',
      value: data.currentSavings,
      min: 0,
      description: 'Valor já guardado para emergências'
    },
    {
      id: 'monthlyContribution',
      label: 'Contribuição Mensal',
      type: 'currency',
      value: data.monthlyContribution,
      min: 0,
      description: 'Valor que consegue guardar por mês'
    },
    {
      id: 'targetMonths',
      label: 'Meses de Reserva Desejados',
      type: 'months',
      value: data.targetMonths,
      min: 3,
      max: 24,
      description: 'Quantos meses de gastos quer ter guardados'
    },
    {
      id: 'interestRate',
      label: 'Taxa de Rendimento Anual',
      type: 'percentage',
      value: data.interestRate,
      min: 0,
      max: 20,
      step: 0.1,
      description: 'Rendimento da conta poupança/CDB'
    },
    {
      id: 'dependents',
      label: 'Número de Dependentes',
      type: 'number',
      value: data.dependents,
      min: 0,
      max: 10,
      description: 'Quantas pessoas dependem da sua renda'
    }
  ]

  const calculateEmergencyFund = useCallback(() => {
    setIsCalculating(true)

    setTimeout(() => {
      // Ajustar recomendação baseado no perfil
      let recommendedMonths = data.targetMonths

      // Ajustes baseados na estabilidade do emprego
      if (data.jobStability === 'low') {
        recommendedMonths = Math.max(recommendedMonths, 12)
      } else if (data.jobStability === 'high') {
        recommendedMonths = Math.max(recommendedMonths, 3)
      }

      // Ajustes baseados em dependentes
      if (data.dependents > 0) {
        recommendedMonths += data.dependents * 1
      }

      // Ajustes baseados em seguros
      if (!data.hasInsurance) {
        recommendedMonths += 2
      }

      // Valor alvo da reserva
      const targetAmount = data.monthlyExpenses * recommendedMonths

      // Valor ainda necessário
      const amountNeeded = Math.max(0, targetAmount - data.currentSavings)

      // Tempo para atingir objetivo
      const monthlyRate = data.interestRate / 100 / 12
      let monthsToTarget = 0

      if (amountNeeded > 0 && data.monthlyContribution > 0) {
        if (monthlyRate > 0) {
          // Com rendimento
          const currentValue = data.currentSavings
          const monthlyPayment = data.monthlyContribution

          // Fórmula para valor futuro de anuidade + valor presente
          // FV = PV(1+r)^n + PMT[((1+r)^n - 1)/r]
          // Resolvemos para n (aproximação iterativa)
          let n = 1
          while (n <= 600) { // máximo 50 anos
            const futureValue = currentValue * Math.pow(1 + monthlyRate, n) +
              monthlyPayment * (Math.pow(1 + monthlyRate, n) - 1) / monthlyRate

            if (futureValue >= targetAmount) {
              monthsToTarget = n
              break
            }
            n++
          }
        } else {
          // Sem rendimento
          monthsToTarget = amountNeeded / data.monthlyContribution
        }
      }

      // Percentual atual da meta
      const currentPercentage = (data.currentSavings / targetAmount) * 100

      // Valor de emergência por categoria
      // const essentialExpenses = data.monthlyExpenses * 0.7 // 70% dos gastos são essenciais
      const medicalReserve = data.monthlyExpenses * 0.5 // Reserva médica
      // const transportReserve = data.monthlyExpenses * 0.2 // Transporte/imprevistos

      // Status da reserva
      let status = 'Crítico'
      // let statusColor = 'danger'

      if (currentPercentage >= 100) {
        status = 'Excelente'
        // statusColor = 'success'
      } else if (currentPercentage >= 75) {
        status = 'Bom'
        // statusColor = 'success'
      } else if (currentPercentage >= 50) {
        status = 'Regular'
        // statusColor = 'warning'
      } else if (currentPercentage >= 25) {
        status = 'Insuficiente'
        // statusColor = 'warning'
      }

      setResults([
        {
          label: 'Valor Alvo da Reserva',
          value: targetAmount,
          format: 'currency',
          highlight: true,
          description: `${recommendedMonths} meses de gastos essenciais`
        },
        {
          label: 'Ainda Falta Guardar',
          value: amountNeeded,
          format: 'currency',
          description: amountNeeded === 0 ? '✅ Meta atingida!' : 'Para completar a reserva'
        },
        {
          label: 'Progresso Atual',
          value: currentPercentage,
          format: 'percentage',
          description: `Status: ${status}`
        },
        {
          label: 'Tempo para Atingir Meta',
          value: monthsToTarget,
          format: 'months',
          description: monthsToTarget === 0 ? 'Meta já atingida' : 'Com sua contribuição atual'
        },
        {
          label: 'Reserva Mínima Recomendada',
          value: data.monthlyExpenses * 3,
          format: 'currency',
          description: '3 meses é o mínimo absoluto'
        },
        {
          label: 'Reserva para Emergências Médicas',
          value: medicalReserve * 6,
          format: 'currency',
          description: 'Para imprevistos de saúde'
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
      monthlyExpenses: 5000,
      currentSavings: 10000,
      monthlyContribution: 500,
      interestRate: 1,
      targetMonths: 6,
      dependents: 0,
      jobStability: 'medium',
      hasInsurance: false
    })
    setResults([])
  }, [])

  const tips = [
    'A reserva de emergência deve cobrir gastos essenciais: moradia, alimentação, transporte, saúde',
    'Mantenha o dinheiro em aplicações de alta liquidez (poupança, CDB com liquidez diária)',
    'Se você tem emprego estável, 3-6 meses pode ser suficiente. Se instável, considere 6-12 meses',
    'Não use a reserva de emergência para investimentos ou gastos não essenciais',
    'Revise seus gastos essenciais periodicamente - eles podem mudar com o tempo',
    'Considere ter uma reserva extra se você tem dependentes ou trabalha como autônomo'
  ]

  const chartComponent = results.length > 0 ? (
    <EmergencyChart
      monthlyExpenses={data.monthlyExpenses}
      currentSavings={data.currentSavings}
      targetAmount={results.find(r => r.label === 'Valor Alvo da Reserva')?.value || 0}
      monthsToTarget={results.find(r => r.label === 'Tempo para Atingir Meta')?.value || 0}
      monthlyContribution={data.monthlyContribution}
      targetMonths={data.targetMonths}
    />
  ) : undefined

  return (
    <CalculatorBase
      title="Calculadora de Reserva de Emergência"
      description="Descubra quanto você precisa guardar para estar preparado para imprevistos financeiros"
      icon={<Shield className="h-6 w-6" />}
      fields={fields}
      results={results}
      onFieldChange={handleFieldChange}
      onCalculate={calculateEmergencyFund}
      onReset={handleReset}
      isCalculating={isCalculating}
      tips={tips}
      chartComponent={chartComponent}
    />
  )
}
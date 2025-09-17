import { useState, useCallback } from 'react'
import { CalculatorBase, CalculatorField, CalculatorResult } from './CalculatorBase'
import { Target } from 'lucide-react'

interface FirstMillionData {
  currentAge: number
  currentSavings: number
  monthlyContribution: number
  interestRate: number
  targetAmount: number
  increaseRate: number // Taxa de aumento anual dos aportes
}

export function FirstMillionCalculator() {
  const [data, setData] = useState<FirstMillionData>({
    currentAge: 25,
    currentSavings: 5000,
    monthlyContribution: 1000,
    interestRate: 12,
    targetAmount: 1000000,
    increaseRate: 5 // 5% ao ano
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
      max: 65,
      description: 'Sua idade atual'
    },
    {
      id: 'currentSavings',
      label: 'Patrimônio Atual',
      type: 'currency',
      value: data.currentSavings,
      min: 0,
      description: 'Quanto já tem investido'
    },
    {
      id: 'monthlyContribution',
      label: 'Aporte Mensal Inicial',
      type: 'currency',
      value: data.monthlyContribution,
      min: 0,
      description: 'Valor que começará investindo por mês'
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
      id: 'targetAmount',
      label: 'Meta Financeira',
      type: 'currency',
      value: data.targetAmount,
      min: 100000,
      max: 10000000,
      description: 'Valor que deseja alcançar'
    },
    {
      id: 'increaseRate',
      label: 'Aumento Anual dos Aportes',
      type: 'percentage',
      value: data.increaseRate,
      min: 0,
      max: 20,
      step: 0.1,
      description: 'Quanto planeja aumentar os aportes por ano'
    }
  ]

  const calculateFirstMillion = useCallback(() => {
    setIsCalculating(true)

    setTimeout(() => {
      const monthlyRate = data.interestRate / 100 / 12
      const yearlyIncreaseRate = data.increaseRate / 100

      let currentValue = data.currentSavings
      let monthlyContrib = data.monthlyContribution
      let month = 0
      let totalContributed = data.currentSavings

      // Array para tracking do crescimento
      const growthByYear: Array<{year: number, value: number, contribution: number}> = []

      // Simular mês a mês até atingir a meta
      while (currentValue < data.targetAmount && month < 600) { // máximo 50 anos
        // Aplicar juros mensais
        currentValue = currentValue * (1 + monthlyRate)

        // Adicionar aporte mensal
        currentValue += monthlyContrib
        totalContributed += monthlyContrib

        month++

        // A cada 12 meses, aumentar o aporte
        if (month % 12 === 0) {
          const year = Math.floor(month / 12)
          growthByYear.push({
            year,
            value: currentValue,
            contribution: monthlyContrib
          })

          monthlyContrib = monthlyContrib * (1 + yearlyIncreaseRate)
        }
      }

      const yearsToTarget = month / 12
      const ageWhenAchieved = data.currentAge + yearsToTarget
      const totalInterest = currentValue - totalContributed

      // Cenários alternativos
      // Cenário 1: Sem aumento nos aportes
      let scenarioValue1 = data.currentSavings
      let monthsFlat = 0
      let totalContribFlat = data.currentSavings

      while (scenarioValue1 < data.targetAmount && monthsFlat < 600) {
        scenarioValue1 = scenarioValue1 * (1 + monthlyRate) + data.monthlyContribution
        totalContribFlat += data.monthlyContribution
        monthsFlat++
      }

      // Cenário 2: Dobrando o aporte inicial
      const doubleContribution = data.monthlyContribution * 2
      let scenarioValue2 = data.currentSavings
      let monthsDouble = 0

      while (scenarioValue2 < data.targetAmount && monthsDouble < 600) {
        scenarioValue2 = scenarioValue2 * (1 + monthlyRate) + doubleContribution
        monthsDouble++
      }

      // Análise do poder dos juros compostos
      const interestPercentage = (totalInterest / currentValue) * 100

      // Breakdown por décadas
      const breakdown = []
      let tempValue = data.currentSavings
      let tempContrib = data.monthlyContribution
      let tempTotalContrib = data.currentSavings

      for (let decade = 1; decade <= 4; decade++) {
        const monthsInDecade = Math.min(120, month - (decade - 1) * 120) // 10 anos = 120 meses
        if (monthsInDecade <= 0) break

        for (let m = 0; m < monthsInDecade; m++) {
          tempValue = tempValue * (1 + monthlyRate) + tempContrib
          tempTotalContrib += tempContrib

          if ((((decade - 1) * 120) + m + 1) % 12 === 0) {
            tempContrib = tempContrib * (1 + yearlyIncreaseRate)
          }
        }

        breakdown.push({
          decade: decade * 10,
          value: tempValue,
          totalContrib: tempTotalContrib
        })
      }

      setResults([
        {
          label: 'Tempo para Atingir Meta',
          value: yearsToTarget,
          format: 'years',
          highlight: true,
          description: month >= 600 ? 'Meta não atingida em 50 anos' : `Aos ${Math.floor(ageWhenAchieved)} anos`
        },
        {
          label: 'Valor Final Alcançado',
          value: currentValue,
          format: 'currency',
          description: 'Patrimônio total acumulado'
        },
        {
          label: 'Total Investido',
          value: totalContributed,
          format: 'currency',
          description: 'Soma de todos os aportes'
        },
        {
          label: 'Ganho com Juros Compostos',
          value: totalInterest,
          format: 'currency',
          description: `${interestPercentage.toFixed(1)}% do valor final`
        },
        {
          label: 'Aporte Final (Último Ano)',
          value: monthlyContrib,
          format: 'currency',
          description: 'Valor do aporte no último ano'
        },
        {
          label: 'Sem Aumento de Aportes',
          value: monthsFlat / 12,
          format: 'years',
          description: `${(monthsFlat / 12 - yearsToTarget).toFixed(1)} anos a mais`
        },
        {
          label: 'Dobrando Aporte Inicial',
          value: monthsDouble / 12,
          format: 'years',
          description: `${(yearsToTarget - monthsDouble / 12).toFixed(1)} anos a menos`
        },
        {
          label: 'Crescimento nos Primeiros 10 Anos',
          value: breakdown[0]?.value || 0,
          format: 'currency',
          description: 'Base sólida para aceleração'
        }
      ])

      setIsCalculating(false)
    }, 1200)
  }, [data])

  const handleFieldChange = useCallback((fieldId: string, value: number) => {
    setData(prev => ({ ...prev, [fieldId]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setData({
      currentAge: 25,
      currentSavings: 5000,
      monthlyContribution: 1000,
      interestRate: 12,
      targetAmount: 1000000,
      increaseRate: 5
    })
    setResults([])
  }, [])

  const tips = [
    'Comece cedo: cada ano de atraso pode significar anos a mais para atingir a meta',
    'Aumente seus aportes gradualmente: promoções, bônus e aumentos salariais',
    'Mantenha disciplina e consistência - é melhor R$500 todo mês que R$6000 uma vez por ano',
    'Reinvista todos os dividendos e rendimentos para maximizar os juros compostos',
    'Considere diversificar entre ações, FIIs, renda fixa e fundos internacionais',
    'Revise e ajuste sua estratégia a cada 6 meses conforme sua realidade financeira muda'
  ]

  return (
    <CalculatorBase
      title="Calculadora do Primeiro Milhão"
      description="Descubra quando você alcançará sua independência financeira com aportes regulares e juros compostos"
      icon={<Target className="h-6 w-6" />}
      fields={fields}
      results={results}
      onFieldChange={handleFieldChange}
      onCalculate={calculateFirstMillion}
      onReset={handleReset}
      isCalculating={isCalculating}
      tips={tips}
    />
  )
}
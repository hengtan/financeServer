import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calculator,
  PiggyBank,
  Shield,
  TrendingUp,
  BarChart3,
  Target,
  ArrowRight,
  Lightbulb,
  Clock,
  DollarSign
} from 'lucide-react'

import { RetirementCalculator } from '@/components/calculators/RetirementCalculator'
import { EmergencyFundCalculator } from '@/components/calculators/EmergencyFundCalculator'
import { SimpleInterestCalculator } from '@/components/calculators/SimpleInterestCalculator'
import { CompoundInterestCalculator } from '@/components/calculators/CompoundInterestCalculator'
import { FirstMillionCalculator } from '@/components/calculators/FirstMillionCalculator'

export const CalculatorsPage = () => {
  usePageTitle('Calculadoras Financeiras')

  const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null)

  const calculators = [
    {
      id: 'retirement',
      name: 'Aposentadoria',
      description: 'Calcule quanto investir para se aposentar com tranquilidade',
      icon: PiggyBank,
      color: 'bg-green-500',
      difficulty: 'Avançada',
      time: '5-10 min',
      category: 'Planejamento',
      highlights: ['Inflação', 'Expectativa de vida', 'Taxa de retirada'],
      component: RetirementCalculator
    },
    {
      id: 'emergency',
      name: 'Reserva de Emergência',
      description: 'Descubra quanto guardar para imprevistos financeiros',
      icon: Shield,
      color: 'bg-blue-500',
      difficulty: 'Básica',
      time: '3-5 min',
      category: 'Segurança',
      highlights: ['Perfil de risco', 'Dependentes', 'Estabilidade'],
      component: EmergencyFundCalculator
    },
    {
      id: 'simple-interest',
      name: 'Juros Simples',
      description: 'Calcule rendimentos de investimentos com juros simples',
      icon: TrendingUp,
      color: 'bg-orange-500',
      difficulty: 'Básica',
      time: '2-3 min',
      category: 'Investimentos',
      highlights: ['Fórmula básica', 'Comparação', 'Rendimento linear'],
      component: SimpleInterestCalculator
    },
    {
      id: 'compound-interest',
      name: 'Juros Compostos',
      description: 'Simule o poder dos juros compostos com aportes regulares',
      icon: BarChart3,
      color: 'bg-purple-500',
      difficulty: 'Intermediária',
      time: '3-5 min',
      category: 'Investimentos',
      highlights: ['Aportes mensais', 'Capitalização', 'Longo prazo'],
      component: CompoundInterestCalculator
    },
    {
      id: 'first-million',
      name: 'Primeiro Milhão',
      description: 'Descubra quando alcançará sua independência financeira',
      icon: Target,
      color: 'bg-red-500',
      difficulty: 'Avançada',
      time: '5-8 min',
      category: 'Objetivos',
      highlights: ['Meta personalizada', 'Crescimento de aportes', 'Cenários'],
      component: FirstMillionCalculator
    }
  ]

  const selectedCalc = calculators.find(calc => calc.id === selectedCalculator)

  if (selectedCalculator && selectedCalc) {
    const CalculatorComponent = selectedCalc.component
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedCalculator(null)}
              className="mb-4"
            >
              ← Voltar às Calculadoras
            </Button>
          </div>
          <CalculatorComponent />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Calculadoras Financeiras</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramentas profissionais para planejar seu futuro financeiro com precisão
          </p>
        </div>

        {/* Categories Filter */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="Planejamento">Planejamento</TabsTrigger>
            <TabsTrigger value="Segurança">Segurança</TabsTrigger>
            <TabsTrigger value="Investimentos">Investimentos</TabsTrigger>
            <TabsTrigger value="Objetivos">Objetivos</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            <CalculatorGrid calculators={calculators} onSelect={setSelectedCalculator} />
          </TabsContent>

          {['Planejamento', 'Segurança', 'Investimentos', 'Objetivos'].map(category => (
            <TabsContent key={category} value={category} className="mt-8">
              <CalculatorGrid
                calculators={calculators.filter(calc => calc.category === category)}
                onSelect={setSelectedCalculator}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Educational Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Por que usar calculadoras financeiras?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">Planejamento Preciso</h3>
                <p className="text-sm text-muted-foreground">
                  Tome decisões baseadas em dados concretos e projeções realistas
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">Metas Claras</h3>
                <p className="text-sm text-muted-foreground">
                  Defina objetivos específicos e acompanhe seu progresso
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">Economia de Tempo</h3>
                <p className="text-sm text-muted-foreground">
                  Calcule cenários complexos em minutos, não horas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface CalculatorGridProps {
  calculators: any[]
  onSelect: (id: string) => void
}

function CalculatorGrid({ calculators, onSelect }: CalculatorGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {calculators.map((calculator) => {
        const IconComponent = calculator.icon
        return (
          <Card
            key={calculator.id}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
            onClick={() => onSelect(calculator.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-3 ${calculator.color} text-white`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {calculator.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {calculator.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {calculator.description}
              </p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Highlights */}
                <div className="flex flex-wrap gap-1">
                  {calculator.highlights.map((highlight: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {calculator.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {calculator.category}
                  </div>
                </div>

                {/* CTA */}
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Usar Calculadora
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingUp,
  Activity,
  AreaChart as AreaChartIcon,
  Donut,
  Settings
} from 'lucide-react'
// import { BarChart as BarChartComponent } from './BarChart'
import { LineChart as LineChartComponent } from './LineChart'
import { PieChart as PieChartComponent } from './PieChart'
import { DonutChart as DonutChartComponent } from './DonutChart'
// import { AreaChart as AreaChartComponent } from './AreaChart'
import { TrendChart as TrendChartComponent } from './TrendChart'

// Temporary placeholder components
const PlaceholderChart = ({ title }: { title: string }) => (
  <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg">
    <div className="text-gray-500">
      <p className="font-medium">{title}</p>
      <p className="text-sm">Em desenvolvimento...</p>
    </div>
  </div>
)

const BarChartComponent = () => <PlaceholderChart title="Gráfico de Barras" />
const AreaChartComponent = () => <PlaceholderChart title="Gráfico de Área" />

export interface ChartType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType<any>
}

export interface ChartSelectorProps {
  title?: string
  description?: string
  chartTypes: ChartType[]
  defaultChartType?: string
  onChartChange?: (chartType: string) => void
  data: any
  className?: string
}

export const ChartSelector: React.FC<ChartSelectorProps> = ({
  title = "Visualização de Dados",
  description = "Escolha o tipo de gráfico que melhor representa seus dados",
  chartTypes,
  defaultChartType,
  onChartChange,
  data,
  className = ""
}) => {
  const [selectedChartType, setSelectedChartType] = useState(
    defaultChartType || chartTypes[0]?.id || ''
  )

  const handleChartChange = (chartType: string) => {
    setSelectedChartType(chartType)
    if (onChartChange) {
      onChartChange(chartType)
    }
  }

  const currentChart = chartTypes.find(chart => chart.id === selectedChartType)
  const ChartComponent = currentChart?.component

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedChartType} onValueChange={handleChartChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o gráfico" />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((chart) => (
                  <SelectItem key={chart.id} value={chart.id}>
                    <div className="flex items-center gap-2">
                      {chart.icon}
                      <span>{chart.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[300px] w-full">
          {ChartComponent ? (
            <ChartComponent
              data={data}
              type={selectedChartType}
              {...(currentChart?.id === 'donut' && { innerRadius: 60 })}
              {...(currentChart?.id === 'area' && { fillOpacity: 0.3 })}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Carregando gráfico...</p>
            </div>
          )}
        </div>
        {currentChart && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>{currentChart.name}:</strong> {currentChart.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hook personalizado para gerenciar tipos de gráfico
export const useChartTypes = () => {
  const [availableCharts] = useState<ChartType[]>([
    {
      id: 'bar',
      name: 'Gráfico de Barras',
      description: 'Ideal para comparar valores entre diferentes categorias',
      icon: <BarChart3 className="h-4 w-4" />,
      component: BarChartComponent
    },
    {
      id: 'line',
      name: 'Gráfico de Linhas',
      description: 'Perfeito para mostrar tendências ao longo do tempo',
      icon: <LineChartIcon className="h-4 w-4" />,
      component: LineChartComponent
    },
    {
      id: 'pie',
      name: 'Gráfico de Pizza',
      description: 'Mostra proporções e distribuição percentual dos dados',
      icon: <PieChartIcon className="h-4 w-4" />,
      component: PieChartComponent
    },
    {
      id: 'donut',
      name: 'Gráfico de Donut',
      description: 'Similar ao gráfico de pizza, mas com centro vazio para informações extras',
      icon: <Donut className="h-4 w-4" />,
      component: DonutChartComponent
    },
    {
      id: 'area',
      name: 'Gráfico de Área',
      description: 'Combina linha com preenchimento, ideal para mostrar volume ao longo do tempo',
      icon: <AreaChartIcon className="h-4 w-4" />,
      component: AreaChartComponent
    },
    {
      id: 'trend',
      name: 'Análise de Tendência',
      description: 'Mostra direção e força das tendências com indicadores visuais',
      icon: <TrendingUp className="h-4 w-4" />,
      component: TrendChartComponent
    }
  ])

  const getChartByCategory = (category: 'expenses' | 'income' | 'balance' | 'goals') => {
    const categoryCharts = {
      expenses: ['bar', 'pie', 'donut'],
      income: ['line', 'area', 'trend'],
      balance: ['line', 'area', 'trend'],
      goals: ['bar', 'line', 'trend']
    }

    return availableCharts.filter(chart =>
      categoryCharts[category]?.includes(chart.id)
    )
  }

  const getRecommendedChart = (dataType: string, dataLength: number) => {
    if (dataType === 'categorical' && dataLength <= 7) {
      return 'pie'
    }
    if (dataType === 'time-series') {
      return 'line'
    }
    if (dataType === 'comparison') {
      return 'bar'
    }
    if (dataType === 'trend') {
      return 'trend'
    }
    return 'bar' // default
  }

  return {
    availableCharts,
    getChartByCategory,
    getRecommendedChart
  }
}
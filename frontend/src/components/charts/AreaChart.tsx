import React from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export interface AreaChartData {
  name: string
  value?: number
  [key: string]: any
}

export interface AreaChartProps {
  data: AreaChartData[]
  dataKeys?: string[]
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
  curved?: boolean
  height?: number
  currency?: string
  animate?: boolean
  fillOpacity?: number
  gradientColors?: { [key: string]: [string, string] }
}

const defaultColors = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6b7280'  // Gray
]

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  dataKeys = ['value'],
  colors = defaultColors,
  showGrid = true,
  showLegend = false,
  stacked = false,
  curved = true,
  height = 300,
  currency = 'BRL',
  animate = true,
  fillOpacity = 0.3,
  gradientColors
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.dataKey === 'value' ? '' : `${entry.dataKey}: `}
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const getGradientId = (key: string) => `gradient-${key}`

  const renderGradients = () => {
    if (!gradientColors) return null

    return (
      <defs>
        {dataKeys.map((key, index) => {
          const [startColor, endColor] = gradientColors[key] || [colors[index], colors[index]]
          return (
            <linearGradient
              key={key}
              id={getGradientId(key)}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={startColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={endColor} stopOpacity={0.1} />
            </linearGradient>
          )
        })}
      </defs>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {renderGradients()}

        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            className="opacity-30"
          />
        )}

        <XAxis
          dataKey="name"
          className="text-xs fill-muted-foreground"
          angle={data.length > 8 ? -45 : 0}
          textAnchor={data.length > 8 ? 'end' : 'middle'}
          height={data.length > 8 ? 60 : 30}
        />

        <YAxis
          tickFormatter={formatNumber}
          className="text-xs fill-muted-foreground"
        />

        <Tooltip content={<CustomTooltip />} />

        {showLegend && <Legend />}

        {dataKeys.map((key, index) => (
          <Area
            key={key}
            type={curved ? "monotone" : "linear"}
            dataKey={key}
            stackId={stacked ? "1" : key}
            stroke={colors[index % colors.length]}
            fill={gradientColors?.[key] ? `url(#${getGradientId(key)})` : colors[index % colors.length]}
            fillOpacity={fillOpacity}
            strokeWidth={2}
            animationDuration={animate ? 750 : 0}
            dot={{
              fill: colors[index % colors.length],
              strokeWidth: 2,
              r: 4
            }}
            activeDot={{
              r: 6,
              fill: colors[index % colors.length],
              stroke: '#fff',
              strokeWidth: 2
            }}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

// Variações especializadas do gráfico de área
export const IncomeAreaChart: React.FC<Omit<AreaChartProps, 'colors' | 'gradientColors'>> = (props) => (
  <AreaChart
    {...props}
    colors={['#10b981']}
    gradientColors={{
      value: ['#10b981', '#059669']
    }}
    fillOpacity={0.4}
  />
)

export const ExpenseAreaChart: React.FC<Omit<AreaChartProps, 'colors' | 'gradientColors'>> = (props) => (
  <AreaChart
    {...props}
    colors={['#ef4444']}
    gradientColors={{
      value: ['#ef4444', '#dc2626']
    }}
    fillOpacity={0.4}
  />
)

export const StackedAreaChart: React.FC<AreaChartProps> = (props) => (
  <AreaChart
    {...props}
    dataKeys={['income', 'expenses']}
    colors={['#10b981', '#ef4444']}
    gradientColors={{
      income: ['#10b981', '#059669'],
      expenses: ['#ef4444', '#dc2626']
    }}
    stacked={true}
    showLegend={true}
    fillOpacity={0.6}
  />
)

export const ComparisonAreaChart: React.FC<AreaChartProps> = (props) => (
  <AreaChart
    {...props}
    dataKeys={['income', 'expenses']}
    colors={['#10b981', '#ef4444']}
    gradientColors={{
      income: ['#10b981', '#059669'],
      expenses: ['#ef4444', '#dc2626']
    }}
    stacked={false}
    showLegend={true}
    fillOpacity={0.3}
  />
)

export const NetWorthAreaChart: React.FC<Omit<AreaChartProps, 'colors' | 'gradientColors'>> = (props) => {
  const getNetWorthColors = (data: AreaChartData[]) => {
    const hasNegative = data.some(item => (item.value || 0) < 0)
    return hasNegative ? ['#f59e0b'] : ['#10b981']
  }

  const getNetWorthGradient = (data: AreaChartData[]) => {
    const hasNegative = data.some(item => (item.value || 0) < 0)
    return hasNegative
      ? { value: ['#f59e0b', '#d97706'] }
      : { value: ['#10b981', '#059669'] }
  }

  return (
    <AreaChart
      {...props}
      colors={getNetWorthColors(props.data)}
      gradientColors={getNetWorthGradient(props.data)}
      fillOpacity={0.4}
      curved={true}
    />
  )
}
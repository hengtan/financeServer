import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Dot
} from 'recharts'

export interface LineChartData {
  name: string
  value?: number
  [key: string]: any
}

export interface LineChartProps {
  data: LineChartData[]
  dataKeys?: string[]
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
  showDots?: boolean
  curved?: boolean
  height?: number
  currency?: string
  animate?: boolean
  strokeWidth?: number
  dashArray?: string
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

export const LineChart: React.FC<LineChartProps> = ({
  data,
  dataKeys = ['value'],
  colors = defaultColors,
  showGrid = true,
  showLegend = false,
  showDots = true,
  curved = true,
  height = 300,
  currency = 'BRL',
  animate = true,
  strokeWidth = 2,
  dashArray
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

  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props

    if (!showDots) return null

    // Highlight specific conditions
    const isHighValue = payload[dataKey] > 1000
    const dotColor = isHighValue ? '#ef4444' : colors[0]

    return (
      <Dot
        cx={cx}
        cy={cy}
        r={isHighValue ? 4 : 3}
        fill={dotColor}
        stroke={dotColor}
        strokeWidth={1}
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
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
          <Line
            key={key}
            type={curved ? "monotone" : "linear"}
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            dot={<CustomDot dataKey={key} />}
            activeDot={{
              r: 6,
              fill: colors[index % colors.length],
              stroke: '#fff',
              strokeWidth: 2
            }}
            animationDuration={animate ? 750 : 0}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

// Variações especializadas do gráfico de linha
export const TrendLineChart: React.FC<Omit<LineChartProps, 'colors' | 'curved'>> = (props) => (
  <LineChart
    {...props}
    colors={['#10b981', '#3b82f6']}
    curved={true}
    showDots={false}
    strokeWidth={3}
  />
)

export const ComparisonLineChart: React.FC<LineChartProps> = (props) => (
  <LineChart
    {...props}
    dataKeys={['income', 'expenses']}
    colors={['#10b981', '#ef4444']}
    showLegend={true}
    strokeWidth={2}
  />
)

export const DashedLineChart: React.FC<Omit<LineChartProps, 'dashArray'>> = (props) => (
  <LineChart
    {...props}
    dashArray="5 5"
    showDots={false}
    strokeWidth={2}
  />
)

export const BalanceLineChart: React.FC<Omit<LineChartProps, 'colors'>> = (props) => {
  const getBalanceColor = (data: LineChartData[]) => {
    const lastValue = data[data.length - 1]?.value || 0
    return lastValue >= 0 ? ['#10b981'] : ['#ef4444']
  }

  return (
    <LineChart
      {...props}
      colors={getBalanceColor(props.data)}
      curved={true}
      strokeWidth={3}
    />
  )
}
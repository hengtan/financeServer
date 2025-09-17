import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

export interface BarChartData {
  name: string
  value: number
  category?: string
  color?: string
  [key: string]: any
}

export interface BarChartProps {
  data: BarChartData[]
  type?: string
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
  horizontal?: boolean
  stacked?: boolean
  dataKeys?: string[]
  height?: number
  currency?: string
  animate?: boolean
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

export const BarChart: React.FC<BarChartProps> = ({
  data,
  type = 'bar',
  colors = defaultColors,
  showGrid = true,
  showLegend = false,
  horizontal = false,
  stacked = false,
  dataKeys = ['value'],
  height = 300,
  currency = 'BRL',
  animate = true
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

  const getBarColor = (index: number, item: BarChartData) => {
    if (item.color) return item.color
    return colors[index % colors.length]
  }

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
          <XAxis
            type="number"
            tickFormatter={formatNumber}
            className="text-xs fill-muted-foreground"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            className="text-xs fill-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}

          {dataKeys.map((key, keyIndex) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[keyIndex % colors.length]}
              radius={[0, 4, 4, 0]}
              animationDuration={animate ? 750 : 0}
            >
              {key === 'value' && data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index, entry)} />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
        <XAxis
          dataKey="name"
          className="text-xs fill-muted-foreground"
          angle={data.length > 6 ? -45 : 0}
          textAnchor={data.length > 6 ? 'end' : 'middle'}
          height={data.length > 6 ? 60 : 30}
        />
        <YAxis
          tickFormatter={formatNumber}
          className="text-xs fill-muted-foreground"
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}

        {dataKeys.map((key, keyIndex) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[keyIndex % colors.length]}
            radius={[4, 4, 0, 0]}
            animationDuration={animate ? 750 : 0}
            stackId={stacked ? 'stack' : undefined}
          >
            {key === 'value' && data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index, entry)} />
            ))}
          </Bar>
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

// Variações especializadas do gráfico de barras
export const ExpenseBarChart: React.FC<Omit<BarChartProps, 'colors'>> = (props) => (
  <BarChart
    {...props}
    colors={['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']}
  />
)

export const IncomeBarChart: React.FC<Omit<BarChartProps, 'colors'>> = (props) => (
  <BarChart
    {...props}
    colors={['#10b981', '#059669', '#047857', '#065f46', '#064e3b']}
  />
)

export const ComparisonBarChart: React.FC<BarChartProps> = (props) => (
  <BarChart
    {...props}
    dataKeys={['income', 'expenses']}
    showLegend={true}
    colors={['#10b981', '#ef4444']}
    stacked={false}
  />
)
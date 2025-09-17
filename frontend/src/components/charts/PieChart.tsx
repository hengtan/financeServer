import React from 'react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'

export interface PieChartData {
  name: string
  value: number
  color?: string
  [key: string]: any
}

export interface PieChartProps {
  data: PieChartData[]
  colors?: string[]
  showLegend?: boolean
  outerRadius?: number
  height?: number
  currency?: string
  animate?: boolean
  labelFormat?: 'percentage' | 'value' | 'name'
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

export const PieChart: React.FC<PieChartProps> = ({
  data,
  colors = defaultColors,
  showLegend = true,
  outerRadius = 120,
  height = 300,
  currency = 'BRL',
  animate = true,
  labelFormat = 'percentage'
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(value)
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  const formatLabel = (entry: PieChartData, percent: number) => {
    switch (labelFormat) {
      case 'percentage':
        return `${(percent * 100).toFixed(1)}%`
      case 'value':
        return formatCurrency(entry.value)
      case 'name':
        return entry.name
      default:
        return `${(percent * 100).toFixed(1)}%`
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalValue) * 100).toFixed(1)

      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{data.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: data.color || payload[0].color }}
            />
            <span className="text-sm text-muted-foreground">
              {formatCurrency(data.value)} ({percentage}%)
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, ...entry }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices smaller than 5%

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {formatLabel(entry, percent)}
      </text>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          animationDuration={animate ? 750 : 0}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }} className="text-sm">
                {value}
              </span>
            )}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

// Variações especializadas do gráfico de pizza
export const ExpensePieChart: React.FC<Omit<PieChartProps, 'colors'>> = (props) => (
  <PieChart
    {...props}
    colors={['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']}
  />
)

export const IncomePieChart: React.FC<Omit<PieChartProps, 'colors'>> = (props) => (
  <PieChart
    {...props}
    colors={['#10b981', '#059669', '#047857', '#065f46', '#064e3b']}
  />
)

export const CategoryPieChart: React.FC<PieChartProps> = (props) => (
  <PieChart
    {...props}
    showLegend={true}
    labelFormat="name"
  />
)

export const SmallPieChart: React.FC<PieChartProps> = (props) => (
  <PieChart
    {...props}
    outerRadius={80}
    height={200}
    showLegend={false}
    labelFormat="percentage"
  />
)
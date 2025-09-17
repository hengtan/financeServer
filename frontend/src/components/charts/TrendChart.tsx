import React from 'react'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface TrendChartData {
  name: string
  value: number
  trend?: number
  change?: number
  category?: string
  [key: string]: any
}

export interface TrendChartProps {
  data: TrendChartData[]
  showTrendLine?: boolean
  showChangeIndicators?: boolean
  showBars?: boolean
  height?: number
  currency?: string
  animate?: boolean
  trendColor?: string
  positiveColor?: string
  negativeColor?: string
  neutralColor?: string
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  showTrendLine = true,
  showChangeIndicators = true,
  showBars = true,
  height = 300,
  currency = 'BRL',
  animate = true,
  trendColor = '#3b82f6',
  positiveColor = '#10b981',
  negativeColor = '#ef4444',
  neutralColor = '#6b7280'
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

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getTrendDirection = (change: number) => {
    if (change > 0) return 'up'
    if (change < 0) return 'down'
    return 'neutral'
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return positiveColor
    if (change < 0) return negativeColor
    return neutralColor
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

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
                {entry.dataKey === 'value' ? 'Valor: ' : `${entry.dataKey}: `}
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}

          {data.change !== undefined && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
              {getTrendDirection(data.change) === 'up' && (
                <TrendingUp className="h-3 w-3 text-green-500" />
              )}
              {getTrendDirection(data.change) === 'down' && (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              {getTrendDirection(data.change) === 'neutral' && (
                <Minus className="h-3 w-3 text-gray-500" />
              )}
              <span
                className="text-xs font-medium"
                style={{ color: getTrendColor(data.change) }}
              >
                {formatPercentage(data.change)}
              </span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const averageValue = data.reduce((sum, item) => sum + item.value, 0) / data.length

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />

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

          <Legend />

          {/* Average reference line */}
          <ReferenceLine
            y={averageValue}
            stroke={neutralColor}
            strokeDasharray="5 5"
            label={{ value: "Média", position: "insideTopRight" }}
          />

          {/* Bars for values */}
          {showBars && (
            <Bar
              dataKey="value"
              fill={trendColor}
              fillOpacity={0.6}
              radius={[2, 2, 0, 0]}
              animationDuration={animate ? 750 : 0}
              name="Valor"
            />
          )}

          {/* Trend line */}
          {showTrendLine && (
            <Line
              type="monotone"
              dataKey="trend"
              stroke={trendColor}
              strokeWidth={3}
              dot={{ fill: trendColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: trendColor, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={animate ? 750 : 0}
              name="Tendência"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Change indicators */}
      {showChangeIndicators && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.slice(-4).map((item, index) => {
            const direction = getTrendDirection(item.change || 0)
            const color = getTrendColor(item.change || 0)

            return (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                {direction === 'up' && <TrendingUp className="h-4 w-4" style={{ color }} />}
                {direction === 'down' && <TrendingDown className="h-4 w-4" style={{ color }} />}
                {direction === 'neutral' && <Minus className="h-4 w-4" style={{ color }} />}

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{item.name}</p>
                  <p className="text-sm font-medium" style={{ color }}>
                    {item.change !== undefined ? formatPercentage(item.change) : 'N/A'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Variações especializadas do gráfico de tendência
export const IncomeTrendChart: React.FC<Omit<TrendChartProps, 'positiveColor' | 'negativeColor'>> = (props) => (
  <TrendChart
    {...props}
    positiveColor="#10b981"
    negativeColor="#f59e0b"
    trendColor="#10b981"
  />
)

export const ExpenseTrendChart: React.FC<Omit<TrendChartProps, 'positiveColor' | 'negativeColor'>> = (props) => (
  <TrendChart
    {...props}
    positiveColor="#f59e0b"
    negativeColor="#ef4444"
    trendColor="#ef4444"
  />
)

export const BalanceTrendChart: React.FC<TrendChartProps> = (props) => (
  <TrendChart
    {...props}
    showBars={false}
    showTrendLine={true}
    showChangeIndicators={true}
    trendColor="#3b82f6"
  />
)

export const SimpleTrendChart: React.FC<TrendChartProps> = (props) => (
  <TrendChart
    {...props}
    showBars={false}
    showChangeIndicators={false}
    height={200}
  />
)
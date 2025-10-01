import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { WidgetBase, WidgetConfig } from '../WidgetBase'
import { dashboardService } from '@/services/dashboard'

interface BalanceWidgetProps {
  widget: WidgetConfig
  isEditing?: boolean
  onSettings?: (widgetId: string) => void
  onRemove?: (widgetId: string) => void
  onResize?: (widgetId: string, size: 'small' | 'medium' | 'large') => void
}

export function BalanceWidget({ widget, isEditing, onSettings, onRemove, onResize }: BalanceWidgetProps) {
  const [balanceData, setBalanceData] = useState({
    current: 0,
    previous: 0,
    change: 0,
    trend: 'up' as const
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBalanceData()
  }, [])

  const loadBalanceData = async () => {
    try {
      const response = await dashboardService.getOverview(365)
      if (response.success && response.data) {
        const data = response.data.financial
        setBalanceData({
          current: data.totalBalance,
          previous: data.totalBalance - data.netIncome,
          change: data.expenseTrend.percentage,
          trend: data.expenseTrend.direction === 'UP' ? 'up' : 'down'
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados de saldo:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <WidgetBase
      widget={widget}
      isEditing={isEditing}
      onSettings={onSettings}
      onRemove={onRemove}
      onResize={onResize}
      className="group"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Atual</p>
              <p className="text-xl font-bold">{formatCurrency(balanceData.current)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {balanceData.trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={balanceData.trend === 'up' ? 'text-success' : 'text-destructive'}>
            {balanceData.change > 0 ? '+' : ''}{balanceData.change}%
          </span>
          <span className="text-muted-foreground">vs mês anterior</span>
        </div>

        {widget.size === 'large' && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Anterior</p>
              <p className="text-sm font-semibold">{formatCurrency(balanceData.previous)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Diferença</p>
              <p className="text-sm font-semibold text-success">
                +{formatCurrency(balanceData.current - balanceData.previous)}
              </p>
            </div>
          </div>
        )}
      </div>
    </WidgetBase>
  )
}
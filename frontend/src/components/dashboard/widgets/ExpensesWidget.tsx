import { useState, useEffect } from 'react'
import { CreditCard, TrendingDown } from 'lucide-react'
import { WidgetBase, WidgetConfig } from '../WidgetBase'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { transactionsService } from '@/services/transactions'

interface ExpensesWidgetProps {
  widget: WidgetConfig
  isEditing?: boolean
  onSettings?: (widgetId: string) => void
  onRemove?: (widgetId: string) => void
  onResize?: (widgetId: string, size: 'small' | 'medium' | 'large') => void
}

export function ExpensesWidget({ widget, isEditing, onSettings, onRemove, onResize }: ExpensesWidgetProps) {
  const [expensesData, setExpensesData] = useState({
    total: 0,
    previous: 0,
    change: 0,
    categories: [] as Array<{ name: string; value: number; color: string }>
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExpensesData()
  }, [])

  const loadExpensesData = async () => {
    try {
      const response = await transactionsService.getCategoriesSummary()
      if (response.success && response.data) {
        const categories = response.data
          .filter((cat: any) => cat.amount < 0)
          .slice(0, 4)
          .map((cat: any, index: number) => ({
            name: cat.category,
            value: Math.abs(cat.amount),
            color: ['#ef4444', '#3b82f6', '#8b5cf6', '#10b981'][index] || '#6b7280'
          }))

        const total = categories.reduce((sum, cat) => sum + cat.value, 0)

        setExpensesData({
          total,
          previous: total * 1.1,
          change: -8.2,
          categories
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados de despesas:', error)
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
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <CreditCard className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total do Mês</p>
              <p className="text-xl font-bold">{formatCurrency(expensesData.total)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <TrendingDown className="h-4 w-4 text-success" />
          <span className="text-success">
            {expensesData.change}%
          </span>
          <span className="text-muted-foreground">vs mês anterior</span>
        </div>

        {widget.size !== 'small' && (
          <div className="space-y-3">
            {widget.size === 'large' && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesData.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={50}
                      dataKey="value"
                    >
                      {expensesData.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-2">
              {expensesData.categories.slice(0, widget.size === 'medium' ? 3 : 4).map((category) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-muted-foreground">{category.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(category.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WidgetBase>
  )
}
import { useState, useEffect } from 'react'
import { Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { WidgetBase, WidgetConfig } from '../WidgetBase'
import { Button } from '@/components/ui/button'
import { transactionsService, Transaction } from '@/services/transactions'

interface TransactionsWidgetProps {
  widget: WidgetConfig
  isEditing?: boolean
  onSettings?: (widgetId: string) => void
  onRemove?: (widgetId: string) => void
  onResize?: (widgetId: string, size: 'small' | 'medium' | 'large') => void
}

export function TransactionsWidget({ widget, isEditing, onSettings, onRemove, onResize }: TransactionsWidgetProps) {
  const [transactions, setTransactions] = useState<Array<{
    id: number
    description: string
    amount: number
    date: string
    type: 'income' | 'expense'
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await transactionsService.getTransactions({ limit: 5 })
      if (response.success && response.data.data) {
        const formatted = response.data.data.map((t: any) => ({
          id: t.id,
          description: t.description,
          amount: t.type === 'INCOME' ? parseFloat(t.amount) : -parseFloat(t.amount),
          date: t.date,
          type: t.type === 'INCOME' ? 'income' as const : 'expense' as const
        }))
        setTransactions(formatted)
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(value))
  }

  const getDisplayCount = () => {
    switch (widget.size) {
      case 'small': return 2
      case 'medium': return 3
      case 'large': return 5
      default: return 3
    }
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
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Últimas movimentações</span>
        </div>

        <div className="space-y-2">
          {transactions.slice(0, getDisplayCount()).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`p-1 rounded ${
                  transaction.type === 'income'
                    ? 'bg-success/20 text-success'
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownLeft className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{transaction.description}</p>
                  {widget.size !== 'small' && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-success' : 'text-destructive'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {widget.size === 'large' && (
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full">
              Ver todas as transações
            </Button>
          </div>
        )}
      </div>
    </WidgetBase>
  )
}
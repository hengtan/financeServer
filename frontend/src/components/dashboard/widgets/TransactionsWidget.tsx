import { Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { WidgetBase, WidgetConfig } from '../WidgetBase'
import { Button } from '@/components/ui/button'

interface TransactionsWidgetProps {
  widget: WidgetConfig
  isEditing?: boolean
  onSettings?: (widgetId: string) => void
  onRemove?: (widgetId: string) => void
  onResize?: (widgetId: string, size: 'small' | 'medium' | 'large') => void
}

export function TransactionsWidget({ widget, isEditing, onSettings, onRemove, onResize }: TransactionsWidgetProps) {
  const transactions = [
    { id: 1, description: "Salário - Empresa XYZ", amount: 5200.00, date: "2024-01-15", type: "income" },
    { id: 2, description: "Supermercado Extra", amount: -234.50, date: "2024-01-16", type: "expense" },
    { id: 3, description: "Netflix Streaming", amount: -29.90, date: "2024-01-14", type: "expense" },
    { id: 4, description: "Freelance - Projeto ABC", amount: 1200.00, date: "2024-01-12", type: "income" },
    { id: 5, description: "Uber - Corrida Centro", amount: -18.50, date: "2024-01-14", type: "expense" },
  ]

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
import { Target, TrendingUp } from 'lucide-react'
import { WidgetBase, WidgetConfig } from '../WidgetBase'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface GoalsWidgetProps {
  widget: WidgetConfig
  isEditing?: boolean
  onSettings?: (widgetId: string) => void
  onRemove?: (widgetId: string) => void
  onResize?: (widgetId: string, size: 'small' | 'medium' | 'large') => void
}

export function GoalsWidget({ widget, isEditing, onSettings, onRemove, onResize }: GoalsWidgetProps) {
  const goals = [
    {
      id: 1,
      title: "Reserva de Emergência",
      target: 30000,
      current: 22500,
      progress: 75,
      color: "#ef4444"
    },
    {
      id: 2,
      title: "Viagem para Europa",
      target: 15000,
      current: 8500,
      progress: 57,
      color: "#3b82f6"
    },
    {
      id: 3,
      title: "Carro Novo",
      target: 50000,
      current: 12000,
      progress: 24,
      color: "#8b5cf6"
    }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getDisplayCount = () => {
    switch (widget.size) {
      case 'small': return 1
      case 'medium': return 2
      case 'large': return 3
      default: return 2
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
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Suas metas</span>
        </div>

        <div className="space-y-4">
          {goals.slice(0, getDisplayCount()).map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium truncate">{goal.title}</span>
                <span className="text-sm text-muted-foreground">{goal.progress}%</span>
              </div>

              <Progress value={goal.progress} className="h-2" />

              {widget.size !== 'small' && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(goal.current)}</span>
                  <span>{formatCurrency(goal.target)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {widget.size === 'large' && (
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full">
              <Target className="h-4 w-4 mr-1" />
              Criar Nova Meta
            </Button>
          </div>
        )}

        {widget.size !== 'large' && goals.length > getDisplayCount() && (
          <div className="text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              +{goals.length - getDisplayCount()} metas
            </Button>
          </div>
        )}
      </div>
    </WidgetBase>
  )
}
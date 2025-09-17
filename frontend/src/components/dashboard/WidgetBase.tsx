import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MoreVertical, Settings, X, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WidgetConfig {
  id: string
  type: string
  title: string
  size: 'small' | 'medium' | 'large'
  position: { row: number; col: number }
  enabled: boolean
  settings?: Record<string, any>
}

interface WidgetBaseProps {
  widget: WidgetConfig
  children: ReactNode
  isDragging?: boolean
  isEditing?: boolean
  onSettings?: (widgetId: string) => void
  onRemove?: (widgetId: string) => void
  onResize?: (widgetId: string, size: 'small' | 'medium' | 'large') => void
  className?: string
}

const sizeClasses = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-2 row-span-1',
  large: 'col-span-2 row-span-2'
}

export function WidgetBase({
  widget,
  children,
  isDragging = false,
  isEditing = false,
  onSettings,
  onRemove,
  onResize,
  className
}: WidgetBaseProps) {

  const handleResize = () => {
    if (onResize) {
      const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large']
      const currentIndex = sizes.indexOf(widget.size)
      const nextSize = sizes[(currentIndex + 1) % sizes.length]
      onResize(widget.id, nextSize)
    }
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        sizeClasses[widget.size],
        isDragging && 'opacity-50 rotate-1 scale-105',
        isEditing && 'ring-2 ring-primary/50',
        className
      )}
      data-widget-id={widget.id}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium truncate">
          {widget.title}
        </CardTitle>

        {isEditing && (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              {onResize && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResize}
                      className="h-6 w-6 p-0"
                    >
                      {widget.size === 'small' ? (
                        <Maximize2 className="h-3 w-3" />
                      ) : (
                        <Minimize2 className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Redimensionar widget</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {onSettings && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSettings(widget.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configurar widget</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {onRemove && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(widget.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remover widget</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        )}

        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

// Hook para gerenciar widgets
export function useWidgets() {
  const defaultWidgets: WidgetConfig[] = [
    {
      id: 'balance-overview',
      type: 'balance',
      title: 'Visão Geral do Saldo',
      size: 'medium',
      position: { row: 0, col: 0 },
      enabled: true
    },
    {
      id: 'monthly-expenses',
      type: 'expenses',
      title: 'Gastos Mensais',
      size: 'medium',
      position: { row: 0, col: 2 },
      enabled: true
    },
    {
      id: 'recent-transactions',
      type: 'transactions',
      title: 'Transações Recentes',
      size: 'large',
      position: { row: 1, col: 0 },
      enabled: true
    },
    {
      id: 'financial-goals',
      type: 'goals',
      title: 'Metas Financeiras',
      size: 'medium',
      position: { row: 1, col: 2 },
      enabled: true
    },
    {
      id: 'expense-breakdown',
      type: 'breakdown',
      title: 'Breakdown de Gastos',
      size: 'small',
      position: { row: 2, col: 0 },
      enabled: true
    },
    {
      id: 'income-trends',
      type: 'trends',
      title: 'Tendências de Renda',
      size: 'small',
      position: { row: 2, col: 1 },
      enabled: true
    }
  ]

  // Em uma aplicação real, isso viria do localStorage ou API
  const getWidgets = (): WidgetConfig[] => {
    const saved = localStorage.getItem('dashboard-widgets')
    return saved ? JSON.parse(saved) : defaultWidgets
  }

  const saveWidgets = (widgets: WidgetConfig[]) => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets))
  }

  const updateWidget = (widgetId: string, updates: Partial<WidgetConfig>) => {
    const widgets = getWidgets()
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, ...updates } : w
    )
    saveWidgets(updatedWidgets)
    return updatedWidgets
  }

  const removeWidget = (widgetId: string) => {
    const widgets = getWidgets()
    const updatedWidgets = widgets.filter(w => w.id !== widgetId)
    saveWidgets(updatedWidgets)
    return updatedWidgets
  }

  const addWidget = (widget: WidgetConfig) => {
    const widgets = getWidgets()
    const updatedWidgets = [...widgets, widget]
    saveWidgets(updatedWidgets)
    return updatedWidgets
  }

  const reorderWidgets = (reorderedWidgets: WidgetConfig[]) => {
    saveWidgets(reorderedWidgets)
    return reorderedWidgets
  }

  const resetToDefault = () => {
    saveWidgets(defaultWidgets)
    return defaultWidgets
  }

  return {
    getWidgets,
    updateWidget,
    removeWidget,
    addWidget,
    reorderWidgets,
    resetToDefault,
    defaultWidgets
  }
}
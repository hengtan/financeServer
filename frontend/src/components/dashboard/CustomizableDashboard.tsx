import { useState, useEffect } from 'react'
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd'
import { StrictModeDroppable as Droppable } from './StrictModeDroppable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { WidgetConfig, useWidgets } from './WidgetBase'
import { BalanceWidget } from './widgets/BalanceWidget'
import { ExpensesWidget } from './widgets/ExpensesWidget'
import { TransactionsWidget } from './widgets/TransactionsWidget'
import { GoalsWidget } from './widgets/GoalsWidget'
import {
  Settings,
  Plus,
  RotateCcw,
  Save,
  Eye,
  Edit3,
  Grip,
  BarChart3,
  DollarSign,
  CreditCard,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react'
import { showSuccessToast, showInfoToast } from '@/lib/utils'

interface CustomizableDashboardProps {
  className?: string
}

const widgetComponents = {
  balance: BalanceWidget,
  expenses: ExpensesWidget,
  transactions: TransactionsWidget,
  goals: GoalsWidget,
  breakdown: BalanceWidget, // Placeholder
  trends: ExpensesWidget, // Placeholder
}

const widgetIcons = {
  balance: DollarSign,
  expenses: CreditCard,
  transactions: Calendar,
  goals: Target,
  breakdown: BarChart3,
  trends: TrendingUp,
}

const availableWidgets = [
  { type: 'balance', name: 'Saldo Overview', description: 'Visão geral do saldo atual' },
  { type: 'expenses', name: 'Gastos Mensais', description: 'Resumo dos gastos do mês' },
  { type: 'transactions', name: 'Transações Recentes', description: 'Últimas movimentações' },
  { type: 'goals', name: 'Metas Financeiras', description: 'Progresso das metas' },
  { type: 'breakdown', name: 'Breakdown Detalhado', description: 'Análise detalhada' },
  { type: 'trends', name: 'Tendências', description: 'Tendências e projeções' },
]

export function CustomizableDashboard({ className }: CustomizableDashboardProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  const {
    getWidgets,
    updateWidget,
    removeWidget,
    addWidget,
    reorderWidgets,
    resetToDefault
  } = useWidgets()

  useEffect(() => {
    setWidgets(getWidgets())
  }, [])

  const handleDragStart = (start: any) => {
    setDraggedWidget(start.draggableId)
    document.body.classList.add('dragging')
  }

  const handleDragEnd = (result: DropResult) => {
    setDraggedWidget(null)
    document.body.classList.remove('dragging')

    if (!result.destination) return

    const items = Array.from(widgets)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update positions based on new order
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: { row: Math.floor(index / 2), col: index % 2 }
    }))

    setWidgets(updatedItems)
    reorderWidgets(updatedItems) // Save immediately
    setHasChanges(false) // Reset since we saved
    showInfoToast('Dashboard atualizado', 'Widgets reorganizados com sucesso')
  }

  const handleRemoveWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId)
    setWidgets(updatedWidgets)
    removeWidget(widgetId) // Save immediately
    setHasChanges(false)
    showInfoToast('Widget removido', 'Widget removido e salvo automaticamente')
  }

  const handleResizeWidget = (widgetId: string, size: 'small' | 'medium' | 'large') => {
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, size } : w
    )
    setWidgets(updatedWidgets)
    updateWidget(widgetId, { size }) // Save immediately
    setHasChanges(false)
    showInfoToast('Widget redimensionado', `Tamanho alterado para ${size} e salvo`)
  }

  const handleAddWidget = (type: string) => {
    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type,
      title: availableWidgets.find(w => w.type === type)?.name || type,
      size: 'medium',
      position: { row: Math.floor(widgets.length / 2), col: widgets.length % 2 },
      enabled: true
    }

    const updatedWidgets = [...widgets, newWidget]
    setWidgets(updatedWidgets)
    addWidget(newWidget) // Save immediately
    setHasChanges(false)
    setShowAddModal(false)
    showSuccessToast('Widget adicionado', 'Novo widget adicionado e salvo automaticamente')
  }

  const handleSaveChanges = () => {
    if (hasChanges) {
      reorderWidgets(widgets)
      setHasChanges(false)
    }
    setIsEditing(false)
    showSuccessToast('Dashboard salvo', 'Modo de edição finalizado')
  }

  const handleDiscardChanges = () => {
    setWidgets(getWidgets())
    setHasChanges(false)
    setIsEditing(false)
    showInfoToast('Alterações descartadas', 'Dashboard restaurado ao estado anterior')
  }

  const handleResetToDefault = () => {
    const defaultWidgets = resetToDefault()
    setWidgets(defaultWidgets)
    setHasChanges(false)
    setIsEditing(false)
    showSuccessToast('Dashboard restaurado', 'Dashboard restaurado ao padrão')
  }

  const renderWidget = (widget: WidgetConfig, index: number) => {
    const WidgetComponent = widgetComponents[widget.type as keyof typeof widgetComponents]

    if (!WidgetComponent) {
      return (
        <div className="p-4 border border-dashed border-muted-foreground rounded-lg text-center text-muted-foreground">
          Widget tipo "{widget.type}" não encontrado
        </div>
      )
    }

    return (
      <Draggable
        key={widget.id}
        draggableId={widget.id}
        index={index}
        isDragDisabled={!isEditing}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`transition-all duration-200 ${
              snapshot.isDragging ? 'drag-preview opacity-90' : 'hover:shadow-md'
            } ${isEditing ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
          >
            {isEditing && (
              <div
                {...provided.dragHandleProps}
                className={`drag-handle flex items-center justify-center w-full p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-t-lg border-2 border-dashed transition-colors hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900 dark:hover:to-blue-800 ${
                  snapshot.isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-blue-300 dark:border-blue-700'
                }`}
              >
                <Grip className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  {snapshot.isDragging ? 'Movendo...' : 'Arrastar para reordenar'}
                </span>
              </div>
            )}

            <WidgetComponent
              widget={widget}
              isEditing={isEditing}
              onRemove={handleRemoveWidget}
              onResize={handleResizeWidget}
              isDragging={snapshot.isDragging}
            />
          </div>
        )}
      </Draggable>
    )
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Dashboard Personalizado</h2>
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Alterações não salvas
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Personalizar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Widget
              </Button>

              <Button
                variant="outline"
                onClick={handleResetToDefault}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar Padrão
              </Button>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  onClick={handleDiscardChanges}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dashboard Grid */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`min-h-[400px] space-y-4 transition-colors rounded-lg p-4 ${
                snapshot.isDraggingOver
                  ? 'bg-accent/50 border-2 border-dashed border-primary'
                  : 'bg-transparent border-2 border-transparent'
              }`}
            >
              {widgets.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-center">
                  <div className="space-y-2">
                    <div className="text-4xl">📊</div>
                    <p className="text-muted-foreground">Nenhum widget adicionado</p>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Personalizar" e depois "Adicionar Widget" para começar
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {widgets.map((widget, index) => renderWidget(widget, index))}
                </div>
              )}
              {provided.placeholder}

              {/* Drop Zone Indicator */}
              {snapshot.isDraggingOver && (
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-primary rounded-lg bg-primary/5">
                  <p className="text-primary font-medium">Solte o widget aqui</p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Widget Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Adicionar Widget"
        size="lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {availableWidgets.map((widgetType) => {
            const Icon = widgetIcons[widgetType.type as keyof typeof widgetIcons]
            const isAlreadyAdded = widgets.some(w => w.type === widgetType.type)

            return (
              <button
                key={widgetType.type}
                onClick={() => handleAddWidget(widgetType.type)}
                disabled={isAlreadyAdded}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  isAlreadyAdded
                    ? 'border-muted bg-muted/50 cursor-not-allowed opacity-50'
                    : 'border-border hover:border-primary hover:bg-accent cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{widgetType.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{widgetType.description}</p>
                {isAlreadyAdded && (
                  <Badge variant="secondary" className="mt-2">
                    Já adicionado
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}
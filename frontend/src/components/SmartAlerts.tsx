import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Modal } from '@/components/ui/modal'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  Bell,
  Settings,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { showSuccessToast, showWarningToast, showInfoToast } from '@/lib/utils'

interface Alert {
  id: string
  type: 'warning' | 'info' | 'success' | 'danger'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  category: 'spending' | 'income' | 'goal' | 'budget' | 'investment' | 'trend'
  threshold?: number
  currentValue?: number
  targetValue?: number
  isActive: boolean
  isRead: boolean
  createdAt: Date
  triggeredAt?: Date
  actions?: AlertAction[]
}

interface AlertAction {
  label: string
  action: () => void
  variant?: 'default' | 'destructive' | 'outline'
}

interface AlertRule {
  id: string
  name: string
  description: string
  category: 'spending' | 'income' | 'goal' | 'budget' | 'investment' | 'trend'
  type: 'threshold' | 'percentage' | 'pattern' | 'goal'
  threshold?: number
  isEnabled: boolean
  conditions: {
    operator: '>' | '<' | '=' | '>=' | '<='
    value: number
    period: 'daily' | 'weekly' | 'monthly'
  }
}

export interface SmartAlertsProps {
  className?: string
}

// Mock data - simulando alertas inteligentes
const getMockAlerts = (): Alert[] => [
  {
    id: '1',
    type: 'warning',
    priority: 'high',
    title: 'Gastos Acima da Média',
    description: 'Seus gastos com alimentação este mês (R$ 1.234) estão 45% acima da média dos últimos 6 meses.',
    category: 'spending',
    threshold: 850,
    currentValue: 1234,
    targetValue: 850,
    isActive: true,
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    actions: [
      {
        label: 'Ver Detalhes',
        action: () => alert('Análise detalhada de gastos com alimentação'),
        variant: 'outline'
      },
      {
        label: 'Definir Limite',
        action: () => alert('Configurar limite de gastos para alimentação'),
        variant: 'default'
      }
    ]
  },
  {
    id: '2',
    type: 'success',
    priority: 'medium',
    title: 'Meta Atingida',
    description: 'Parabéns! Você atingiu 100% da sua meta de economia mensal (R$ 2.000).',
    category: 'goal',
    currentValue: 2000,
    targetValue: 2000,
    isActive: true,
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
    triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    actions: [
      {
        label: 'Definir Nova Meta',
        action: () => window.location.href = '/metas',
        variant: 'default'
      }
    ]
  },
  {
    id: '3',
    type: 'info',
    priority: 'medium',
    title: 'Oportunidade de Investimento',
    description: 'Você tem R$ 3.500 parados na conta corrente. Considere investir para rentabilizar.',
    category: 'investment',
    currentValue: 3500,
    isActive: true,
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
    triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    actions: [
      {
        label: 'Simular Investimento',
        action: () => alert('Simulador: R$ 3.500 em CDB (12% a.a.) = R$ 3.920 em 12 meses'),
        variant: 'default'
      }
    ]
  },
  {
    id: '4',
    type: 'danger',
    priority: 'critical',
    title: 'Limite de Cartão Próximo',
    description: 'Você já utilizou 85% do limite do seu cartão Visa. Restam apenas R$ 450.',
    category: 'budget',
    threshold: 90,
    currentValue: 85,
    targetValue: 90,
    isActive: true,
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
    triggeredAt: new Date(Date.now() - 30 * 60 * 1000),
    actions: [
      {
        label: 'Ver Fatura',
        action: () => alert('Visualizar fatura do cartão Visa'),
        variant: 'outline'
      },
      {
        label: 'Fazer Pagamento',
        action: () => alert('Realizar pagamento do cartão'),
        variant: 'destructive'
      }
    ]
  },
  {
    id: '5',
    type: 'info',
    priority: 'low',
    title: 'Tendência Positiva',
    description: 'Seus gastos diminuíram 12% comparado ao mês anterior. Continue assim!',
    category: 'trend',
    currentValue: -12,
    isActive: true,
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    triggeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
]

const defaultAlertRules: AlertRule[] = [
  {
    id: 'spending-threshold',
    name: 'Gastos Acima da Média',
    description: 'Alertar quando gastos superarem a média histórica',
    category: 'spending',
    type: 'percentage',
    threshold: 30,
    isEnabled: true,
    conditions: {
      operator: '>',
      value: 30,
      period: 'monthly'
    }
  },
  {
    id: 'income-drop',
    name: 'Queda na Renda',
    description: 'Alertar quando renda diminuir significativamente',
    category: 'income',
    type: 'percentage',
    threshold: 20,
    isEnabled: true,
    conditions: {
      operator: '<',
      value: -20,
      period: 'monthly'
    }
  },
  {
    id: 'goal-progress',
    name: 'Progresso de Metas',
    description: 'Alertar sobre progresso das metas financeiras',
    category: 'goal',
    type: 'percentage',
    threshold: 90,
    isEnabled: true,
    conditions: {
      operator: '>=',
      value: 90,
      period: 'monthly'
    }
  },
  {
    id: 'credit-limit',
    name: 'Limite de Crédito',
    description: 'Alertar quando uso do cartão ultrapassar limite',
    category: 'budget',
    type: 'percentage',
    threshold: 80,
    isEnabled: true,
    conditions: {
      operator: '>',
      value: 80,
      period: 'monthly'
    }
  }
]

const getAlertIcon = (type: string, priority: string) => {
  const iconProps = { className: 'h-5 w-5' }

  switch (type) {
    case 'warning':
      return <AlertTriangle {...iconProps} className={cn(iconProps.className, 'text-orange-500')} />
    case 'danger':
      return <AlertCircle {...iconProps} className={cn(iconProps.className, 'text-red-500')} />
    case 'success':
      return <CheckCircle {...iconProps} className={cn(iconProps.className, 'text-green-500')} />
    case 'info':
    default:
      return <Info {...iconProps} className={cn(iconProps.className, 'text-blue-500')} />
  }
}

const getAlertColor = (type: string, priority: string) => {
  const base = 'border-l-4'

  switch (type) {
    case 'warning':
      return `${base} border-l-orange-500 bg-orange-50 dark:bg-orange-950/20`
    case 'danger':
      return `${base} border-l-red-500 bg-red-50 dark:bg-red-950/20`
    case 'success':
      return `${base} border-l-green-500 bg-green-50 dark:bg-green-950/20`
    case 'info':
    default:
      return `${base} border-l-blue-500 bg-blue-50 dark:bg-blue-950/20`
  }
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} min atrás`
  } else if (diffHours < 24) {
    return `${diffHours}h atrás`
  } else {
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`
  }
}

export function SmartAlerts({ className }: SmartAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'critical'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setAlerts(getMockAlerts())
      setAlertRules(defaultAlertRules)
      setIsLoading(false)
    }, 1000)
  }, [])

  const unreadCount = alerts.filter(alert => !alert.isRead).length
  const criticalCount = alerts.filter(alert => alert.priority === 'critical').length

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.isRead
      case 'high':
        return alert.priority === 'high'
      case 'critical':
        return alert.priority === 'critical'
      default:
        return true
    }
  })

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ))
    showInfoToast('Alerta marcado como lido', '')
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    showInfoToast('Alerta removido', '')
  }

  const handleToggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, isEnabled: !rule.isEnabled } : rule
    ))
    showSuccessToast('Configuração atualizada', 'Regra de alerta alterada')
  }

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })))
    showSuccessToast('Todos os alertas marcados como lidos', '')
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="h-6 w-6" />
            Alertas Inteligentes
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Notificações automáticas baseadas nos seus padrões financeiros
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configurar
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Marcar Todas como Lidas
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filtrar:</span>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'unread', label: 'Não lidos' },
              { key: 'high', label: 'Alta prioridade' },
              { key: 'critical', label: 'Críticos' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key as any)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {criticalCount > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-shimmer">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <p className="text-lg font-medium">Nenhum alerta encontrado</p>
                <p className="text-muted-foreground">
                  {filter === 'all'
                    ? 'Suas finanças estão em ordem!'
                    : 'Nenhum alerta corresponde ao filtro selecionado.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={cn(
              'transition-all hover:shadow-md',
              getAlertColor(alert.type, alert.priority),
              !alert.isRead && 'shadow-md'
            )}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getAlertIcon(alert.type, alert.priority)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          'font-semibold',
                          !alert.isRead && 'text-foreground',
                          alert.isRead && 'text-muted-foreground'
                        )}>
                          {alert.title}
                        </h3>

                        <Badge
                          variant={alert.priority === 'critical' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {alert.priority === 'critical' ? 'Crítico' :
                           alert.priority === 'high' ? 'Alto' :
                           alert.priority === 'medium' ? 'Médio' : 'Baixo'}
                        </Badge>

                        {!alert.isRead && (
                          <Badge variant="default" className="text-xs bg-blue-100 text-blue-700">
                            Novo
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>

                      {/* Progress bar para alertas com threshold */}
                      {alert.currentValue && alert.targetValue && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Atual: R$ {alert.currentValue.toLocaleString()}</span>
                            <span>Meta: R$ {alert.targetValue.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full transition-all',
                                alert.type === 'success' ? 'bg-green-500' :
                                alert.type === 'warning' ? 'bg-orange-500' :
                                alert.type === 'danger' ? 'bg-red-500' : 'bg-blue-500'
                              )}
                              style={{
                                width: `${Math.min((alert.currentValue / alert.targetValue) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(alert.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {alert.category}
                        </div>
                      </div>

                      {/* Actions */}
                      {alert.actions && (
                        <div className="flex gap-2 pt-2">
                          {alert.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant={action.variant || 'outline'}
                              onClick={action.action}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!alert.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(alert.id)}
                        title="Marcar como lida"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDismissAlert(alert.id)}
                      title="Remover alerta"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Configurações */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Configurações de Alertas"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Configure quando e como você quer receber alertas sobre suas finanças.
          </p>

          <div className="space-y-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {rule.category}
                        </Badge>
                        <span>
                          {rule.conditions.operator} {rule.threshold}% {rule.conditions.period}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={rule.isEnabled}
                      onCheckedChange={() => handleToggleRule(rule.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setShowSettings(false)
              showSuccessToast('Configurações salvas', 'Alertas atualizados com sucesso')
            }}>
              Salvar Configurações
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
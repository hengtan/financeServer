import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Bell,
  Check,
  X,
  AlertTriangle,
  Info,
  DollarSign,
  Target,
  TrendingUp,
  CreditCard,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Archive,
  Trash2,
  CheckCircle
} from 'lucide-react'

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error' | 'transaction' | 'goal' | 'system'
  title: string
  message: string
  date: string
  read: boolean
  actionable?: boolean
  actionLabel?: string
  onAction?: () => void
  priority: 'low' | 'medium' | 'high'
  category?: string
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  transactionAlerts: boolean
  goalUpdates: boolean
  budgetWarnings: boolean
  securityAlerts: boolean
  weeklyReports: boolean
  monthlyReports: boolean
  promotionalEmails: boolean
}

export interface NotificationsPageProps {
  notifications?: Notification[]
  settings?: NotificationSettings
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onDeleteNotification?: (id: string) => void
  onUpdateSettings?: (settings: NotificationSettings) => void
  onAction?: (notificationId: string) => void
}

export const NotificationsPage = ({
  notifications: externalNotifications,
  settings: externalSettings,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onUpdateSettings,
  onAction
}: NotificationsPageProps) => {
  usePageTitle('Notificações')

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Default notifications
  const defaultNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Meta Alcançada!',
      message: 'Parabéns! Você atingiu 100% da meta "Reserva de Emergência"',
      date: '2024-03-15T10:30:00Z',
      read: false,
      actionable: true,
      actionLabel: 'Ver Meta',
      priority: 'high',
      category: 'metas'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Orçamento Ultrapassado',
      message: 'Você gastou R$ 1.234,56 em "Alimentação" este mês, ultrapassando o orçamento em 23%',
      date: '2024-03-15T09:15:00Z',
      read: false,
      actionable: true,
      actionLabel: 'Ajustar Orçamento',
      priority: 'medium',
      category: 'orçamento'
    },
    {
      id: '3',
      type: 'transaction',
      title: 'Transação Recebida',
      message: 'Você recebeu R$ 2.500,00 de "Freelance Projeto XYZ"',
      date: '2024-03-14T16:45:00Z',
      read: true,
      priority: 'low',
      category: 'transações'
    },
    {
      id: '4',
      type: 'info',
      title: 'Relatório Mensal Disponível',
      message: 'Seu relatório financeiro de fevereiro está pronto para visualização',
      date: '2024-03-01T08:00:00Z',
      read: true,
      actionable: true,
      actionLabel: 'Ver Relatório',
      priority: 'low',
      category: 'relatórios'
    },
    {
      id: '5',
      type: 'error',
      title: 'Falha na Sincronização',
      message: 'Não foi possível sincronizar com o banco. Tente novamente.',
      date: '2024-02-28T14:20:00Z',
      read: false,
      actionable: true,
      actionLabel: 'Tentar Novamente',
      priority: 'high',
      category: 'sistema'
    }
  ]

  // Default settings
  const defaultSettings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    transactionAlerts: true,
    goalUpdates: true,
    budgetWarnings: true,
    securityAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    promotionalEmails: false
  }

  const notifications = externalNotifications || defaultNotifications
  const [settings, setSettings] = useState(externalSettings || defaultSettings)

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' ||
                       (filterType === 'read' && notification.read) ||
                       (filterType === 'unread' && !notification.read)

    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error': return <X className="h-5 w-5 text-red-500" />
      case 'transaction': return <DollarSign className="h-5 w-5 text-blue-500" />
      case 'goal': return <Target className="h-5 w-5 text-purple-500" />
      case 'system': return <Info className="h-5 w-5 text-gray-500" />
      default: return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-200/20 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200/20 dark:text-yellow-200'
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-200/20 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-200/20 dark:text-gray-200'
    }
  }

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    if (onUpdateSettings) {
      onUpdateSettings(newSettings)
    }
  }

  const handleMarkAsRead = (id: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(id)
    }
  }

  const handleAction = (notification: Notification) => {
    if (notification.onAction) {
      notification.onAction()
    } else if (onAction) {
      onAction(notification.id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'Agora há pouco'
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Bell className="h-8 w-8" />
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie suas notificações e preferências
              </p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={onMarkAllAsRead} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar Todas como Lidas
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Lista de Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Buscar notificações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">Todas</option>
                      <option value="unread">Não lidas</option>
                      <option value="read">Lidas</option>
                    </select>
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">Todas</option>
                      <option value="transações">Transações</option>
                      <option value="metas">Metas</option>
                      <option value="orçamento">Orçamento</option>
                      <option value="relatórios">Relatórios</option>
                      <option value="sistema">Sistema</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Todas as Notificações ({filteredNotifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          notification.read
                            ? 'bg-background border-border'
                            : 'bg-accent border-primary/20'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                                  {notification.priority}
                                </Badge>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(notification.date)}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Marcar como Lida
                                </Button>
                              )}

                              {notification.actionable && notification.actionLabel && (
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(notification)}
                                >
                                  {notification.actionLabel}
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDeleteNotification?.(notification.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Notificação */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Notificação</CardTitle>
                <CardDescription>
                  Configure como você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações importantes por email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações instantâneas no navegador
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber alertas importantes por SMS
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Notificação</CardTitle>
                <CardDescription>
                  Escolha quais tipos de notificação você deseja receber
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Transação</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre transações importantes
                    </p>
                  </div>
                  <Switch
                    checked={settings.transactionAlerts}
                    onCheckedChange={(checked) => handleSettingChange('transactionAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Atualizações de Metas</Label>
                    <p className="text-sm text-muted-foreground">
                      Progresso e conquistas de metas financeiras
                    </p>
                  </div>
                  <Switch
                    checked={settings.goalUpdates}
                    onCheckedChange={(checked) => handleSettingChange('goalUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Avisos de Orçamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertas quando ultrapassar limites de orçamento
                    </p>
                  </div>
                  <Switch
                    checked={settings.budgetWarnings}
                    onCheckedChange={(checked) => handleSettingChange('budgetWarnings', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Segurança</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre atividades de segurança
                    </p>
                  </div>
                  <Switch
                    checked={settings.securityAlerts}
                    onCheckedChange={(checked) => handleSettingChange('securityAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Relatórios Semanais</Label>
                    <p className="text-sm text-muted-foreground">
                      Resumo semanal das suas finanças
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Relatórios Mensais</Label>
                    <p className="text-sm text-muted-foreground">
                      Análise detalhada mensal
                    </p>
                  </div>
                  <Switch
                    checked={settings.monthlyReports}
                    onCheckedChange={(checked) => handleSettingChange('monthlyReports', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emails Promocionais</Label>
                    <p className="text-sm text-muted-foreground">
                      Ofertas e novidades do FinanceServer
                    </p>
                  </div>
                  <Switch
                    checked={settings.promotionalEmails}
                    onCheckedChange={(checked) => handleSettingChange('promotionalEmails', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
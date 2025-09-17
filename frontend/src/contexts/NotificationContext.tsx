import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Notification } from '@/components/NotificationDropdown'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications]
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length
      }

    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, read: true }
          : notification
      )
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      }

    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true
      }))
      return {
        notifications: allReadNotifications,
        unreadCount: 0
      }

    case 'CLEAR_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
      return {
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length
      }

    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        notifications: [],
        unreadCount: 0
      }

    case 'SET_NOTIFICATIONS':
      return {
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      }

    default:
      return state
  }
}

// Dados de exemplo/mock
const generateMockNotifications = (): Notification[] => [
  {
    id: '1',
    type: 'transaction',
    title: 'Nova transação recebida',
    message: 'Você recebeu um pagamento de R$ 2.500,00',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutos atrás
    read: false,
    metadata: { amount: 2500 }
  },
  {
    id: '2',
    type: 'goal',
    title: 'Meta atingida! 🎉',
    message: 'Parabéns! Você completou sua meta "Reserva de Emergência"',
    timestamp: new Date(Date.now() - 30 * 60000), // 30 minutos atrás
    read: false,
    metadata: { goalName: 'Reserva de Emergência' }
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Nova conquista desbloqueada',
    message: 'Você economizou mais de R$ 10.000 este mês!',
    timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 horas atrás
    read: false,
    metadata: { achievementType: 'savings_milestone' }
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Lembrete de pagamento',
    message: 'A fatura do cartão de crédito vence em 3 dias',
    timestamp: new Date(Date.now() - 4 * 60 * 60000), // 4 horas atrás
    read: true
  },
  {
    id: '5',
    type: 'system',
    title: 'Atualização de segurança',
    message: 'Novas medidas de segurança foram implementadas na sua conta',
    timestamp: new Date(Date.now() - 24 * 60 * 60000), // 1 dia atrás
    read: true
  },
  {
    id: '6',
    type: 'transaction',
    title: 'Despesa registrada',
    message: 'Compra no supermercado: R$ 127,50',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000), // 2 dias atrás
    read: true,
    metadata: { amount: 127.50 }
  }
]

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    unreadCount: 0
  })

  // Carregar notificações mockadas na inicialização
  useEffect(() => {
    const mockNotifications = generateMockNotifications()
    dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications })
  }, [])

  // Simular chegada de novas notificações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Chance de 30% de uma nova notificação a cada 2 minutos
      if (Math.random() < 0.3) {
        const newNotificationTypes: Array<{
          type: Notification['type'],
          title: string,
          message: string,
          metadata?: any
        }> = [
          {
            type: 'transaction',
            title: 'Nova transação',
            message: 'Transferência recebida via PIX',
            metadata: { amount: Math.floor(Math.random() * 1000) + 100 }
          },
          {
            type: 'reminder',
            title: 'Lembrete',
            message: 'Não esqueça de revisar seus gastos desta semana'
          },
          {
            type: 'system',
            title: 'Relatório disponível',
            message: 'Seu relatório mensal está pronto para visualização'
          }
        ]

        const randomNotification = newNotificationTypes[Math.floor(Math.random() * newNotificationTypes.length)]

        addNotification({
          type: randomNotification.type,
          title: randomNotification.title,
          message: randomNotification.message,
          read: false,
          metadata: randomNotification.metadata
        })
      }
    }, 120000) // A cada 2 minutos

    return () => clearInterval(interval)
  }, [])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })

    // Simular persistência (em uma app real, salvaria no backend)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('finance_notifications')
      const existing = stored ? JSON.parse(stored) : []
      const updated = [newNotification, ...existing].slice(0, 100) // Manter apenas as 100 mais recentes
      localStorage.setItem('finance_notifications', JSON.stringify(updated))
    }
  }

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id })
  }

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' })
  }

  const clearNotification = (id: string) => {
    dispatch({ type: 'CLEAR_NOTIFICATION', payload: id })
  }

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' })
  }

  const value: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Hook para criar notificações específicas do sistema financeiro
export const useFinanceNotifications = () => {
  const { addNotification } = useNotifications()

  const notifyTransaction = (amount: number, type: 'income' | 'expense', description: string) => {
    addNotification({
      type: 'transaction',
      title: type === 'income' ? 'Receita registrada' : 'Despesa registrada',
      message: `${description}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      read: false,
      metadata: { amount }
    })
  }

  const notifyGoalProgress = (goalName: string, progress: number) => {
    if (progress >= 100) {
      addNotification({
        type: 'achievement',
        title: 'Meta concluída! 🎉',
        message: `Parabéns! Você completou a meta "${goalName}"`,
        read: false,
        metadata: { goalName }
      })
    } else if (progress >= 75) {
      addNotification({
        type: 'goal',
        title: 'Quase lá!',
        message: `Você está a ${100 - progress}% de completar "${goalName}"`,
        read: false,
        metadata: { goalName }
      })
    }
  }

  const notifyPaymentReminder = (description: string, daysUntilDue: number) => {
    addNotification({
      type: 'reminder',
      title: 'Lembrete de pagamento',
      message: `${description} ${daysUntilDue > 0 ? `vence em ${daysUntilDue} dias` : 'vence hoje'}`,
      read: false,
      metadata: { priority: daysUntilDue <= 1 ? 'high' : daysUntilDue <= 3 ? 'medium' : 'low' }
    })
  }

  return {
    notifyTransaction,
    notifyGoalProgress,
    notifyPaymentReminder
  }
}
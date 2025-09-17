import React, { useState, useRef, useEffect } from 'react'
import {
  Bell,
  X,
  Check,
  DollarSign,
  TrendingUp,
  Target,
  AlertCircle,
  User,
  Calendar,
  CreditCard,
  MoreHorizontal,
  Settings
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export interface Notification {
  id: string
  type: 'transaction' | 'goal' | 'system' | 'achievement' | 'reminder'
  title: string
  message: string
  timestamp: Date
  read: boolean
  avatar?: string
  actionUrl?: string
  metadata?: {
    amount?: number
    goalName?: string
    achievementType?: string
    priority?: 'low' | 'medium' | 'high'
  }
}

interface NotificationDropdownProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClearNotification: (id: string) => void
  onNotificationClick: (notification: Notification) => void
  className?: string
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'transaction':
      return <DollarSign className="h-4 w-4 text-green-600" />
    case 'goal':
      return <Target className="h-4 w-4 text-blue-600" />
    case 'achievement':
      return <TrendingUp className="h-4 w-4 text-purple-600" />
    case 'reminder':
      return <Calendar className="h-4 w-4 text-orange-600" />
    case 'system':
      return <AlertCircle className="h-4 w-4 text-red-600" />
    default:
      return <Bell className="h-4 w-4 text-gray-600" />
  }
}

const formatTimestamp = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
  onNotificationClick,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length
  const recentNotifications = notifications.slice(0, 8) // Mostrar apenas as 8 mais recentes

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    onNotificationClick(notification)
    setIsOpen(false)
  }

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onMarkAsRead(id)
  }

  const handleClearNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onClearNotification(id)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center rounded-full"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notificações
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Marcar todas como lidas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mb-2 text-gray-300" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors duration-150 ${
                    !notification.read
                      ? 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={() => setHoveredNotification(notification.id)}
                  onMouseLeave={() => setHoveredNotification(null)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0 mt-1">
                      {notification.avatar ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {notification.title}
                          </p>
                          <p className={`text-xs mt-1 ${!notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                        )}
                      </div>

                      {/* Metadata */}
                      {notification.metadata && (
                        <div className="mt-2 text-xs">
                          {notification.metadata.amount && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                              <DollarSign className="h-3 w-3 mr-1" />
                              R$ {notification.metadata.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                          {notification.metadata.goalName && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                              <Target className="h-3 w-3 mr-1" />
                              {notification.metadata.goalName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions (show on hover) */}
                    {hoveredNotification === notification.id && (
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                            title="Marcar como lida"
                          >
                            <Check className="h-3 w-3 text-blue-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleClearNotification(e, notification.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                          title="Remover notificação"
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 8 && (
            <>
              <Separator />
              <div className="p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20"
                  onClick={() => {
                    setIsOpen(false)
                    // Navegar para página de notificações completa
                    window.location.href = '/notificacoes'
                  }}
                >
                  Ver todas as notificações
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
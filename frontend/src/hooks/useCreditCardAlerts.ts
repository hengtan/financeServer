import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  READ = 'READ',
  DISMISSED = 'DISMISSED',
  EXPIRED = 'EXPIRED'
}

export interface CreditCardAlert {
  id: string
  userId: string
  type: string
  severity: AlertSeverity
  status: AlertStatus
  title: string
  message: string
  description?: string
  data: {
    amount: number
    account: string
    metadata: {
      cardId: string
      cardBrand: string
      cardLastDigits: string
      cardColor: string
      dueDate: string
      closingDate: string
      daysUntilDue: number
    }
  }
  actionUrl?: string
  actionText?: string
  triggeredAt: string
  readAt?: string
  dismissedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export function useCreditCardAlerts() {
  const [alerts, setAlerts] = useState<CreditCardAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async (shouldGenerate = false) => {
    try {
      setIsLoading(true)
      setError(null)

      // Generate alerts first if requested
      if (shouldGenerate) {
        console.log('🔄 Generating smart alerts...')
        try {
          await apiService.post('/alerts/smart-generate', {})
          console.log('✅ Alerts generated successfully')
        } catch (genErr) {
          console.warn('⚠️ Error generating alerts (will still fetch):', genErr)
        }
      }

      console.log('🔔 Fetching credit card alerts')

      const response = await apiService.get<CreditCardAlert[]>('/alerts/credit-cards')

      console.log('🔔 Credit card alerts response:', response)

      if (response.success && response.data) {
        console.log('✅ Credit card alerts:', response.data.length)
        setAlerts(response.data)
      } else {
        console.error('❌ Invalid response:', response)
        setError('Erro ao carregar alertas')
      }
    } catch (err) {
      console.error('❌ Error fetching credit card alerts:', err)
      setError('Erro ao carregar alertas')
      setAlerts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      const response = await apiService.patch(`/alerts/${alertId}/read`, {})

      if (response.success) {
        // Update local state
        setAlerts(prev => prev.map(alert =>
          alert.id === alertId
            ? { ...alert, status: AlertStatus.READ, readAt: new Date().toISOString() }
            : alert
        ))
      }
    } catch (err) {
      console.error('❌ Error marking alert as read:', err)
    }
  }, [])

  const markAsDismissed = useCallback(async (alertId: string) => {
    try {
      const response = await apiService.patch(`/alerts/${alertId}/dismiss`, {})

      if (response.success) {
        // Remove from local state
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      }
    } catch (err) {
      console.error('❌ Error dismissing alert:', err)
    }
  }, [])

  const generateAlerts = useCallback(async () => {
    await fetchAlerts(true)
  }, [fetchAlerts])

  useEffect(() => {
    // Generate alerts on first load
    fetchAlerts(true)
  }, [fetchAlerts])

  return {
    alerts,
    isLoading,
    error,
    refetch: fetchAlerts,
    markAsRead,
    markAsDismissed,
    generateAlerts
  }
}

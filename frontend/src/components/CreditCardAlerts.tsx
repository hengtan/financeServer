import { useCreditCardAlerts, AlertSeverity, type CreditCardAlert } from '@/hooks/useCreditCardAlerts'
import { AlertCircle, CreditCard, X, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CreditCardAlerts() {
  const { alerts, isLoading, markAsRead, markAsDismissed } = useCreditCardAlerts()

  if (isLoading) {
    return null
  }

  // Filter only ACTIVE alerts (not read or dismissed)
  const activeAlerts = alerts.filter(alert => alert.status === 'ACTIVE')

  if (activeAlerts.length === 0) {
    return null
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
      case AlertSeverity.HIGH:
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100'
      case AlertSeverity.MEDIUM:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100'
      case AlertSeverity.LOW:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100'
    }
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
      case AlertSeverity.HIGH:
        return <AlertCircle className="w-5 h-5" />
      case AlertSeverity.MEDIUM:
      case AlertSeverity.LOW:
        return <CreditCard className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const handleDismiss = async (alertId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await markAsDismissed(alertId)
  }

  const handleMarkAsRead = async (alertId: string) => {
    await markAsRead(alertId)
  }

  return (
    <div className="space-y-3 mb-6">
      {activeAlerts.map((alert) => (
        <Link
          key={alert.id}
          to={alert.actionUrl || '/cards'}
          onClick={() => handleMarkAsRead(alert.id)}
          className={`block p-4 rounded-lg border-2 transition-all hover:shadow-md ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getSeverityIcon(alert.severity)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    {alert.title}
                  </h3>
                  <p className="text-sm opacity-90 mb-2">
                    {alert.message}
                  </p>
                  {alert.description && (
                    <p className="text-xs opacity-75">
                      {alert.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={(e) => handleDismiss(alert.id, e)}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  title="Dispensar alerta"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {alert.data.metadata && (
                <div className="mt-3 flex items-center gap-4 text-xs opacity-75">
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    <span>
                      {alert.data.metadata.cardBrand} ****{alert.data.metadata.cardLastDigits}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Vencimento: {new Date(alert.data.metadata.dueDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Valor: R$ {alert.data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              {alert.actionText && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 text-xs font-medium underline">
                    {alert.actionText}
                    <CheckCircle className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

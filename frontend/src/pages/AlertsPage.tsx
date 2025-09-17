import { usePageTitle } from '@/hooks/usePageTitle'
import { SmartAlerts } from '@/components/SmartAlerts'

export const AlertsPage = () => {
  usePageTitle('Alertas')

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <SmartAlerts />
      </div>
    </div>
  )
}
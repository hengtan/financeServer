import { usePageTitle } from '@/hooks/usePageTitle'
import { CustomizableDashboard } from '@/components/dashboard/CustomizableDashboard'

export const CustomDashboardPage = () => {
  usePageTitle('Dashboard Personalizado')

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Personalizado 🎛️
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure seu dashboard da forma que preferir. Arraste, redimensione e personalize os widgets conforme suas necessidades.
          </p>
        </div>

        <CustomizableDashboard />
      </div>
    </div>
  )
}
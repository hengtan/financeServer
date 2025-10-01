import { useState, useEffect } from 'react'
import { dashboardService, DashboardOverview } from '@/services/dashboard'

interface UseDashboardDataReturn {
  data: DashboardOverview | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardData(selectedDate: Date): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Para agora, usar 30 dias como período padrão
      // No futuro, podemos calcular com base no selectedDate
      const response = await dashboardService.getOverview(30)

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.error || 'Erro ao carregar dados do dashboard')
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  }
}

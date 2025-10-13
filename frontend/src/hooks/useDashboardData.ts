import { useState, useEffect } from 'react'
import { dashboardService, DashboardOverview } from '@/services/dashboard'
import { useDashboardRefresh } from '@/contexts/DashboardRefreshContext'

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

  // Listen to global refresh trigger
  const { refreshTrigger } = useDashboardRefresh()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Calcular primeiro e último dia do mês selecionado
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth()

      // Primeiro dia do mês às 00:00:00
      const startDate = new Date(year, month, 1)
      startDate.setHours(0, 0, 0, 0)

      // Último dia do mês às 23:59:59
      const endDate = new Date(year, month + 1, 0) // Dia 0 do próximo mês = último dia do mês atual
      endDate.setHours(23, 59, 59, 999)

      // Passar datas específicas ao backend
      const response = await dashboardService.getOverview({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.errors?.[0] || 'Erro ao carregar dados do dashboard')
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
  }, [selectedDate, refreshTrigger])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  }
}

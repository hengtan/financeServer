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

      // Calcular primeiro e último dia do mês selecionado
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth()

      // Primeiro dia do mês às 00:00:00
      const startDate = new Date(year, month, 1)
      startDate.setHours(0, 0, 0, 0)

      // Último dia do mês às 23:59:59
      const endDate = new Date(year, month + 1, 0) // Dia 0 do próximo mês = último dia do mês atual
      endDate.setHours(23, 59, 59, 999)

      console.log(`📅 Fetching dashboard data for ${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`)

      // Passar datas específicas ao backend
      const response = await dashboardService.getOverview({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

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

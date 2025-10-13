import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'
import { useDashboardRefresh } from '@/contexts/DashboardRefreshContext'

interface IncomeCategory {
  categoryId: string
  categoryName: string
  total: number
  count: number
  percentage: number
}

export function useIncomeByCategory(selectedDate: Date) {
  const [data, setData] = useState<IncomeCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen to global refresh trigger
  const { refreshTrigger } = useDashboardRefresh()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Calculate month start and end dates
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      startDate.setUTCHours(0, 0, 0, 0)

      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
      endDate.setUTCHours(23, 59, 59, 999)

      console.log('💰 Fetching income by category:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      const response = await apiService.get<IncomeCategory[]>(
        `/dashboard/income-by-category?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )

      console.log('📊 Income by category response:', response)

      if (response.success && response.data) {
        console.log('✅ Income categories:', response.data.length)
        setData(response.data)
      } else {
        console.error('❌ Invalid response:', response)
        setError('Erro ao carregar receitas por categoria')
      }
    } catch (err) {
      console.error('❌ Error fetching income by category:', err)
      setError('Erro ao carregar receitas por categoria')
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchData()
  }, [selectedDate, refreshTrigger, fetchData])

  return { data, isLoading, error }
}

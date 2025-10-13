import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'
import { useDashboardRefresh } from '@/contexts/DashboardRefreshContext'

interface MonthlyBalance {
  month: string
  name: string
  fullDate: string
  income: number
  expenses: number
  balance: number
  value: number
}

export function useMonthlyBalance(months: number = 6) {
  const [data, setData] = useState<MonthlyBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen to global refresh trigger
  const { refreshTrigger } = useDashboardRefresh()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('📊 Fetching monthly balance for', months, 'months')

      const response = await apiService.get<MonthlyBalance[]>(
        `/dashboard/monthly-balance?months=${months}`
      )

      console.log('📊 Monthly balance response:', response)

      if (response.success && response.data) {
        console.log('✅ Monthly balance data:', response.data.length, 'months')
        setData(response.data)
      } else {
        console.error('❌ Invalid response:', response)
        setError('Erro ao carregar balanço mensal')
      }
    } catch (err) {
      console.error('❌ Error fetching monthly balance:', err)
      setError('Erro ao carregar balanço mensal')
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [months])

  useEffect(() => {
    fetchData()
  }, [months, refreshTrigger, fetchData])

  return { data, isLoading, error }
}

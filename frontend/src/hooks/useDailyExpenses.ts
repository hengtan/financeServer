import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'
import { useDashboardRefresh } from '@/contexts/DashboardRefreshContext'

interface DailyExpense {
  date: string
  total: number
}

export function useDailyExpenses(days: number = 30) {
  const [data, setData] = useState<DailyExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen to global refresh trigger
  const { refreshTrigger } = useDashboardRefresh()

  console.log('🔄 useDailyExpenses: refreshTrigger =', refreshTrigger, 'days =', days)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔍 Fetching daily expenses for', days, 'days')

      const response = await apiService.get<DailyExpense[]>(
        `/dashboard/daily-expenses?days=${days}`
      )

      console.log('📊 Daily expenses response:', response)

      if (response.success && response.data) {
        console.log('✅ Daily expenses data:', response.data.length, 'days')

        // Log dados detalhados para debug
        const dataWithValues = response.data.filter(d => d.total > 0)
        console.log('💰 Days with expenses:', dataWithValues.length)
        console.log('💸 Data with values:', dataWithValues)

        // Log all data to see what we're getting
        console.log('🔍 ALL DATA:', JSON.stringify(response.data.slice(0, 5), null, 2))
        console.log('🔍 LAST 5 DAYS:', JSON.stringify(response.data.slice(-5), null, 2))

        setData(response.data)
      } else {
        console.error('❌ Invalid response:', response)
        setError('Erro ao carregar gastos diários')
      }
    } catch (err) {
      console.error('❌ Error fetching daily expenses:', err)
      setError('Erro ao carregar gastos diários')
      setData([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
  }, [days, refreshTrigger, fetchData])

  return { data, isLoading, error }
}

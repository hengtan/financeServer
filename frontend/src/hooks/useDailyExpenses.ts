import { useState, useEffect } from 'react'
import { apiService } from '@/services/api'

interface DailyExpense {
  date: string
  total: number
}

export function useDailyExpenses(days: number = 30) {
  const [data, setData] = useState<DailyExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
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
    }

    fetchData()
  }, [days])

  return { data, isLoading, error }
}

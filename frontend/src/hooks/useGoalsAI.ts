import { useState, useEffect } from 'react'
import { analyticsService, GoalPrediction, AtRiskGoal, GoalsDashboard } from '@/services/analytics'
import { useAuth } from '@/contexts/AuthContext'

export function useGoalPrediction(goalId: string | null) {
  const [prediction, setPrediction] = useState<GoalPrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!goalId || !user?.id) {
      setPrediction(null)
      return
    }

    const fetchPrediction = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await analyticsService.getGoalPrediction(goalId, user.id)

        if (response.success) {
          setPrediction(response.data)
        } else {
          setError('Erro ao carregar previsão')
        }
      } catch (err) {
        console.error('Error fetching prediction:', err)
        setError('Erro ao carregar previsão')
      } finally {
        setLoading(false)
      }
    }

    fetchPrediction()
  }, [goalId, user?.id])

  return { prediction, loading, error }
}

export function useAtRiskGoals() {
  const [atRiskGoals, setAtRiskGoals] = useState<AtRiskGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return

    const fetchAtRiskGoals = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await analyticsService.getAtRiskGoals(user.id)

        if (response.success) {
          setAtRiskGoals(response.data.atRiskGoals)
        } else {
          setError('Erro ao carregar metas em risco')
        }
      } catch (err) {
        console.error('Error fetching at-risk goals:', err)
        setError('Erro ao carregar metas em risco')
      } finally {
        setLoading(false)
      }
    }

    fetchAtRiskGoals()
  }, [user?.id])

  return { atRiskGoals, loading, error }
}

export function useGoalsDashboard() {
  const [dashboard, setDashboard] = useState<GoalsDashboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return

    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await analyticsService.getGoalsDashboard(user.id)

        if (response.success) {
          setDashboard(response.data)
        } else {
          setError('Erro ao carregar dashboard')
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err)
        setError('Erro ao carregar dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [user?.id])

  const refetch = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const response = await analyticsService.getGoalsDashboard(user.id)

      if (response.success) {
        setDashboard(response.data)
      }
    } catch (err) {
      console.error('Error refetching dashboard:', err)
      setError('Erro ao atualizar dashboard')
    } finally {
      setLoading(false)
    }
  }

  return { dashboard, loading, error, refetch }
}

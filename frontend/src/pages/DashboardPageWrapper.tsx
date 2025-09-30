import React, { useState, useEffect } from 'react'
import { DashboardPage, DashboardStats, RecentTransaction, FinancialGoal } from './DashboardPage'
import { dashboardService } from '@/services/dashboard'
import { transactionsService } from '@/services/transactions'
import { goalsService } from '@/services/goals'
import { useAuth } from '@/contexts/AuthContext'

export const DashboardPageWrapper = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats[]>([])
  const [transactions, setTransactions] = useState<RecentTransaction[]>([])
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar dados do dashboard em paralelo
      const [dashboardResponse, transactionsResponse, goalsResponse] = await Promise.all([
        dashboardService.getOverview(),
        transactionsService.getTransactions({ limit: 5 }),
        goalsService.getGoals()
      ])

      // Processar dados do dashboard
      if (dashboardResponse.success) {
        const data = dashboardResponse.data
        const formattedStats: DashboardStats[] = [
          {
            id: 'balance',
            title: 'Saldo Total',
            value: `R$ ${data.financial.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            change: `${data.financial.expenseTrend.percentage > 0 ? '+' : ''}${data.financial.expenseTrend.percentage.toFixed(1)}%`,
            trend: data.financial.expenseTrend.direction === 'UP' ? 'up' : data.financial.expenseTrend.direction === 'DOWN' ? 'down' : 'up',
            icon: "💰"
          },
          {
            id: 'expenses',
            title: 'Gastos do Mês',
            value: `R$ ${data.financial.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            change: `${data.financial.expenseTrend.percentage > 0 ? '+' : ''}${data.financial.expenseTrend.percentage.toFixed(1)}%`,
            trend: data.financial.expenseTrend.direction === 'UP' ? 'up' : 'down',
            icon: "💳"
          },
          {
            id: 'income',
            title: 'Receita do Mês',
            value: `R$ ${data.financial.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            change: `${data.financial.netIncome >= 0 ? '+' : ''}${((data.financial.netIncome / (data.financial.totalIncome || 1)) * 100).toFixed(1)}%`,
            trend: data.financial.netIncome >= 0 ? 'up' : 'down',
            icon: "🏦"
          },
          {
            id: 'balance_net',
            title: 'Saldo Líquido',
            value: `R$ ${data.financial.netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            change: `${data.financial.netIncome >= 0 ? '+' : ''}${data.financial.netIncome.toFixed(1)}`,
            trend: data.financial.netIncome >= 0 ? 'up' : 'down',
            icon: "📈"
          }
        ]
        setStats(formattedStats)
      }

      // Processar transações
      if (transactionsResponse.success && transactionsResponse.data.data) {
        const formattedTransactions: RecentTransaction[] = transactionsResponse.data.data.map((t: any) => ({
          id: t.id,
          description: t.description,
          amount: parseFloat(t.amount || 0),
          date: t.date,
          category: t.category?.name || 'Sem categoria',
          account: t.account?.name || 'Conta',
          type: t.type === 'INCOME' ? 'income' : 'expense',
          categoryColor: t.category?.color || '#6B7280'
        }))
        setTransactions(formattedTransactions)
      }

      // Processar metas
      if (goalsResponse.success && goalsResponse.data) {
        const formattedGoals: FinancialGoal[] = goalsResponse.data.map((g: any) => ({
          id: g.id,
          title: g.name,
          target: parseFloat(g.targetAmount || 0),
          current: parseFloat(g.currentAmount || 0),
          progress: parseFloat(g.targetAmount || 0) > 0 ?
            (parseFloat(g.currentAmount || 0) / parseFloat(g.targetAmount || 0)) * 100 : 0,
          category: g.category || 'Geral',
          deadline: g.targetDate
        }))
        setGoals(formattedGoals)
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      setError('Erro ao carregar dados do dashboard')

      // Em caso de erro, mostrar dados vazios em vez de fallback
      setStats([
        {
          id: 'balance',
          title: 'Saldo Total',
          value: 'R$ 0,00',
          change: '0%',
          trend: 'up',
          icon: "💰"
        },
        {
          id: 'expenses',
          title: 'Gastos do Mês',
          value: 'R$ 0,00',
          change: '0%',
          trend: 'down',
          icon: "💳"
        },
        {
          id: 'income',
          title: 'Receita do Mês',
          value: 'R$ 0,00',
          change: '0%',
          trend: 'up',
          icon: "🏦"
        },
        {
          id: 'balance_net',
          title: 'Saldo Líquido',
          value: 'R$ 0,00',
          change: '0%',
          trend: 'up',
          icon: "📈"
        }
      ])
      setTransactions([])
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardPage
      stats={stats}
      transactions={transactions}
      goals={goals}
      alerts={[]} // Por enquanto, sem alertas
      summary={{
        month: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        income: stats.find(s => s.id === 'income') ?
          parseFloat(stats.find(s => s.id === 'income')!.value.replace(/[R$\s.,]/g, '').replace(/(\d{2})$/, '.$1')) : 0,
        expenses: stats.find(s => s.id === 'expenses') ?
          parseFloat(stats.find(s => s.id === 'expenses')!.value.replace(/[R$\s.,]/g, '').replace(/(\d{2})$/, '.$1')) : 0,
        balance: stats.find(s => s.id === 'balance_net') ?
          parseFloat(stats.find(s => s.id === 'balance_net')!.value.replace(/[R$\s.,]/g, '').replace(/(\d{2})$/, '.$1')) : 0,
        topCategories: []
      }}
      labels={{
        welcome: `Olá, ${user?.name?.split(' ')[0] || 'Usuário'}! 👋`,
        totalBalance: 'Saldo Total',
        monthlyExpenses: 'Gastos do Mês',
        savings: 'Receita do Mês',
        investments: 'Saldo Líquido'
      }}
    />
  )
}
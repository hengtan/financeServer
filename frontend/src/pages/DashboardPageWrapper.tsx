import React, { useState, useEffect } from 'react'
import { DashboardPage, DashboardStats, RecentTransaction, FinancialGoal } from './DashboardPage'
import { dashboardService } from '@/services/dashboard'
import { transactionsService } from '@/services/transactions'
import { goalsService } from '@/services/goals'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

export const DashboardPageWrapper = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats[]>([])
  const [transactions, setTransactions] = useState<RecentTransaction[]>([])
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [summaryData, setSummaryData] = useState({
    month: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    income: 0,
    expenses: 0,
    balance: 0,
    topCategories: [] as Array<{ name: string; amount: number; icon?: string }>
  })
  const [error, setError] = useState<string | null>(null)
  const [showTour, setShowTour] = useState(false)
  const [showTourButton, setShowTourButton] = useState(false)

  useEffect(() => {
    loadDashboardData()
    checkTourStatus()
  }, [])

  const checkTourStatus = () => {
    const tourCompleted = localStorage.getItem('onboarding-completed')
    const isSandboxUser = user?.email?.includes('sandbox') || user?.email?.includes('financeserver.dev')

    if (!tourCompleted) {
      // Se nunca fez o tour, mostrar automaticamente
      setShowTour(true)
      setShowTourButton(false)
    } else {
      // Se já fez o tour, mostrar botão para refazer (especialmente para sandbox)
      setShowTour(false)
      setShowTourButton(true)
    }
  }

  const startTour = () => {
    // Remove flag de tour completo para permitir exibição
    localStorage.removeItem('onboarding-completed')
    setShowTour(true)
    setShowTourButton(false)
  }

  const handleTourComplete = () => {
    setShowTour(false)
    setShowTourButton(true)
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar dados do dashboard em paralelo (365 dias para mostrar todos os dados)
      const [dashboardResponse, transactionsResponse, goalsResponse, categoriesResponse] = await Promise.all([
        dashboardService.getOverview(365),
        transactionsService.getTransactions({ limit: 5 }),
        goalsService.getGoals(),
        transactionsService.getCategoriesSummary()
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

      // Processar categorias para o summary
      const categoryIcons: Record<string, string> = {
        'Alimentação': '🍽️',
        'Transporte': '🚗',
        'Entretenimento': '🎯',
        'Saúde': '💊',
        'Educação': '📚',
        'Casa': '🏠',
        'Vestuário': '👕'
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        const topCategories = categoriesResponse.data
          .filter((cat: any) => cat.amount < 0)
          .slice(0, 3)
          .map((cat: any) => ({
            name: cat.category,
            amount: Math.abs(cat.amount),
            icon: categoryIcons[cat.category] || '📊'
          }))

        setSummaryData({
          month: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          income: dashboardResponse.data?.financial.totalIncome || 0,
          expenses: dashboardResponse.data?.financial.totalExpenses || 0,
          balance: dashboardResponse.data?.financial.netIncome || 0,
          topCategories
        })
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
    <div className="relative">
      {/* Botão para iniciar tour (quando disponível) */}
      {showTourButton && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={startTour}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white shadow-lg hover:shadow-xl border-primary/20 hover:border-primary/40"
          >
            <HelpCircle className="h-4 w-4" />
            Tour do Dashboard
          </Button>
        </div>
      )}

      <DashboardPage
        stats={stats}
        transactions={transactions}
        goals={goals}
        alerts={[]} // Por enquanto, sem alertas
        summary={summaryData}
        labels={{
          welcome: `Olá, ${user?.name?.split(' ')[0] || 'Usuário'}! 👋`,
          totalBalance: 'Saldo Total',
          monthlyExpenses: 'Gastos do Mês',
          savings: 'Receita do Mês',
          investments: 'Saldo Líquido'
        }}
        showOnboarding={showTour}
        onOnboardingComplete={handleTourComplete}
      />
    </div>
  )
}
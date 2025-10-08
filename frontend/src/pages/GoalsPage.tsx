import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NewGoalModal } from '@/components/NewGoalModal'
import { AddValueModal } from '@/components/AddValueModal'
import { GoalAIInsight } from '@/components/GoalAIInsight'
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { goalsService, Goal, GoalsSummary } from '@/services/goals'
import { useAtRiskGoals, useGoalsDashboard } from '@/hooks/useGoalsAI'
import { formatCurrency } from '@/utils/currency'

export const GoalsPage = () => {
  usePageTitle('Metas')

  const [activeTab, setActiveTab] = useState('ativas')
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false)
  const [isAddValueOpen, setIsAddValueOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [summary, setSummary] = useState<GoalsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // AI Hooks
  const { atRiskGoals } = useAtRiskGoals()
  const { dashboard } = useGoalsDashboard()

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await goalsService.getGoals()
      if (response.success) {
        setGoals(response.data.goals)
        setSummary(response.data.summary)
      } else {
        setError('Erro ao carregar metas')
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
      setError('Erro ao carregar metas')
    } finally {
      setLoading(false)
    }
  }

  const achievements = [
    {
      title: "Primeira Meta Concluída",
      description: "Parabéns! Você atingiu sua primeira meta financeira",
      date: "2024-01-15",
      icon: <Award className="h-6 w-6" />
    },
    {
      title: "Economia Consistente",
      description: "3 meses consecutivos atingindo suas metas mensais",
      date: "2024-01-10",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: "Meta Disciplinada",
      description: "Nunca atrasou um depósito mensal em sua reserva de emergência",
      date: "2024-01-05",
      icon: <CheckCircle className="h-6 w-6" />
    }
  ]

  const activeGoals = goals.filter(goal => goal.status === 'ACTIVE')
  const completedGoals = goals.filter(goal => goal.status === 'COMPLETED')

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const calculateTimeLeft = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Atrasado"
    if (diffDays === 0) return "Hoje"
    if (diffDays === 1) return "1 dia"
    if (diffDays < 30) return `${diffDays} dias`

    const diffMonths = Math.ceil(diffDays / 30)
    return `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`
  }

  const getStatusColor = (goal: any) => {
    const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
    const timeLeft = calculateTimeLeft(goal.deadline)

    if (goal.status === 'completed') return 'text-green-600'
    if (timeLeft === 'Atrasado') return 'text-red-600'
    if (progress < 25) return 'text-red-600'
    if (progress < 50) return 'text-yellow-600'
    if (progress < 80) return 'text-blue-600'
    return 'text-green-600'
  }

  const totalSaved = summary?.totalCurrent || 0
  const totalTarget = summary?.totalTarget || 0
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  const handleNewGoal = (goal: any) => {
    setGoals([...goals, goal])
  }

  const handleAddValue = (amount: number) => {
    if (selectedGoal) {
      setGoals(goals.map(goal =>
        goal.id === selectedGoal.id
          ? { ...goal, currentAmount: goal.currentAmount + amount }
          : goal
      ))
    }
  }

  const handleDepositMonthly = (goalId: number) => {
    setGoals(goals.map(goal =>
      goal.id === goalId
        ? { ...goal, currentAmount: goal.currentAmount + goal.monthlyTarget }
        : goal
    ))
  }

  const handleDeleteGoal = (goalId: number) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      setGoals(goals.filter(goal => goal.id !== goalId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Metas Financeiras</h1>
            <p className="text-muted-foreground">Defina, acompanhe e conquiste seus objetivos financeiros</p>
          </div>
          <Button
            onClick={() => setIsNewGoalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Metas Ativas</p>
                  <p className="text-2xl font-bold text-blue-600">{activeGoals.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Economizado</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalSaved)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progresso Geral</p>
                  <p className="text-2xl font-bold text-purple-600">{overallProgress.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Metas Concluídas</p>
                  <p className="text-2xl font-bold text-yellow-600">{completedGoals.length}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('ativas')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'ativas'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Metas Ativas ({activeGoals.length})
                </button>
                <button
                  onClick={() => setActiveTab('concluidas')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'concluidas'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Concluídas ({completedGoals.length})
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {(activeTab === 'ativas' ? activeGoals : completedGoals).map((goal) => {
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
                const timeLeft = calculateTimeLeft(goal.deadline)

                return (
                  <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center mb-2">
                            <div className={`w-3 h-3 rounded-full mr-3 bg-${goal.color}-500`}></div>
                            {goal.title}
                            {goal.status === 'completed' && (
                              <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                            )}
                          </CardTitle>
                          <CardDescription>{goal.description}</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Progresso</span>
                            <span className={`text-sm font-bold ${getStatusColor(goal)}`}>
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 bg-${goal.color}-500`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span>R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Restante</p>
                            <p className="font-medium">
                              R$ {(goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Prazo</p>
                            <p className={`font-medium ${getStatusColor(goal)}`}>
                              {timeLeft}
                            </p>
                          </div>
                        </div>

                        {/* AI Insights */}
                        {goal.status === 'ACTIVE' && (
                          <GoalAIInsight goalId={goal.id} />
                        )}

                        {goal.status === 'active' && (
                          <div className="flex space-x-2 mt-4">
                            <Button
                              size="sm"
                              className="flex-1"
                              variant="outline"
                              onClick={() => {
                                setSelectedGoal(goal)
                                setIsAddValueOpen(true)
                              }}
                            >
                              Adicionar Valor
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleDepositMonthly(goal.id)}
                            >
                              Depositar Meta Mensal
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Próximos Vencimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGoals
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                    .slice(0, 3)
                    .map((goal) => {
                      const timeLeft = calculateTimeLeft(goal.deadline)
                      const isUrgent = timeLeft.includes('dia') || timeLeft === 'Hoje' || timeLeft === 'Atrasado'

                      return (
                        <div key={goal.id} className="flex items-center space-x-3">
                          {isUrgent ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-blue-500" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{goal.title}</p>
                            <p className={`text-sm ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                              {timeLeft} restante{timeLeft === 'Atrasado' ? '' : 's'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{achievement.title}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(achievement.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  Insights de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard && dashboard.insights && dashboard.insights.length > 0 ? (
                    dashboard.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          insight.priority === 'high'
                            ? 'bg-red-50 border-red-200'
                            : insight.priority === 'medium'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <p className={`text-sm font-medium mb-1 ${
                          insight.priority === 'high'
                            ? 'text-red-900'
                            : insight.priority === 'medium'
                            ? 'text-yellow-900'
                            : 'text-blue-900'
                        }`}>
                          {insight.type === 'warning' && '⚠️ '}
                          {insight.type === 'recommendation' && '💡 '}
                          {insight.type === 'success' && '✅ '}
                          Insight IA
                        </p>
                        <p className={`text-sm ${
                          insight.priority === 'high'
                            ? 'text-red-700'
                            : insight.priority === 'medium'
                            ? 'text-yellow-700'
                            : 'text-blue-700'
                        }`}>
                          {insight.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-600">
                        Analisando suas metas com IA...
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <NewGoalModal
          isOpen={isNewGoalOpen}
          onClose={() => setIsNewGoalOpen(false)}
          onSubmit={handleNewGoal}
        />

        <AddValueModal
          isOpen={isAddValueOpen}
          onClose={() => {
            setIsAddValueOpen(false)
            setSelectedGoal(null)
          }}
          goalTitle={selectedGoal?.title || ''}
          onSubmit={handleAddValue}
        />
      </div>
    </div>
  )
}
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NewGoalModal } from '@/components/NewGoalModal'
import { AddValueModal } from '@/components/AddValueModal'
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
  AlertCircle
} from 'lucide-react'
import { useState } from 'react'

export const GoalsPage = () => {
  usePageTitle('Metas')

  const [activeTab, setActiveTab] = useState('ativas')
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false)
  const [isAddValueOpen, setIsAddValueOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Viagem para Europa",
      description: "Economia para viagem de 15 dias pela Europa com a família",
      targetAmount: 15000,
      currentAmount: 8500,
      deadline: "2024-12-31",
      category: "Viagem",
      status: "active",
      monthlyTarget: 650,
      createdAt: "2024-01-01",
      color: "blue"
    },
    {
      id: 2,
      title: "Reserva de Emergência",
      description: "Fundo de emergência equivalente a 6 meses de despesas",
      targetAmount: 30000,
      currentAmount: 22500,
      deadline: "2024-06-30",
      category: "Emergência",
      status: "active",
      monthlyTarget: 1500,
      createdAt: "2023-12-01",
      color: "green"
    },
    {
      id: 3,
      title: "Carro Novo",
      description: "Entrada para financiamento de um carro popular zero km",
      targetAmount: 50000,
      currentAmount: 12000,
      deadline: "2025-03-31",
      category: "Veículo",
      status: "active",
      monthlyTarget: 2500,
      createdAt: "2024-01-01",
      color: "purple"
    },
    {
      id: 4,
      title: "Curso de MBA",
      description: "Pós-graduação em Administração de Empresas",
      targetAmount: 25000,
      currentAmount: 25000,
      deadline: "2024-01-15",
      category: "Educação",
      status: "completed",
      monthlyTarget: 2000,
      createdAt: "2023-02-01",
      color: "yellow"
    },
    {
      id: 5,
      title: "Reforma da Casa",
      description: "Reforma completa da cozinha e banheiros",
      targetAmount: 35000,
      currentAmount: 5200,
      deadline: "2024-08-31",
      category: "Casa",
      status: "active",
      monthlyTarget: 4000,
      createdAt: "2024-01-01",
      color: "red"
    }
  ])

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

  const activeGoals = goals.filter(goal => goal.status === 'active')
  const completedGoals = goals.filter(goal => goal.status === 'completed')

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

  const totalSaved = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const overallProgress = (totalSaved / totalTarget) * 100

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
                    R$ {totalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

                        <div className="grid grid-cols-3 gap-4 text-center">
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
                          <div>
                            <p className="text-sm text-gray-600">Meta Mensal</p>
                            <p className="font-medium">
                              R$ {goal.monthlyTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        {goal.status === 'active' && (
                          <div className="flex space-x-2">
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
                <CardTitle>Dicas Inteligentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">💡 Dica de Economia</p>
                    <p className="text-sm text-blue-700">
                      Você pode atingir sua meta de viagem 2 meses antes se economizar R$ 50 a mais por mês
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-1">🎯 Meta Sugerida</p>
                    <p className="text-sm text-green-700">
                      Que tal criar uma meta para um fundo de investimento? Baseado no seu perfil, recomendamos R$ 500/mês
                    </p>
                  </div>
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
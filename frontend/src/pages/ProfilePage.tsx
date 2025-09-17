import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  User,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Edit,
  Trophy,
  Target,
  TrendingUp,
  DollarSign,
  CreditCard,
  Wallet,
  Star,
  Award,
  Activity
} from 'lucide-react'

export interface ProfilePageProps {
  onEdit?: () => void
  stats?: {
    totalTransactions: number
    totalSaved: number
    goalsCompleted: number
    streakDays: number
  }
  achievements?: Array<{
    id: string
    title: string
    description: string
    icon: string
    date: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }>
  recentActivity?: Array<{
    id: string
    type: 'transaction' | 'goal' | 'achievement'
    title: string
    description: string
    date: string
    amount?: number
  }>
}

export const ProfilePage = ({
  onEdit,
  stats: externalStats,
  achievements: externalAchievements,
  recentActivity: externalActivity
}: ProfilePageProps) => {
  usePageTitle('Perfil')

  const { user } = useAuth()

  // Default stats
  const defaultStats = {
    totalTransactions: 1247,
    totalSaved: 12450.50,
    goalsCompleted: 8,
    streakDays: 45
  }

  // Default achievements
  const defaultAchievements = [
    {
      id: '1',
      title: 'Primeiro Passo',
      description: 'Criou sua primeira transação',
      icon: '🎯',
      date: '2024-01-15',
      rarity: 'common' as const
    },
    {
      id: '2',
      title: 'Poupador Iniciante',
      description: 'Economizou R$ 1.000',
      icon: '🏦',
      date: '2024-02-01',
      rarity: 'rare' as const
    },
    {
      id: '3',
      title: 'Meta Alcançada',
      description: 'Completou sua primeira meta financeira',
      icon: '🏆',
      date: '2024-02-15',
      rarity: 'epic' as const
    },
    {
      id: '4',
      title: 'Disciplina de Ferro',
      description: 'Manteve streak de 30 dias',
      icon: '⚡',
      date: '2024-03-01',
      rarity: 'legendary' as const
    }
  ]

  // Default recent activity
  const defaultActivity = [
    {
      id: '1',
      type: 'transaction' as const,
      title: 'Depósito realizado',
      description: 'Conta Poupança',
      date: '2024-03-15',
      amount: 500.00
    },
    {
      id: '2',
      type: 'goal' as const,
      title: 'Meta atualizada',
      description: 'Viagem para Europa - 75% concluída',
      date: '2024-03-14'
    },
    {
      id: '3',
      type: 'achievement' as const,
      title: 'Conquista desbloqueada',
      description: 'Poupador Consistente',
      date: '2024-03-13'
    }
  ]

  const stats = externalStats || defaultStats
  const achievements = externalAchievements || defaultAchievements
  const recentActivity = externalActivity || defaultActivity

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 dark:bg-gray-200/20 dark:text-gray-200'
      case 'rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-200/20 dark:text-blue-200'
      case 'epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-200/20 dark:text-purple-200'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200/20 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-200/20 dark:text-gray-200'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <DollarSign className="h-4 w-4" />
      case 'goal': return <Target className="h-4 w-4" />
      case 'achievement': return <Trophy className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header do Perfil */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-foreground">{user?.name}</h1>
                  <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                    <Star className="h-3 w-3 mr-1" />
                    Usuário Premium
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalTransactions}</p>
                    <p className="text-sm text-muted-foreground">Transações</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{formatCurrency(stats.totalSaved)}</p>
                    <p className="text-sm text-muted-foreground">Economizado</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.goalsCompleted}</p>
                    <p className="text-sm text-muted-foreground">Metas Alcançadas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-500">{stats.streakDays}</p>
                    <p className="text-sm text-muted-foreground">Dias de Streak</p>
                  </div>
                </div>
              </div>

              <Button onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    Progresso Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Meta Mensal</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Economia Anual</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Orçamento</span>
                      <span>90%</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Wallet className="h-5 w-5 mr-2 text-blue-500" />
                    Contas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Conta Corrente</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(5430.20)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Poupança</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(12450.50)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Investimentos</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(8750.00)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Target className="h-5 w-5 mr-2 text-orange-500" />
                    Metas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Viagem Europa</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carro Novo</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Emergência</span>
                      <span>90%</span>
                    </div>
                    <Progress value={90} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Últimas Conquistas</CardTitle>
                <CardDescription>Suas conquistas mais recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {achievements.slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className="text-center p-4 border border-border rounded-lg">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="font-medium text-sm mb-1">{achievement.title}</h4>
                      <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conquistas */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Todas as Conquistas
                </CardTitle>
                <CardDescription>
                  Você desbloqueou {achievements.length} de 20 conquistas disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(achievement.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Conquistas</CardTitle>
                <CardDescription>Continue progredindo para desbloquear estas conquistas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border border-dashed border-border rounded-lg opacity-75">
                    <div className="text-2xl grayscale">🏅</div>
                    <div className="flex-1">
                      <h4 className="font-medium">Mestre das Metas</h4>
                      <p className="text-sm text-muted-foreground mb-2">Complete 10 metas financeiras</p>
                      <div className="flex items-center gap-2">
                        <Progress value={80} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground">8/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border border-dashed border-border rounded-lg opacity-75">
                    <div className="text-2xl grayscale">💎</div>
                    <div className="flex-1">
                      <h4 className="font-medium">Investidor Diamante</h4>
                      <p className="text-sm text-muted-foreground mb-2">Invista R$ 50.000</p>
                      <div className="flex items-center gap-2">
                        <Progress value={35} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground">R$ 17.500/R$ 50.000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atividade */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Suas últimas atividades na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                      <div className="bg-muted p-2 rounded-full">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          {activity.amount && (
                            <span className="text-sm font-medium text-success">
                              {formatCurrency(activity.amount)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(activity.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Informações */}
          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Suas informações de perfil e contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-medium">{user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-medium">(11) 99999-9999</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Membro desde</p>
                        <p className="font-medium">Janeiro 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Localização</p>
                        <p className="font-medium">São Paulo, Brasil</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nível</p>
                        <p className="font-medium">Investidor Avançado</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
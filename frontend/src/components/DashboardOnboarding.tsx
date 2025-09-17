import { Onboarding, OnboardingStep, useOnboarding } from './Onboarding'
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  Bell,
  PieChart,
  Plus,
  BarChart3,
  CreditCard,
  Lightbulb
} from 'lucide-react'
import { Button } from './ui/button'

const dashboardSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao seu Dashboard!',
    description: 'Vamos fazer um tour rápido pelas principais funcionalidades para você aproveitar ao máximo sua experiência financeira.',
    position: 'center',
    icon: <Lightbulb className="h-5 w-5 text-primary" />,
    skipable: false,
    content: (
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
        <p className="text-sm font-medium">✨ Este tour levará apenas 2 minutos e te ajudará a:</p>
        <ul className="text-sm mt-2 space-y-1 text-muted-foreground">
          <li>• Entender seus indicadores financeiros</li>
          <li>• Navegar pelos gráficos e relatórios</li>
          <li>• Gerenciar suas metas e alertas</li>
          <li>• Personalizar sua experiência</li>
        </ul>
      </div>
    )
  },
  {
    id: 'stats-cards',
    title: 'Seus Indicadores Principais',
    description: 'Aqui você encontra um resumo rápido das suas finanças: saldo total, gastos do mês, economia e investimentos. Estes cartões se atualizam em tempo real!',
    target: '[data-onboarding="stats-cards"]',
    position: 'bottom',
    icon: <DollarSign className="h-5 w-5 text-success" />,
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="font-medium">Verde:</span>
          <span className="text-muted-foreground">Valores positivos/crescimento</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-destructive rotate-180" />
          <span className="font-medium">Vermelho:</span>
          <span className="text-muted-foreground">Valores negativos/redução</span>
        </div>
      </div>
    )
  },
  {
    id: 'charts',
    title: 'Análise Visual dos Dados',
    description: 'Os gráficos te ajudam a visualizar tendências e padrões nos seus gastos. Clique nos diferentes tipos de gráfico para mudar a visualização!',
    target: '[data-onboarding="charts"]',
    position: 'top',
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
    content: (
      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">💡 Dica:</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
          Experimente trocar entre gráfico de barras, linha e pizza para diferentes perspectivas dos seus dados.
        </p>
      </div>
    )
  },
  {
    id: 'transactions',
    title: 'Suas Transações Recentes',
    description: 'Acompanhe suas últimas movimentações financeiras. Cada transação mostra a categoria, conta utilizada e valor.',
    target: '[data-onboarding="transactions"]',
    position: 'right',
    icon: <Calendar className="h-5 w-5 text-purple-500" />,
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4" />
          <span>Clique em "Ver Todas" para gerenciar transações</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" />
          <span>Use o botão "+" para adicionar novas transações</span>
        </div>
      </div>
    )
  },
  {
    id: 'goals',
    title: 'Suas Metas Financeiras',
    description: 'Defina e acompanhe o progresso das suas metas financeiras. A barra de progresso mostra o quanto você já conquistou!',
    target: '[data-onboarding="goals"]',
    position: 'left',
    icon: <Target className="h-5 w-5 text-green-500" />,
    content: (
      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
        <p className="text-sm font-medium text-green-700 dark:text-green-300">🎯 Meta Recomendada:</p>
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
          Comece criando uma reserva de emergência equivalente a 6 meses dos seus gastos.
        </p>
      </div>
    )
  },
  {
    id: 'alerts',
    title: 'Alertas Inteligentes',
    description: 'Receba notificações automáticas sobre padrões nos seus gastos, vencimentos e oportunidades de economia.',
    target: '[data-onboarding="alerts"]',
    position: 'left',
    icon: <Bell className="h-5 w-5 text-orange-500" />,
    content: (
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span>Alta prioridade - requer ação imediata</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span>Média prioridade - atenção recomendada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <span>Baixa prioridade - informativa</span>
        </div>
      </div>
    )
  },
  {
    id: 'summary',
    title: 'Resumo Mensal',
    description: 'Visualize um resumo consolidado do mês, incluindo receitas, despesas e as principais categorias de gastos.',
    target: '[data-onboarding="summary"]',
    position: 'left',
    icon: <PieChart className="h-5 w-5 text-indigo-500" />,
  },
  {
    id: 'completion',
    title: 'Parabéns! 🎉',
    description: 'Você completou o tour do dashboard! Agora você está pronto para gerenciar suas finanças de forma inteligente.',
    position: 'center',
    icon: <Target className="h-5 w-5 text-success" />,
    content: (
      <div className="text-center space-y-3">
        <div className="bg-success/10 p-4 rounded-lg">
          <p className="text-sm font-medium text-success">✅ Próximos passos recomendados:</p>
          <ul className="text-sm mt-2 space-y-1 text-muted-foreground">
            <li>1. Adicione suas primeiras transações</li>
            <li>2. Configure uma meta de economia</li>
            <li>3. Explore as outras páginas do menu</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Você pode refazer este tour a qualquer momento nas configurações.
        </p>
      </div>
    )
  }
]

interface DashboardOnboardingProps {
  autoStart?: boolean
  onComplete?: () => void
}

export function DashboardOnboarding({ autoStart = false, onComplete }: DashboardOnboardingProps) {
  const {
    isVisible,
    hasCompletedOnboarding,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
  } = useOnboarding(dashboardSteps)

  // Auto-start onboarding for new users
  if (autoStart && !hasCompletedOnboarding && !isVisible) {
    setTimeout(startOnboarding, 1000) // Aguarda 1 segundo para carregar o dashboard
  }

  const handleComplete = () => {
    completeOnboarding()
    onComplete?.()
  }

  const handleSkip = () => {
    skipOnboarding()
    onComplete?.()
  }

  return (
    <>
      <Onboarding
        steps={dashboardSteps}
        isVisible={isVisible}
        onComplete={handleComplete}
        onSkip={handleSkip}
        showProgress={true}
        allowSkipSteps={true}
      />

      {/* Botão para iniciar onboarding manualmente */}
      {hasCompletedOnboarding && (
        <Button
          variant="outline"
          size="sm"
          onClick={startOnboarding}
          className="fixed bottom-4 right-4 z-50 shadow-lg"
        >
          <Lightbulb className="h-4 w-4 mr-1" />
          Tour do Dashboard
        </Button>
      )}
    </>
  )
}

export { dashboardSteps }
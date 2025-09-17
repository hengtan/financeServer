import { useState, useEffect } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { DashboardSelector } from '@/components/dashboard/DashboardSelector'
import { CustomizableDashboard } from '@/components/dashboard/CustomizableDashboard'
import { DashboardTemplate, dashboardTemplates } from '@/components/dashboard/DashboardTypes'
import { LoadingWrapper } from '@/components/LoadingWrapper'
import { useNavigate } from 'react-router-dom'

// Componentes especializados para cada tipo de dashboard
function PersonalDashboard({ template }: { template: DashboardTemplate }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Saldo Total</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">R$ 15.430,50</p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">+12,5% este mês</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-6 rounded-xl">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Economia</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">R$ 2.340,00</p>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">Meta: 85% atingida</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-6 rounded-xl">
          <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Gastos do Mês</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">R$ 3.200,00</p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">-8,2% vs anterior</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 rounded-xl">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Investimentos</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">R$ 8.500,00</p>
          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">+22,1% este mês</p>
        </div>
      </div>

      <div className="text-center py-8 text-muted-foreground">
        <p>Dashboard "{template.name}" - Visualização simplificada</p>
        <p className="text-sm mt-1">Em uma implementação completa, aqui estariam os widgets específicos</p>
      </div>
    </div>
  )
}

function BusinessDashboard({ template }: { template: DashboardTemplate }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 p-6 rounded-xl">
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Receita Mensal</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">R$ 125.000</p>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">+15,3% crescimento</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 p-6 rounded-xl">
          <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-2">Margem de Lucro</h3>
          <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">32,5%</p>
          <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">Acima da meta</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-6 rounded-xl">
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Fluxo de Caixa</h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">R$ 45.000</p>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Posição positiva</p>
        </div>
      </div>

      <div className="text-center py-8 text-muted-foreground">
        <p>Dashboard "{template.name}" - KPIs empresariais</p>
        <p className="text-sm mt-1">Métricas específicas para gestão empresarial</p>
      </div>
    </div>
  )
}

function InvestmentDashboard({ template }: { template: DashboardTemplate }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-6 rounded-xl">
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Portfólio Total</h3>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">R$ 95.750</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">+8,7% no ano</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 p-6 rounded-xl">
          <h3 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-2">Ações</h3>
          <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">R$ 45.200</p>
          <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">47% do portfólio</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-6 rounded-xl">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Renda Fixa</h3>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">R$ 35.550</p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">37% do portfólio</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 p-6 rounded-xl">
          <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">Cripto</h3>
          <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">R$ 15.000</p>
          <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">16% do portfólio</p>
        </div>
      </div>

      <div className="text-center py-8 text-muted-foreground">
        <p>Dashboard "{template.name}" - Análise de investimentos</p>
        <p className="text-sm mt-1">Acompanhamento de portfólio e performance</p>
      </div>
    </div>
  )
}

function AnalyticsDashboard({ template }: { template: DashboardTemplate }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 p-6 rounded-xl">
          <h3 className="font-semibold text-violet-900 dark:text-violet-100 mb-2">Score Financeiro</h3>
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">8.5/10</p>
          <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">Saúde financeira excelente</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 p-6 rounded-xl">
          <h3 className="font-semibold text-pink-900 dark:text-pink-100 mb-2">Previsão 12 meses</h3>
          <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">R$ 28.500</p>
          <p className="text-sm text-pink-700 dark:text-pink-300 mt-1">Economia projetada</p>
        </div>
      </div>

      <div className="text-center py-8 text-muted-foreground">
        <p>Dashboard "{template.name}" - Análises avançadas</p>
        <p className="text-sm mt-1">Insights inteligentes e previsões financeiras</p>
      </div>
    </div>
  )
}

export const MultiDashboardPage = () => {
  usePageTitle('Dashboards Especializados')
  const navigate = useNavigate()

  const [currentDashboard, setCurrentDashboard] = useState<string>('personal-overview')
  const [isLoading, setIsLoading] = useState(false)

  const currentTemplate = dashboardTemplates.find(t => t.id === currentDashboard)

  const handleSelectDashboard = async (dashboardId: string) => {
    setIsLoading(true)

    // Simula carregamento
    await new Promise(resolve => setTimeout(resolve, 800))

    setCurrentDashboard(dashboardId)
    setIsLoading(false)
  }

  const handleCreateCustom = () => {
    navigate('/dashboard/customizado')
  }

  const renderDashboardContent = () => {
    if (!currentTemplate) return null

    switch (currentTemplate.category) {
      case 'personal':
        return <PersonalDashboard template={currentTemplate} />
      case 'business':
        return <BusinessDashboard template={currentTemplate} />
      case 'investment':
        return <InvestmentDashboard template={currentTemplate} />
      case 'analysis':
        return <AnalyticsDashboard template={currentTemplate} />
      default:
        return <PersonalDashboard template={currentTemplate} />
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboards Especializados 📊
          </h1>
          <p className="text-muted-foreground mt-2">
            Escolha entre dashboards otimizados para diferentes necessidades: pessoal, empresarial, investimentos ou análises.
          </p>
        </div>

        <DashboardSelector
          currentDashboard={currentDashboard}
          onSelectDashboard={handleSelectDashboard}
          onCreateCustom={handleCreateCustom}
        />

        <LoadingWrapper
          isLoading={isLoading}
          skeleton="dashboard"
          className="mt-8"
        >
          {renderDashboardContent()}
        </LoadingWrapper>
      </div>
    </div>
  )
}
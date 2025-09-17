import { usePageTitle } from '@/hooks/usePageTitle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, CheckCircle, BarChart3, TrendingUp, PieChart, CreditCard } from 'lucide-react'

export const DemoPage = () => {
  usePageTitle('Demonstração')

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Dashboard Completo",
      description: "Visão geral de todas suas finanças em tempo real"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Análise Inteligente",
      description: "IA que identifica padrões e oferece insights"
    },
    {
      icon: <PieChart className="h-8 w-8" />,
      title: "Relatórios Detalhados",
      description: "Gráficos e relatórios personalizáveis"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Gestão de Cartões",
      description: "Controle todos seus cartões em um lugar"
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Conecte suas Contas",
      description: "Sincronize com bancos e cartões de forma segura"
    },
    {
      number: "02",
      title: "Analise seus Dados",
      description: "Nossa IA processa e categoriza suas transações"
    },
    {
      number: "03",
      title: "Receba Insights",
      description: "Obtenha recomendações personalizadas"
    },
    {
      number: "04",
      title: "Alcance suas Metas",
      description: "Planeje e monitore seus objetivos financeiros"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Veja o FinanceServer
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              em Ação
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Descubra como nossa plataforma pode transformar seu controle financeiro
            com esta demonstração interativa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              Assistir Demonstração
            </Button>
            <Button variant="outline" size="lg" className="border-gray-300 hover:border-blue-500 hover:text-blue-600 px-8 py-4">
              Agendar Reunião
            </Button>
          </div>
        </div>

        <div className="relative mb-20">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center">
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
                <Play className="h-24 w-24 mx-auto mb-4 text-white/80" />
                <h2 className="text-2xl font-bold mb-4">Demonstração em Vídeo</h2>
                <p className="text-blue-100 mb-6">
                  Assista a uma visão completa da plataforma em apenas 5 minutos
                </p>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Reproduzir Vídeo (5:23)
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Principais Funcionalidades
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Explore as ferramentas que fazem do FinanceServer a escolha ideal
              para seu controle financeiro pessoal.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Saldo Total</h3>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">R$ 15.430,50</div>
                <div className="text-sm text-green-600">+12,5% este mês</div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-gray-900">R$ 3.200</div>
                  <div className="text-sm text-gray-600">Gastos</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-gray-900">R$ 1.800</div>
                  <div className="text-sm text-gray-600">Economia</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-semibold text-gray-900">Meta de Economia</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="text-sm text-gray-600">75% da meta atingida</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Como Funciona
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold mx-auto">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 -z-10"></div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Experimente todas essas funcionalidades gratuitamente por 14 dias.
            Sem cartão de crédito, sem compromisso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
              Começar Teste Grátis
            </Button>
            <Button variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50 px-8">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  Shield,
  BarChart3,
  Smartphone,
  Clock,
  CreditCard,
  PieChart,
  Bell,
  Lock,
  Zap,
  Users,
  Globe
} from 'lucide-react'

export const FeaturesPage = () => {
  usePageTitle('Funcionalidades')

  const mainFeatures = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Análise Inteligente com IA",
      description: "Nossa inteligência artificial analisa seus padrões de gasto e oferece insights personalizados para otimizar suas finanças.",
      benefits: ["Detecção automática de padrões", "Previsões de gastos", "Alertas inteligentes", "Categorização automática"]
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Relatórios Avançados",
      description: "Dashboards interativos e relatórios customizáveis para acompanhar sua evolução financeira em tempo real.",
      benefits: ["Gráficos interativos", "Exportação em PDF/Excel", "Comparativos mensais", "Métricas personalizadas"]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Segurança Bancária",
      description: "Proteção máxima com criptografia de nível bancário e autenticação multi-fator.",
      benefits: ["Criptografia 256-bit SSL", "Autenticação 2FA", "Backup automático", "Conformidade LGPD"]
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Apps Nativos",
      description: "Acesse suas finanças de qualquer lugar com nossos aplicativos nativos para iOS e Android.",
      benefits: ["Sincronização em tempo real", "Modo offline", "Notificações push", "Biometria"]
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Sincronização Automática",
      description: "Conecte com bancos e cartões para importação automática de transações.",
      benefits: ["+500 instituições conectadas", "Atualização em tempo real", "Categorização automática", "API Open Banking"]
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Alertas Inteligentes",
      description: "Receba notificações personalizadas sobre gastos, vencimentos e oportunidades.",
      benefits: ["Alertas de limite", "Lembretes de vencimento", "Oportunidades de economia", "Metas alcançadas"]
    }
  ]

  const additionalFeatures = [
    { icon: <CreditCard className="h-6 w-6" />, title: "Gestão de Cartões", description: "Controle todos seus cartões em um lugar" },
    { icon: <PieChart className="h-6 w-6" />, title: "Planejamento de Metas", description: "Defina e acompanhe objetivos financeiros" },
    { icon: <Lock className="h-6 w-6" />, title: "Backup Seguro", description: "Seus dados sempre protegidos na nuvem" },
    { icon: <Zap className="h-6 w-6" />, title: "Performance", description: "Interface rápida e responsiva" },
    { icon: <Users className="h-6 w-6" />, title: "Compartilhamento", description: "Gerencie finanças familiares" },
    { icon: <Globe className="h-6 w-6" />, title: "Multi-moedas", description: "Suporte a moedas internacionais" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Funcionalidades
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Completas
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubra todas as ferramentas poderosas que fazem do FinanceServer
            a plataforma mais completa para gestão financeira pessoal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Recursos Adicionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-4 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para Experimentar?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Teste todas essas funcionalidades gratuitamente por 14 dias.
            Sem cartão de crédito, sem compromisso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
              Começar Teste Grátis
            </Button>
            <Button variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50 px-8">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
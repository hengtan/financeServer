import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  Shield,
  BarChart3,
  Smartphone,
  Clock,
  CreditCard,
  PieChart,
  Bell,
  Lock
} from "lucide-react"

const features = [
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Análise Inteligente",
    description: "IA avançada analisa seus gastos e oferece insights personalizados para otimizar suas finanças.",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Segurança Máxima",
    description: "Criptografia bancária e autenticação multi-fator protegem seus dados financeiros 24/7.",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Relatórios Detalhados",
    description: "Dashboards interativos e relatórios customizáveis para acompanhar sua evolução financeira.",
    gradient: "from-orange-500 to-red-600"
  },
  {
    icon: <Smartphone className="h-8 w-8" />,
    title: "App Mobile",
    description: "Acesse suas finanças de qualquer lugar com nosso app nativo para iOS e Android.",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Sincronização Automática",
    description: "Conecte com bancos e cartões para importação automática de transações em tempo real.",
    gradient: "from-teal-500 to-cyan-600"
  },
  {
    icon: <CreditCard className="h-8 w-8" />,
    title: "Gestão de Cartões",
    description: "Monitore limites, faturas e cashback de todos seus cartões em um só lugar.",
    gradient: "from-indigo-500 to-blue-600"
  },
  {
    icon: <PieChart className="h-8 w-8" />,
    title: "Planejamento de Metas",
    description: "Defina objetivos financeiros e receba orientações para alcançá-los mais rapidamente.",
    gradient: "from-yellow-500 to-orange-600"
  },
  {
    icon: <Bell className="h-8 w-8" />,
    title: "Alertas Inteligentes",
    description: "Notificações personalizadas sobre gastos, vencimentos e oportunidades de economia.",
    gradient: "from-pink-500 to-rose-600"
  },
  {
    icon: <Lock className="h-8 w-8" />,
    title: "Backup Seguro",
    description: "Seus dados são automaticamente salvos em nuvem com backup criptografado diário.",
    gradient: "from-slate-500 to-gray-600"
  }
]

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Funcionalidades que
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Transformam Vidas
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubra todas as ferramentas que vão revolucionar a forma como você gerencia suas finanças pessoais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:-translate-y-2"
            >
              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center justify-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl border border-blue-100">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Pronto para começar?
              </h3>
              <p className="text-gray-600 mb-4">
                Junte-se a milhares de usuários que já transformaram suas finanças
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Teste grátis por 14 dias
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Sem cartão de crédito
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Zap, Crown } from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    period: "para sempre",
    description: "Perfeito para começar sua jornada financeira",
    icon: <Star className="h-6 w-6" />,
    gradient: "from-gray-500 to-gray-600",
    borderColor: "border-gray-200",
    features: [
      "Até 50 transações por mês",
      "2 contas bancárias",
      "Relatórios básicos",
      "Suporte por email",
      "Backup semanal"
    ],
    buttonText: "Começar Grátis",
    buttonVariant: "outline" as const
  },
  {
    id: "pro",
    name: "Profissional",
    price: 29.90,
    period: "por mês",
    description: "Para quem leva suas finanças a sério",
    icon: <Zap className="h-6 w-6" />,
    gradient: "from-blue-500 to-purple-600",
    borderColor: "border-blue-200",
    popular: true,
    features: [
      "Transações ilimitadas",
      "Contas bancárias ilimitadas",
      "Relatórios avançados com IA",
      "Sincronização automática",
      "Suporte prioritário 24/7",
      "Metas e planejamentos",
      "Alertas inteligentes",
      "Backup diário",
      "App mobile completo"
    ],
    buttonText: "Teste Grátis por 14 dias",
    buttonVariant: "default" as const
  },
  {
    id: "enterprise",
    name: "Empresarial",
    price: 99.90,
    period: "por mês",
    description: "Solução completa para empresas e investidores",
    icon: <Crown className="h-6 w-6" />,
    gradient: "from-purple-500 to-pink-600",
    borderColor: "border-purple-200",
    features: [
      "Tudo do plano Profissional",
      "Múltiplos usuários (até 10)",
      "Gestão empresarial",
      "API de integração",
      "Relatórios personalizados",
      "Consultor financeiro dedicado",
      "Backup em tempo real",
      "Segurança empresarial",
      "White-label disponível"
    ],
    buttonText: "Falar com Vendas",
    buttonVariant: "outline" as const
  }
]

export const PricingSection = () => {
  return (
    <section id="plans" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Planos que se adaptam
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ao seu momento
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Escolha o plano ideal para suas necessidades. Todos incluem teste gratuito e podem ser cancelados a qualquer momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`relative group hover:shadow-2xl transition-all duration-300 ${
                plan.popular
                  ? 'border-2 border-blue-200 shadow-xl scale-105'
                  : `border ${plan.borderColor}`
              } bg-white hover:-translate-y-1`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Mais Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  {plan.icon}
                </div>

                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </CardTitle>

                <CardDescription className="text-gray-600 mb-6">
                  {plan.description}
                </CardDescription>

                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      R${plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {plan.period}
                    </span>
                  </div>
                  {plan.price > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Primeiro mês com 50% de desconto
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-6">
                  <Button
                    className={`w-full py-3 text-lg font-semibold ${
                      plan.buttonVariant === 'default'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        : 'border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600'
                    }`}
                    variant={plan.buttonVariant}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Dúvidas sobre qual plano escolher?
            </h3>
            <p className="text-gray-600 mb-6">
              Nossa equipe está pronta para ajudar você a encontrar a solução perfeita para suas necessidades
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-white/90 backdrop-blur-sm dark:bg-white/95 dark:border-blue-400 dark:text-blue-700 dark:hover:bg-blue-50">
                Agendar Demonstração
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Falar com Consultor
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Todos os planos incluem:</p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <span>✓ Teste gratuito</span>
            <span>✓ Sem taxa de setup</span>
            <span>✓ Cancele quando quiser</span>
            <span>✓ Suporte em português</span>
          </div>
        </div>
      </div>
    </section>
  )
}
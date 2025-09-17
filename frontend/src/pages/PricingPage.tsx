import { usePageTitle } from '@/hooks/usePageTitle'
import { PricingSection } from '@/components/PricingSection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, HelpCircle, Shield, Clock } from 'lucide-react'

export const PricingPage = () => {
  usePageTitle('Preços')

  const faqs = [
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem taxas ou multas. O acesso continuará até o final do período pago."
    },
    {
      question: "Existe contrato de fidelidade?",
      answer: "Não, não temos contratos de fidelidade. Você paga mensalmente e pode cancelar quando quiser."
    },
    {
      question: "Como funciona o teste gratuito?",
      answer: "O teste gratuito de 14 dias inclui acesso completo ao plano Profissional. Não cobramos cartão de crédito durante o período de teste."
    },
    {
      question: "Posso mudar de plano posteriormente?",
      answer: "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas imediatamente."
    },
    {
      question: "Os dados são seguros?",
      answer: "Utilizamos criptografia bancária e seguimos todas as normas da LGPD para garantir a máxima segurança dos seus dados."
    },
    {
      question: "Há desconto para pagamento anual?",
      answer: "Sim, oferecemos 2 meses grátis para quem opta pelo pagamento anual em qualquer plano pago."
    }
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empreendedora",
      content: "O FinanceServer transformou completamente minha relação com o dinheiro. Consegui economizar 30% mais depois de começar a usar.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Carlos Santos",
      role: "Freelancer",
      content: "A análise inteligente me ajudou a identificar gastos desnecessários que eu nem percebia. Excelente investimento!",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Ana Rodrigues",
      role: "Gerente de Vendas",
      content: "Interface intuitiva e relatórios detalhados. Finalmente consigo acompanhar minhas metas financeiras facilmente.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ]

  const guarantees = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Segurança Garantida",
      description: "Criptografia bancária e conformidade total com LGPD"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Suporte 24/7",
      description: "Equipe especializada sempre disponível para ajudar"
    },
    {
      icon: <Check className="h-6 w-6" />,
      title: "Satisfação Garantida",
      description: "30 dias de garantia ou seu dinheiro de volta"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Preços
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Transparentes
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Escolha o plano que melhor se adapta às suas necessidades.
            Todos os planos incluem teste gratuito e podem ser cancelados a qualquer momento.
          </p>
        </div>

        <PricingSection />

        <div className="my-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Por que Nossos Clientes Escolhem o FinanceServer?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Nossas Garantias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guarantees.map((guarantee, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white mb-4 mx-auto">
                    {guarantee.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{guarantee.title}</h3>
                  <p className="text-gray-600 text-sm">{guarantee.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Perguntas Frequentes
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start text-lg">
                    <HelpCircle className="h-5 w-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed pl-8">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Nossa equipe está pronta para esclarecer qualquer questão sobre nossos planos e funcionalidades.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
              Falar com Consultor
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
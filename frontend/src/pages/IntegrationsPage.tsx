import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, CreditCard, Smartphone, TrendingUp, Globe, Zap, Shield, CheckCircle } from 'lucide-react'

export const IntegrationsPage = () => {
  usePageTitle('Integrações')

  const bankIntegrations = [
    { name: "Banco do Brasil", logo: "🏦", status: "Ativo", accounts: "2.1M+" },
    { name: "Bradesco", logo: "🏛️", status: "Ativo", accounts: "1.8M+" },
    { name: "Itaú", logo: "🏢", status: "Ativo", accounts: "2.3M+" },
    { name: "Santander", logo: "🏪", status: "Ativo", accounts: "1.5M+" },
    { name: "Caixa", logo: "🏬", status: "Ativo", accounts: "1.9M+" },
    { name: "Nubank", logo: "💜", status: "Ativo", accounts: "950K+" },
    { name: "Inter", logo: "🧡", status: "Ativo", accounts: "600K+" },
    { name: "C6 Bank", logo: "⚫", status: "Ativo", accounts: "400K+" }
  ]

  const creditCardIntegrations = [
    { name: "Visa", logo: "💳", type: "Cartão de Crédito" },
    { name: "Mastercard", logo: "🔴", type: "Cartão de Crédito" },
    { name: "American Express", logo: "💙", type: "Cartão de Crédito" },
    { name: "Elo", logo: "🟡", type: "Cartão de Crédito" },
    { name: "Hipercard", logo: "🔶", type: "Cartão de Crédito" },
    { name: "Diners Club", logo: "◼️", type: "Cartão de Crédito" }
  ]

  const digitalWallets = [
    { name: "PIX", logo: "🔄", description: "Transferências instantâneas" },
    { name: "PayPal", logo: "🌐", description: "Pagamentos internacionais" },
    { name: "PicPay", logo: "💚", description: "Carteira digital" },
    { name: "Mercado Pago", logo: "💛", description: "Ecosystem Mercado Livre" },
    { name: "Google Pay", logo: "🔵", description: "Pagamentos móveis" },
    { name: "Apple Pay", logo: "🍎", description: "Pagamentos iOS" }
  ]

  const investmentPlatforms = [
    { name: "XP Investimentos", logo: "📈", type: "Corretora" },
    { name: "Clear", logo: "🔷", type: "Corretora" },
    { name: "Rico", logo: "💎", type: "Corretora" },
    { name: "Inter Invest", logo: "📊", type: "Corretora" },
    { name: "BTG Pactual", logo: "⭐", type: "Banco de Investimento" },
    { name: "Toro Investimentos", logo: "🐂", type: "Corretora" }
  ]

  const integrationFeatures = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Segurança Bancária",
      description: "Todas as integrações seguem protocolos de segurança bancária com criptografia de ponta.",
      benefits: ["Criptografia 256-bit", "Tokens temporários", "Sem armazenamento de senhas", "Auditoria contínua"]
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Sincronização Automática",
      description: "Seus dados são atualizados automaticamente em tempo real sem intervenção manual.",
      benefits: ["Atualização em tempo real", "Categorização automática", "Detecção de duplicatas", "Conciliação inteligente"]
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Open Banking",
      description: "Aproveitamos o Open Banking para oferecer integrações seguras e regulamentadas.",
      benefits: ["Conformidade regulatória", "APIs padronizadas", "Revogação simples", "Transparência total"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Integrações
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Completas
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Conecte todas suas contas financeiras em um só lugar. Mais de 500 instituições
            financeiras integradas com sincronização automática e segura.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {integrationFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-4 mx-auto">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-gray-700 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-16">
          <div>
            <div className="flex items-center mb-8">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Bancos Tradicionais
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bankIntegrations.map((bank, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{bank.logo}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{bank.name}</h3>
                      <p className="text-sm text-gray-600">{bank.accounts} contas</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        {bank.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-8">
              <CreditCard className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Cartões de Crédito
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creditCardIntegrations.map((card, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{card.logo}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{card.name}</h3>
                      <p className="text-sm text-gray-600">{card.type}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-8">
              <Smartphone className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Carteiras Digitais
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {digitalWallets.map((wallet, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.logo}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{wallet.name}</h3>
                      <p className="text-sm text-gray-600">{wallet.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-8">
              <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Plataformas de Investimento
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investmentPlatforms.map((platform, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{platform.logo}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <p className="text-sm text-gray-600">{platform.type}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sua Instituição Não Está na Lista?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Estamos constantemente adicionando novas integrações. Entre em contato
              e solicitaremos a integração com sua instituição financeira.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
                Solicitar Integração
              </Button>
              <Button variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50 px-8">
                Ver Todas as Integrações
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Instituições Conectadas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">99.8%</div>
                <div className="text-gray-600">Taxa de Sucesso</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">24h</div>
                <div className="text-gray-600">Tempo Médio de Integração</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
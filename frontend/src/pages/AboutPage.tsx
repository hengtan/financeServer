import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, Award, Lightbulb } from 'lucide-react'

export const AboutPage = () => {
  usePageTitle('Sobre Nós')

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Missão",
      description: "Democratizar o acesso ao controle financeiro inteligente, oferecendo ferramentas simples e poderosas para todas as pessoas."
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Visão",
      description: "Ser a principal plataforma de gestão financeira pessoal do Brasil, transformando a relação das pessoas com o dinheiro."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Valores",
      description: "Transparência, inovação, segurança e compromisso com o sucesso financeiro dos nossos usuários."
    }
  ]

  const team = [
    {
      name: "Carlos Mendes",
      role: "CEO & Co-founder",
      description: "15 anos de experiência em fintech e tecnologia financeira.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Ana Silva",
      role: "CTO & Co-founder",
      description: "Especialista em desenvolvimento de sistemas e arquitetura de software.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Rafael Santos",
      role: "Head of Product",
      description: "Focado em criar experiências incríveis para nossos usuários.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Sobre o
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceServer
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nascemos da necessidade de democratizar o controle financeiro no Brasil.
            Nossa missão é transformar a forma como as pessoas se relacionam com o dinheiro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa História</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Fundado em 2024, o FinanceServer surgiu da percepção de que milhões de brasileiros
                enfrentam dificuldades para organizar suas finanças pessoais.
              </p>
              <p>
                Com uma equipe experiente em tecnologia e mercado financeiro, desenvolvemos uma
                plataforma que combina simplicidade, segurança e inteligência artificial para
                oferecer insights valiosos sobre gestão financeira.
              </p>
              <p>
                Hoje, já ajudamos mais de 10.000 usuários a ter controle total sobre suas finanças,
                com ferramentas que vão desde o controle básico de gastos até análises avançadas
                de investimentos.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10k+</div>
                <div className="text-blue-100">Usuários Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">R$ 50M+</div>
                <div className="text-blue-100">Transações Processadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">99.8%</div>
                <div className="text-blue-100">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Suporte</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nossos Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-4 mx-auto">
                    {value.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nossa Equipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl font-bold">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-semibold">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
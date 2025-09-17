import { usePageTitle } from '@/hooks/usePageTitle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin, Clock, MessageSquare, FileText } from 'lucide-react'

export const ContactPage = () => {
  usePageTitle('Contato')

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      description: "contato@financeserver.com",
      subtitle: "Respondemos em até 24h"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Telefone",
      description: "+55 (11) 9999-9999",
      subtitle: "Seg à Sex, 9h às 18h"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Endereço",
      description: "São Paulo, SP",
      subtitle: "Atendimento presencial com agendamento"
    }
  ]

  const supportOptions = [
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Chat ao Vivo",
      description: "Converse com nossa equipe em tempo real",
      action: "Iniciar Chat",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Central de Ajuda",
      description: "Encontre respostas para as perguntas mais comuns",
      action: "Ver Artigos",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Agendar Reunião",
      description: "Marque uma demonstração personalizada",
      action: "Agendar",
      gradient: "from-orange-500 to-red-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Entre em
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Contato
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Estamos aqui para ajudar! Escolha a forma de contato que preferir
            e nossa equipe retornará o mais rápido possível.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Fale Conosco</h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assunto
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Selecione um assunto</option>
                  <option>Suporte Técnico</option>
                  <option>Dúvidas sobre Planos</option>
                  <option>Demonstração</option>
                  <option>Parceria</option>
                  <option>Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Como podemos ajudar você?"
                ></textarea>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3">
                Enviar Mensagem
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Informações de Contato</h2>

            <div className="space-y-6 mb-10">
              {contactMethods.map((method, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.title}</h3>
                    <p className="text-gray-600">{method.description}</p>
                    <p className="text-sm text-gray-500">{method.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Horário de Atendimento</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Segunda a Sexta:</span>
                  <span className="font-medium">9h às 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado:</span>
                  <span className="font-medium">9h às 14h</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo:</span>
                  <span className="font-medium">Fechado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Outras Formas de Suporte</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${option.gradient} text-white mb-4 mx-auto`}>
                    {option.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {option.description}
                  </CardDescription>
                  <Button variant="outline" className="w-full border-gray-300 hover:border-blue-500 hover:text-blue-600">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
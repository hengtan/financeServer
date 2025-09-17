import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, ArrowRight, Tag } from 'lucide-react'

export const BlogPage = () => {
  usePageTitle('Blog')

  const featuredPost = {
    id: 1,
    title: "Como a Inteligência Artificial Está Revolucionando o Controle Financeiro Pessoal",
    excerpt: "Descubra como algoritmos avançados de IA podem identificar padrões de gastos, prever tendências e oferecer insights personalizados para otimizar suas finanças.",
    content: "A revolução da inteligência artificial chegou ao mundo das finanças pessoais...",
    author: "Carlos Mendes",
    date: "2024-01-15",
    category: "Tecnologia",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop"
  }

  const blogPosts = [
    {
      id: 2,
      title: "10 Dicas Essenciais para Organizar suas Finanças em 2024",
      excerpt: "Um guia prático com estratégias comprovadas para tomar controle total do seu dinheiro e alcançar seus objetivos financeiros.",
      author: "Ana Silva",
      date: "2024-01-12",
      category: "Planejamento",
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Open Banking: O que Muda na sua Vida Financeira",
      excerpt: "Entenda como o Open Banking está transformando o setor financeiro e como você pode se beneficiar dessa revolução.",
      author: "Rafael Santos",
      date: "2024-01-10",
      category: "Regulamentação",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "Investimentos para Iniciantes: Por Onde Começar",
      excerpt: "Guia completo para quem quer começar a investir mas não sabe por onde começar. Aprenda os conceitos básicos e dê os primeiros passos.",
      author: "Mariana Costa",
      date: "2024-01-08",
      category: "Investimentos",
      readTime: "7 min",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"
    },
    {
      id: 5,
      title: "Como Criar um Orçamento que Realmente Funciona",
      excerpt: "Metodologias práticas e ferramentas digitais para criar e manter um orçamento eficiente que se adapta ao seu estilo de vida.",
      author: "Pedro Oliveira",
      date: "2024-01-05",
      category: "Orçamento",
      readTime: "4 min",
      image: "https://images.unsplash.com/photo-1554224154-26032fced8bd?w=400&h=250&fit=crop"
    },
    {
      id: 6,
      title: "Segurança Digital: Protegendo suas Informações Financeiras",
      excerpt: "Dicas essenciais de segurança digital para proteger suas informações financeiras contra fraudes e ameaças cibernéticas.",
      author: "Julia Mendes",
      date: "2024-01-03",
      category: "Segurança",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=250&fit=crop"
    },
    {
      id: 7,
      title: "Metas Financeiras SMART: Como Definir e Alcançar",
      excerpt: "Aprenda a metodologia SMART para definir metas financeiras realistas e desenvolver um plano de ação para alcançá-las.",
      author: "Fernando Silva",
      date: "2024-01-01",
      category: "Planejamento",
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400&h=250&fit=crop"
    }
  ]

  const categories = [
    { name: "Todos", count: 7 },
    { name: "Planejamento", count: 3 },
    { name: "Tecnologia", count: 2 },
    { name: "Investimentos", count: 1 },
    { name: "Segurança", count: 1 }
  ]

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Tecnologia": "bg-blue-100 text-blue-700",
      "Planejamento": "bg-green-100 text-green-700",
      "Regulamentação": "bg-purple-100 text-purple-700",
      "Investimentos": "bg-orange-100 text-orange-700",
      "Orçamento": "bg-yellow-100 text-yellow-700",
      "Segurança": "bg-red-100 text-red-700"
    }
    return colors[category] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Blog
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceServer
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Insights, dicas e análises sobre finanças pessoais, tecnologia financeira
            e tendências do mercado para ajudar você a tomar melhores decisões.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="mb-12 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(featuredPost.category)}`}>
                    Destaque
                  </span>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl hover:text-blue-600 transition-colors cursor-pointer">
                  {featuredPost.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed text-lg">
                  {featuredPost.excerpt}
                </CardDescription>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(featuredPost.date).toLocaleDateString('pt-BR')}
                  </div>
                  <span>{featuredPost.readTime} de leitura</span>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Ler Artigo Completo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {post.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(post.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <span>{post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                Carregar Mais Artigos
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Categorias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <span className="text-gray-700">{category.name}</span>
                      <span className="text-gray-500 text-sm">({category.count})</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
                <CardDescription>
                  Receba nossos artigos mais recentes diretamente no seu email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Seu email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Inscrever-se
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Artigos Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blogPosts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex space-x-3">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 cursor-pointer">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{post.readTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
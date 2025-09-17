import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DashboardTemplate,
  dashboardTemplates,
  categoryLabels,
  categoryDescriptions
} from './DashboardTypes'
import {
  Plus,
  Star,
  Grid3X3,
  List,
  LayoutGrid,
  User,
  Building2,
  TrendingUp,
  BarChart3,
  Check
} from 'lucide-react'
import { showSuccessToast, showInfoToast } from '@/lib/utils'

interface DashboardSelectorProps {
  currentDashboard?: string
  onSelectDashboard: (dashboardId: string) => void
  onCreateCustom?: () => void
}

const categoryIcons = {
  personal: User,
  business: Building2,
  investment: TrendingUp,
  analysis: BarChart3
}

const layoutIcons = {
  grid: Grid3X3,
  list: List,
  compact: LayoutGrid
}

export function DashboardSelector({
  currentDashboard,
  onSelectDashboard,
  onCreateCustom
}: DashboardSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('personal')
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([])

  useEffect(() => {
    const favorites = localStorage.getItem('favorite-dashboards')
    if (favorites) {
      setFavoriteTemplates(JSON.parse(favorites))
    }
  }, [])

  const toggleFavorite = (templateId: string) => {
    const newFavorites = favoriteTemplates.includes(templateId)
      ? favoriteTemplates.filter(id => id !== templateId)
      : [...favoriteTemplates, templateId]

    setFavoriteTemplates(newFavorites)
    localStorage.setItem('favorite-dashboards', JSON.stringify(newFavorites))

    showInfoToast(
      favoriteTemplates.includes(templateId) ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
      'Suas preferências foram salvas'
    )
  }

  const handleSelectTemplate = (template: DashboardTemplate) => {
    onSelectDashboard(template.id)
    setIsOpen(false)
    showSuccessToast(
      `Dashboard "${template.name}" selecionado`,
      'O dashboard foi carregado com sucesso'
    )
  }

  const getCurrentTemplate = () => {
    return dashboardTemplates.find(t => t.id === currentDashboard)
  }

  const getTemplatesByCategory = (category: string) => {
    return dashboardTemplates.filter(t => t.category === category)
  }

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getCurrentTemplate()?.color || '#3b82f6' }}
          />
          <h2 className="text-xl font-semibold">
            {getCurrentTemplate()?.name || 'Dashboard Personalizado'}
          </h2>
          {getCurrentTemplate()?.isDefault && (
            <Badge variant="secondary">Padrão</Badge>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="ml-auto"
        >
          Trocar Dashboard
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Selecionar Dashboard"
        size="xl"
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Escolha um dashboard otimizado para suas necessidades ou crie um personalizado
            </p>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4">
              {categories.map(category => {
                const Icon = categoryIcons[category]
                return (
                  <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {categoryLabels[category]}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium mb-1">{categoryLabels[category]}</h3>
                  <p className="text-sm text-muted-foreground">
                    {categoryDescriptions[category]}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {getTemplatesByCategory(category).map(template => {
                    const LayoutIcon = layoutIcons[template.layout]
                    const isFavorite = favoriteTemplates.includes(template.id)
                    const isCurrent = currentDashboard === template.id

                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isCurrent ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ backgroundColor: `${template.color}20` }}
                              >
                                {template.icon}
                              </div>
                              <div>
                                <CardTitle className="text-base">{template.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <LayoutIcon className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground capitalize">
                                    Layout {template.layout}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {isCurrent && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(template.id)
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Star className={`h-3 w-3 ${
                                  isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                }`} />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <CardDescription className="text-sm mb-3">
                            {template.description}
                          </CardDescription>

                          <div className="flex flex-wrap gap-1">
                            {template.widgets.slice(0, 3).map(widget => (
                              <Badge key={widget} variant="outline" className="text-xs">
                                {widget}
                              </Badge>
                            ))}
                            {template.widgets.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.widgets.length - 3}
                              </Badge>
                            )}
                          </div>

                          {template.isDefault && (
                            <Badge className="mt-2" variant="secondary">
                              Recomendado
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Seção Favoritos */}
          {favoriteTemplates.length > 0 && (
            <div className="pt-6 border-t">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                Seus Favoritos
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                {favoriteTemplates.map(templateId => {
                  const template = dashboardTemplates.find(t => t.id === templateId)
                  if (!template) return null

                  return (
                    <Button
                      key={template.id}
                      variant="outline"
                      onClick={() => handleSelectTemplate(template)}
                      className="h-auto p-3 justify-start"
                    >
                      <span className="mr-2">{template.icon}</span>
                      <span className="truncate">{template.name}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Ação customizada */}
          <div className="pt-6 border-t">
            <Card className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-6 text-center" onClick={onCreateCustom}>
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-1">Criar Dashboard Personalizado</h3>
                <p className="text-sm text-muted-foreground">
                  Configure um dashboard do zero com os widgets que você escolher
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Modal>
    </>
  )
}
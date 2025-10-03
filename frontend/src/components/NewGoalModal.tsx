import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export interface GoalCategory {
  id: string
  name: string
  icon?: string
  color?: string
  description?: string
}

export interface ColorOption {
  id: string
  name: string
  value: string
  preview?: string
}

export interface GoalFormData {
  title: string
  description: string
  targetAmount: number
  deadline: string
  categoryId: string
  monthlyTarget?: number
  currentAmount?: number
  priority?: 'low' | 'medium' | 'high'
  notes?: string
}

export interface GoalLabels {
  title?: string
  goalTitle?: string
  description?: string
  targetAmount?: string
  deadline?: string
  category?: string
  monthlyTarget?: string
  priority?: string
  notes?: string
  submit?: string
  cancel?: string
  titlePlaceholder?: string
  descriptionPlaceholder?: string
  amountPlaceholder?: string
}

interface NewGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: GoalFormData) => void
  categories?: GoalCategory[]
  colorOptions?: ColorOption[]
  labels?: GoalLabels
  defaultValues?: Partial<GoalFormData>
  currency?: string
  locale?: string
  showPriority?: boolean
  showNotes?: boolean
  showMonthlyTarget?: boolean
  onColorAssign?: (availableColors: ColorOption[]) => ColorOption
  onGenerateId?: () => string
}

export const NewGoalModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  colorOptions = [],
  labels = {},
  defaultValues = {},
  currency = 'BRL',
  locale = 'pt-BR',
  showPriority = false,
  showNotes = false,
  showMonthlyTarget = true,
  onColorAssign,
  onGenerateId
}: NewGoalModalProps) => {

  // Default data fallbacks
  const defaultCategories: GoalCategory[] = [
    { id: 'travel', name: 'Viagem', icon: '✈️', color: '#3b82f6' },
    { id: 'emergency', name: 'Emergência', icon: '🚨', color: '#ef4444' },
    { id: 'vehicle', name: 'Veículo', icon: '🚗', color: '#8b5cf6' },
    { id: 'home', name: 'Casa', icon: '🏠', color: '#10b981' },
    { id: 'education', name: 'Educação', icon: '📚', color: '#f59e0b' },
    { id: 'investment', name: 'Investimento', icon: '📈', color: '#06b6d4' },
    { id: 'other', name: 'Outros', icon: '🎯', color: '#6b7280' }
  ]

  const defaultColorOptions: ColorOption[] = [
    { id: 'blue', name: 'Azul', value: '#3b82f6', preview: 'bg-blue-500' },
    { id: 'green', name: 'Verde', value: '#10b981', preview: 'bg-emerald-500' },
    { id: 'purple', name: 'Roxo', value: '#8b5cf6', preview: 'bg-violet-500' },
    { id: 'red', name: 'Vermelho', value: '#ef4444', preview: 'bg-red-500' },
    { id: 'yellow', name: 'Amarelo', value: '#f59e0b', preview: 'bg-amber-500' },
    { id: 'pink', name: 'Rosa', value: '#ec4899', preview: 'bg-pink-500' },
    { id: 'indigo', name: 'Índigo', value: '#6366f1', preview: 'bg-indigo-500' }
  ]

  const defaultLabels: GoalLabels = {
    title: 'Nova Meta',
    goalTitle: 'Título da Meta',
    description: 'Descrição',
    targetAmount: 'Valor da Meta',
    deadline: 'Data Limite',
    category: 'Categoria',
    monthlyTarget: 'Meta Mensal',
    priority: 'Prioridade',
    notes: 'Observações',
    submit: 'Criar Meta',
    cancel: 'Cancelar',
    titlePlaceholder: 'Ex: Viagem para Europa',
    descriptionPlaceholder: 'Descreva sua meta em detalhes',
    amountPlaceholder: '0,00'
  }

  const finalCategories = categories.length > 0 ? categories : defaultCategories
  const finalColorOptions = colorOptions.length > 0 ? colorOptions : defaultColorOptions
  const finalLabels = { ...defaultLabels, ...labels }

  const [formData, setFormData] = useState({
    title: defaultValues.title || '',
    description: defaultValues.description || '',
    targetAmount: defaultValues.targetAmount || 0,
    deadline: defaultValues.deadline || '',
    categoryId: defaultValues.categoryId || finalCategories[0]?.id || '',
    monthlyTarget: defaultValues.monthlyTarget || 0,
    currentAmount: defaultValues.currentAmount || 0,
    priority: defaultValues.priority || 'medium' as const,
    notes: defaultValues.notes || ''
  })

  const [targetAmountString, setTargetAmountString] = useState(
    defaultValues.targetAmount ? defaultValues.targetAmount.toString() : ''
  )

  const [monthlyTargetString, setMonthlyTargetString] = useState(
    defaultValues.monthlyTarget ? defaultValues.monthlyTarget.toString() : ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalTargetAmount = parseFloat(targetAmountString) || 0
    const finalMonthlyTarget = parseFloat(monthlyTargetString) || 0

    const goal: GoalFormData = {
      title: formData.title,
      description: formData.description,
      targetAmount: finalTargetAmount,
      deadline: formData.deadline,
      categoryId: formData.categoryId,
      ...(showMonthlyTarget && { monthlyTarget: finalMonthlyTarget }),
      currentAmount: formData.currentAmount,
      ...(showPriority && { priority: formData.priority }),
      ...(showNotes && { notes: formData.notes })
    }

    onSubmit(goal)
    onClose()

    // Reset form
    const resetData = {
      title: defaultValues.title || '',
      description: defaultValues.description || '',
      targetAmount: defaultValues.targetAmount || 0,
      deadline: '',
      categoryId: defaultValues.categoryId || finalCategories[0]?.id || '',
      monthlyTarget: defaultValues.monthlyTarget || 0,
      currentAmount: defaultValues.currentAmount || 0,
      priority: defaultValues.priority || 'medium' as const,
      notes: defaultValues.notes || ''
    }

    setFormData(resetData)
    setTargetAmountString('')
    setMonthlyTargetString('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={finalLabels.title!} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {finalLabels.goalTitle}
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
            placeholder={finalLabels.titlePlaceholder}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {finalLabels.description}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
            placeholder={finalLabels.descriptionPlaceholder}
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {finalLabels.targetAmount}
            </label>
            <input
              type="number"
              step="0.01"
              value={targetAmountString}
              onChange={(e) => setTargetAmountString(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
              placeholder={finalLabels.amountPlaceholder}
              required
            />
          </div>

          {showMonthlyTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {finalLabels.monthlyTarget}
              </label>
              <input
                type="number"
                step="0.01"
                value={monthlyTargetString}
                onChange={(e) => setMonthlyTargetString(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                placeholder={finalLabels.amountPlaceholder}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {finalLabels.deadline}
          </label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {finalLabels.category}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {finalCategories.map(category => (
              <label key={category.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={formData.categoryId === category.id}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="sr-only"
                />
                <Card className={`p-3 text-center transition-all ${formData.categoryId === category.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                  <CardContent className="p-0">
                    <div className="text-sm font-medium">
                      {category.icon && <span className="mr-1">{category.icon}</span>}
                      {category.name}
                    </div>
                    {category.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {category.description}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </label>
            ))}
          </div>
        </div>

        {showPriority && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {finalLabels.priority}
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
        )}

        {showNotes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {finalLabels.notes}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
              rows={3}
              placeholder="Observações adicionais..."
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            {finalLabels.cancel}
          </Button>
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            {finalLabels.submit}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

/*
EXEMPLO DE USO AVANÇADO COM MICROSERVIÇOS:

// 1. Uso básico (mantém compatibilidade)
<NewGoalModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleNewGoal}
/>

// 2. Uso com dados do microserviço
const categoriesFromAPI: GoalCategory[] = [
  { id: 'travel', name: 'Viagem', icon: '✈️', color: '#3b82f6', description: 'Metas de viagem e turismo' },
  { id: 'emergency', name: 'Emergência', icon: '🚨', color: '#ef4444', description: 'Fundo de emergência' },
  // ... dados vindos da API
]

const colorOptionsFromAPI: ColorOption[] = [
  { id: 'blue', name: 'Azul', value: '#3b82f6', preview: 'bg-blue-500' },
  { id: 'green', name: 'Verde', value: '#10b981', preview: 'bg-emerald-500' },
  // ... dados vindos da API
]

<NewGoalModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={async (goal) => {
    await api.post('/goals', goal)
    fetchGoals() // Atualiza lista
  }}
  categories={categoriesFromAPI}
  colorOptions={colorOptionsFromAPI}
  labels={{
    title: 'Nova Meta Financeira',
    goalTitle: 'Nome da Meta',
    submit: 'Salvar Meta',
    cancel: 'Fechar'
  }}
  defaultValues={{
    categoryId: 'emergency',
    priority: 'high'
  }}
  currency="BRL"
  locale="pt-BR"
  showPriority={true}
  showNotes={true}
  showMonthlyTarget={true}
  onColorAssign={(colors) => colors[Math.floor(Math.random() * colors.length)]}
  onGenerateId={() => crypto.randomUUID()}
/>

// 3. Uso internacionalizado
<NewGoalModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleNewGoal}
  categories={categoriesFromAPI}
  colorOptions={colorOptionsFromAPI}
  labels={{
    title: 'New Goal',
    goalTitle: 'Goal Title',
    description: 'Description',
    targetAmount: 'Target Amount',
    deadline: 'Deadline',
    category: 'Category',
    monthlyTarget: 'Monthly Target',
    priority: 'Priority',
    notes: 'Notes',
    submit: 'Create Goal',
    cancel: 'Cancel',
    titlePlaceholder: 'Ex: Trip to Europe',
    descriptionPlaceholder: 'Describe your goal in detail',
    amountPlaceholder: '0.00'
  }}
  currency="USD"
  locale="en-US"
  showPriority={false}
  showNotes={false}
  showMonthlyTarget={true}
/>

// 4. Configuração específica para empresarial
<NewGoalModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleNewGoal}
  categories={categoriesEmpresariais}
  labels={labelsPersonalizados}
  defaultValues={{
    categoryId: 'investment',
    priority: 'high',
    monthlyTarget: 5000
  }}
  showPriority={true}
  showNotes={true}
  showMonthlyTarget={true}
/>
*/
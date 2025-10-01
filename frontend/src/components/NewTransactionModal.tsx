import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { userCategoriesService } from '@/services/userCategories'

export interface TransactionCategory {
  id: string
  name: string
  icon?: string
  color?: string
}

export interface TransactionAccount {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  currency?: string
}

export interface TransactionType {
  id: string
  name: string
  icon?: string
  description?: string
}

export interface TransactionFormData {
  description: string
  amount: number
  categoryId: string
  accountId: string
  typeId: string
  date: string
  notes?: string
}

export interface TransactionLabels {
  title?: string
  description?: string
  amount?: string
  date?: string
  category?: string
  account?: string
  type?: string
  notes?: string
  submit?: string
  cancel?: string
  descriptionPlaceholder?: string
  amountPlaceholder?: string
}

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (transaction: TransactionFormData) => void
  categories?: TransactionCategory[]
  accounts?: TransactionAccount[]
  transactionTypes?: TransactionType[]
  labels?: TransactionLabels
  defaultValues?: Partial<TransactionFormData>
  currency?: string
  locale?: string
  showNotes?: boolean
  onGenerateId?: () => string
}

export const NewTransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  accounts = [],
  transactionTypes = [],
  labels = {},
  defaultValues = {},
  currency = 'BRL',
  locale = 'pt-BR',
  showNotes = false,
  onGenerateId
}: NewTransactionModalProps) => {

  // Default data fallbacks for backward compatibility
  const defaultCategories: TransactionCategory[] = [
    { id: 'food', name: 'Alimentação' },
    { id: 'transport', name: 'Transporte' },
    { id: 'entertainment', name: 'Entretenimento' },
    { id: 'health', name: 'Saúde' },
    { id: 'education', name: 'Educação' },
    { id: 'clothing', name: 'Vestuário' },
    { id: 'home', name: 'Casa' },
    { id: 'investment', name: 'Investimento' },
    { id: 'income', name: 'Renda' },
    { id: 'other', name: 'Outros' }
  ]

  const defaultAccounts: TransactionAccount[] = [
    { id: 'checking', name: 'Conta Corrente', type: 'checking' },
    { id: 'savings', name: 'Conta Poupança', type: 'savings' },
    { id: 'visa', name: 'Cartão Visa', type: 'credit' },
    { id: 'mastercard', name: 'Cartão Mastercard', type: 'credit' }
  ]

  const defaultTransactionTypes: TransactionType[] = [
    { id: 'debit', name: 'Débito' },
    { id: 'credit', name: 'Crédito' },
    { id: 'pix', name: 'PIX' }
  ]

  const defaultLabels: TransactionLabels = {
    title: 'Nova Transação',
    description: 'Descrição',
    amount: 'Valor',
    date: 'Data',
    category: 'Categoria',
    account: 'Conta',
    type: 'Tipo de Transação',
    notes: 'Observações',
    submit: 'Adicionar Transação',
    cancel: 'Cancelar',
    descriptionPlaceholder: 'Ex: Supermercado Extra',
    amountPlaceholder: '0,00'
  }

  // Use provided data or fallback to defaults
  const finalCategories = categories.length > 0 ? categories : defaultCategories
  const finalAccounts = accounts.length > 0 ? accounts : defaultAccounts
  const finalTransactionTypes = transactionTypes.length > 0 ? transactionTypes : defaultTransactionTypes
  const finalLabels = { ...defaultLabels, ...labels }

  // Debug logging (only when modal opens)
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔍 Modal Opened: Received accounts:', accounts)
      console.log('🔍 Modal Opened: Final accounts:', finalAccounts)
      console.log('🔍 Modal Opened: Default values:', defaultValues)
    }
  }, [isOpen])

  const [formData, setFormData] = useState({
    description: defaultValues.description || '',
    amount: defaultValues.amount || 0,
    categoryId: defaultValues.categoryId || finalCategories[0]?.id || '',
    accountId: defaultValues.accountId || finalAccounts[0]?.id || '',
    typeId: defaultValues.typeId || finalTransactionTypes[0]?.id || '',
    date: defaultValues.date || new Date().toISOString().split('T')[0],
    notes: defaultValues.notes || ''
  })

  // Update form when defaultValues change (especially accountId)
  React.useEffect(() => {
    // Only update if we actually have valid IDs from defaultValues
    if (defaultValues.accountId || defaultValues.categoryId || defaultValues.typeId) {
      console.log('🔄 Modal: DefaultValues changed, updating form:', defaultValues)
      setFormData(prev => ({
        ...prev,
        categoryId: defaultValues.categoryId || prev.categoryId,
        accountId: defaultValues.accountId || prev.accountId,
        typeId: defaultValues.typeId || prev.typeId,
      }))
    }
    // Only depend on the actual IDs, not the arrays
  }, [defaultValues.accountId, defaultValues.categoryId, defaultValues.typeId])

  const [amountString, setAmountString] = useState(
    defaultValues.amount ? (defaultValues.amount * 100).toString() : ''
  )

  // Estado para o modal de criar categoria
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  // Função para criar nova categoria
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Digite um nome para a categoria')
      return
    }

    setIsCreatingCategory(true)
    try {
      const response = await userCategoriesService.createUserCategory({
        name: newCategoryName.trim(),
        type: newCategoryType,
        isDefault: false,
        tags: []
      })

      if (response.success && response.data) {
        // Adicionar nova categoria à lista
        const newCategory: TransactionCategory = {
          id: response.data.id,
          name: response.data.name
        }

        // Atualizar o estado com a nova categoria
        setFormData({ ...formData, categoryId: newCategory.id })

        // Fechar modal
        setShowCreateCategoryModal(false)
        setNewCategoryName('')

        alert(`Categoria "${newCategory.name}" criada com sucesso!`)

        // Recarregar a página para atualizar a lista de categorias
        window.location.reload()
      } else {
        alert('Erro ao criar categoria')
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      alert('Erro ao criar categoria')
    } finally {
      setIsCreatingCategory(false)
    }
  }

  // Função para formatar o valor em centavos para display (ex: 100000 → 1.000,00)
  const formatAmountDisplay = (centavos: string): string => {
    if (!centavos) return '0,00'
    const num = parseInt(centavos) || 0
    const reais = Math.floor(num / 100)
    const cents = num % 100
    // Adicionar separador de milhares
    const reaisFormatted = reais.toLocaleString('pt-BR')
    return `${reaisFormatted},${cents.toString().padStart(2, '0')}`
  }

  // Valor formatado para exibição
  const displayAmount = formatAmountDisplay(amountString)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Converter centavos para reais (ex: 1000 centavos → 10.00 reais)
    const centavos = parseInt(amountString) || 0
    const finalAmount = centavos / 100

    const transaction: TransactionFormData = {
      description: formData.description,
      amount: finalAmount,
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      typeId: formData.typeId,
      date: formData.date,
      ...(showNotes && { notes: formData.notes })
    }

    onSubmit(transaction)
    onClose()

    // Reset form to defaults
    const resetData = {
      description: defaultValues.description || '',
      amount: defaultValues.amount || 0,
      categoryId: defaultValues.categoryId || finalCategories[0]?.id || '',
      accountId: defaultValues.accountId || finalAccounts[0]?.id || '',
      typeId: defaultValues.typeId || finalTransactionTypes[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      notes: defaultValues.notes || ''
    }

    setFormData(resetData)
    setAmountString('')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(value)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={finalLabels.title!} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {finalLabels.description}
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
            placeholder={finalLabels.descriptionPlaceholder}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {finalLabels.amount}
            </label>
            <input
              type="text"
              value={displayAmount}
              onChange={(e) => {
                // Remover tudo exceto dígitos
                const onlyNumbers = e.target.value.replace(/\D/g, '')
                setAmountString(onlyNumbers)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {finalLabels.date}
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {finalLabels.category}
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => {
              if (e.target.value === '__create_new__') {
                setShowCreateCategoryModal(true)
                // Resetar para a categoria anterior
                setTimeout(() => {
                  if (finalCategories[0]?.id) {
                    setFormData({ ...formData, categoryId: finalCategories[0].id })
                  }
                }, 0)
              } else {
                setFormData({ ...formData, categoryId: e.target.value })
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
          >
            {finalCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            <option value="__create_new__" className="font-semibold text-blue-600">
              + Incluir nova categoria
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {finalLabels.account}
          </label>
          <select
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
          >
            {finalAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {finalLabels.type}
          </label>
          <div className={`grid gap-2 ${finalTransactionTypes.length <= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {finalTransactionTypes.map(type => (
              <label key={type.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={type.id}
                  checked={formData.typeId === type.id}
                  onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                  className="sr-only"
                />
                <Card className={`p-3 text-center transition-all ${formData.typeId === type.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                  <CardContent className="p-0">
                    <div className="text-sm font-medium">
                      {type.icon && <span className="mr-1">{type.icon}</span>}
                      {type.name}
                    </div>
                    {type.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {type.description}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </label>
            ))}
          </div>
        </div>

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
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {finalLabels.cancel}
          </Button>
          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            {finalLabels.submit}
          </Button>
        </div>
      </form>

      {/* Modal para criar nova categoria */}
      <Modal
        isOpen={showCreateCategoryModal}
        onClose={() => setShowCreateCategoryModal(false)}
        title="Criar Nova Categoria"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome da Categoria
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
              placeholder="Ex: Freelance, Aluguel, etc."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="categoryType"
                  value="EXPENSE"
                  checked={newCategoryType === 'EXPENSE'}
                  onChange={() => setNewCategoryType('EXPENSE')}
                  className="sr-only"
                />
                <Card className={`p-3 text-center transition-all ${newCategoryType === 'EXPENSE' ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                  <CardContent className="p-0">
                    <div className="text-sm font-medium">Despesa</div>
                  </CardContent>
                </Card>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="categoryType"
                  value="INCOME"
                  checked={newCategoryType === 'INCOME'}
                  onChange={() => setNewCategoryType('INCOME')}
                  className="sr-only"
                />
                <Card className={`p-3 text-center transition-all ${newCategoryType === 'INCOME' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                  <CardContent className="p-0">
                    <div className="text-sm font-medium">Receita</div>
                  </CardContent>
                </Card>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateCategoryModal(false)
                setNewCategoryName('')
              }}
              className="flex-1"
              disabled={isCreatingCategory}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateCategory}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isCreatingCategory || !newCategoryName.trim()}
            >
              {isCreatingCategory ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  )
}

/*
EXEMPLO DE USO AVANÇADO COM MICROSERVIÇOS:

// 1. Uso básico (mantém compatibilidade)
<NewTransactionModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleNewTransaction}
/>

// 2. Uso com dados do microserviço
const categoriesFromAPI: TransactionCategory[] = [
  { id: 'food', name: 'Alimentação', icon: '🍽️', color: '#ef4444' },
  { id: 'transport', name: 'Transporte', icon: '🚗', color: '#3b82f6' },
  // ... dados vindos da API
]

const accountsFromAPI: TransactionAccount[] = [
  {
    id: 'acc_001',
    name: 'Conta Principal',
    type: 'checking',
    currency: 'BRL'
  },
  // ... dados vindos da API
]

<NewTransactionModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={async (transaction) => {
    await api.post('/transactions', transaction)
    fetchTransactions() // Atualiza lista
  }}
  categories={categoriesFromAPI}
  accounts={accountsFromAPI}
  transactionTypes={[
    { id: 'debit', name: 'Débito', icon: '💳' },
    { id: 'credit', name: 'Crédito', icon: '💳' },
    { id: 'pix', name: 'PIX', icon: '🔄' },
    { id: 'transfer', name: 'Transferência', icon: '🔀' }
  ]}
  labels={{
    title: 'Nova Movimentação',
    submit: 'Salvar Transação',
    cancel: 'Fechar'
  }}
  defaultValues={{
    categoryId: 'food',
    accountId: 'acc_001'
  }}
  currency="BRL"
  locale="pt-BR"
  showNotes={true}
  onGenerateId={() => crypto.randomUUID()}
/>

// 3. Uso internacionalizado
<NewTransactionModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleNewTransaction}
  categories={categoriesFromAPI}
  accounts={accountsFromAPI}
  labels={{
    title: 'New Transaction',
    description: 'Description',
    amount: 'Amount',
    category: 'Category',
    account: 'Account',
    submit: 'Add Transaction',
    cancel: 'Cancel'
  }}
  currency="USD"
  locale="en-US"
/>
*/
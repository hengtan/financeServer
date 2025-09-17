import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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

  const [formData, setFormData] = useState({
    description: defaultValues.description || '',
    amount: defaultValues.amount || 0,
    categoryId: defaultValues.categoryId || finalCategories[0]?.id || '',
    accountId: defaultValues.accountId || finalAccounts[0]?.id || '',
    typeId: defaultValues.typeId || finalTransactionTypes[0]?.id || '',
    date: defaultValues.date || new Date().toISOString().split('T')[0],
    notes: defaultValues.notes || ''
  })

  const [amountString, setAmountString] = useState(
    defaultValues.amount ? defaultValues.amount.toString() : ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalAmount = parseFloat(amountString) || 0
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
              type="number"
              step="0.01"
              value={amountString}
              onChange={(e) => {
                setAmountString(e.target.value)
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
              placeholder={finalLabels.amountPlaceholder}
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
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
          >
            {finalCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon && `${cat.icon} `}{cat.name}
              </option>
            ))}
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
import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, CreditCard } from 'lucide-react'
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
  isIncome?: boolean // Indica se é receita (true) ou despesa (false)
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED' // Status da transação
  attachment?: File // Arquivo anexo (comprovante)
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
    { id: 'credit', name: 'Crédito' }
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

  // Debug logging (only when modal opens)
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔍 Modal Opened: Received accounts prop:', accounts)
      console.log('🔍 Modal Opened: Received categories prop:', categories)
      console.log('🔍 Modal Opened: Default values:', defaultValues)
    }
  }, [isOpen])

  // Use provided data or fallback to defaults
  const finalCategories = categories.length > 0 ? categories : defaultCategories
  const finalAccounts = accounts.length > 0 ? accounts : defaultAccounts
  const finalTransactionTypes = transactionTypes.length > 0 ? transactionTypes : defaultTransactionTypes
  const finalLabels = { ...defaultLabels, ...labels }

  // Debug final values
  React.useEffect(() => {
    if (isOpen) {
      console.log('📊 Final accounts being used:', finalAccounts)
      console.log('📊 Final categories being used:', finalCategories)
    }
  }, [isOpen, finalAccounts, finalCategories])

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

  // Estado para indicar se é receita ou despesa
  const [isIncome, setIsIncome] = useState(false)

  // Estado para escolher entre conta ou cartão
  const [paymentMethod, setPaymentMethod] = useState<'account' | 'card'>('account')

  // Estado para o modal de criar categoria
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  // Estados para modais de criar conta/cartão
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false)
  const [showCreateCardModal, setShowCreateCardModal] = useState(false)

  // Novos estados para funcionalidades adicionais
  const [isPaid, setIsPaid] = useState(true) // Se a transação já foi paga/realizada
  const [ignoreTransaction, setIgnoreTransaction] = useState(false) // Se deve ignorar no saldo
  const [dateQuickSelect, setDateQuickSelect] = useState<'today' | 'yesterday' | 'custom'>('today')
  const [attachment, setAttachment] = useState<File | null>(null)

  // Atualizar data quando muda quick select
  React.useEffect(() => {
    const now = new Date()
    if (dateQuickSelect === 'today') {
      setFormData(prev => ({ ...prev, date: now.toISOString().split('T')[0] }))
    } else if (dateQuickSelect === 'yesterday') {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      setFormData(prev => ({ ...prev, date: yesterday.toISOString().split('T')[0] }))
    }
  }, [dateQuickSelect])

  // Filtrar contas baseado no método de pagamento selecionado
  const getFilteredAccounts = (): TransactionAccount[] => {
    // Se for "card" (Cartão), mostrar apenas cartões de crédito
    if (paymentMethod === 'card') {
      return finalAccounts.filter(acc => acc.type === 'credit')
    }

    // Se for "account" (Conta), mostrar apenas contas corrente e poupança
    if (paymentMethod === 'account') {
      return finalAccounts.filter(acc => acc.type === 'checking' || acc.type === 'savings')
    }

    // Padrão: mostrar todas as contas
    return finalAccounts
  }

  const filteredAccounts = getFilteredAccounts()

  // Auto-selecionar a primeira conta válida quando o método de pagamento mudar
  React.useEffect(() => {
    const filtered = getFilteredAccounts()

    // Se a conta atual não está na lista filtrada, selecionar a primeira disponível
    const currentAccountValid = filtered.some(acc => acc.id === formData.accountId)

    if (!currentAccountValid && filtered.length > 0) {
      console.log('🔄 Payment method changed, auto-selecting first valid account:', filtered[0])
      setFormData(prev => ({ ...prev, accountId: filtered[0].id }))
    }
  }, [paymentMethod, finalAccounts])

  // Atualizar o typeId baseado no método de pagamento
  React.useEffect(() => {
    // Se for cartão, definir como 'credit', se for conta, definir como 'debit'
    const newTypeId = paymentMethod === 'card' ? 'credit' : 'debit'
    setFormData(prev => ({ ...prev, typeId: newTypeId }))
  }, [paymentMethod])

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
    const finalAmount = Math.abs(centavos / 100) // Sempre positivo

    // Determinar status: se foi paga → COMPLETED (atualiza saldo), se não → PENDING (não atualiza)
    const transactionStatus = isPaid ? 'COMPLETED' : 'PENDING'

    const transaction: TransactionFormData = {
      description: formData.description,
      amount: finalAmount,
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      typeId: formData.typeId,
      date: formData.date,
      isIncome: isIncome,
      status: transactionStatus, // NOVO: enviar status baseado em "Foi paga"
      attachment: attachment || undefined, // NOVO: anexo de arquivo
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
    setIsPaid(true)
    setDateQuickSelect('today')
    setAttachment(null)
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
        {/* Toggle de Receita/Despesa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Movimentação
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsIncome(false)}
              className={`p-3 rounded-lg border-2 transition-all ${
                !isIncome
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-semibold'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-300'
              }`}
            >
              <div className="text-2xl mb-1">↓</div>
              <div className="text-sm">Despesa</div>
            </button>
            <button
              type="button"
              onClick={() => setIsIncome(true)}
              className={`p-3 rounded-lg border-2 transition-all ${
                isIncome
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300'
              }`}
            >
              <div className="text-2xl mb-1">↑</div>
              <div className="text-sm">Receita</div>
            </button>
          </div>
        </div>

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
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                {isIncome ? '+' : '-'}
              </span>
              <input
                type="text"
                value={displayAmount}
                onChange={(e) => {
                  // Remover tudo exceto dígitos
                  const onlyNumbers = e.target.value.replace(/\D/g, '')
                  // Limitar a 1 bilhão (100.000.000.000 centavos)
                  const maxValue = 100000000000 // 1 bilhão em centavos
                  const numValue = parseInt(onlyNumbers) || 0
                  if (numValue <= maxValue) {
                    setAmountString(onlyNumbers)
                  }
                }}
                className={`w-full pl-8 pr-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 ${
                  isIncome
                    ? 'border-green-300 text-green-700 dark:text-green-300 dark:border-green-600'
                    : 'border-red-300 text-red-700 dark:text-red-300 dark:border-red-600'
                }`}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {finalLabels.date}
            </label>
            {/* Botões de seleção rápida de data */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setDateQuickSelect('today')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  dateQuickSelect === 'today'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setDateQuickSelect('yesterday')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  dateQuickSelect === 'yesterday'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Ontem
              </button>
              <button
                type="button"
                onClick={() => setDateQuickSelect('custom')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  dateQuickSelect === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Outros...
              </button>
            </div>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value })
                setDateQuickSelect('custom')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
              required
              disabled={dateQuickSelect !== 'custom'}
            />
          </div>
        </div>

        {/* Checkbox: Foi paga */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <input
            type="checkbox"
            id="isPaid"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="isPaid" className="flex-1 cursor-pointer">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Foi paga
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isPaid ? '✓ O saldo será atualizado automaticamente' : 'Apenas registrar (não afeta o saldo)'}
            </div>
          </label>
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

        {/* Método de Pagamento: Conta ou Cartão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Método de Pagamento
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="account"
                checked={paymentMethod === 'account'}
                onChange={() => setPaymentMethod('account')}
                className="sr-only"
              />
              <Card className={`p-3 text-center transition-all ${paymentMethod === 'account' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                <CardContent className="p-0">
                  <div className="text-sm font-medium">💳 Pago por Conta</div>
                </CardContent>
              </Card>
            </label>

            <label className="cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="sr-only"
              />
              <Card className={`p-3 text-center transition-all ${paymentMethod === 'card' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                <CardContent className="p-0">
                  <div className="text-sm font-medium">💳 Pago por Cartão</div>
                </CardContent>
              </Card>
            </label>
          </div>
        </div>

        {/* Seleção de Conta filtrada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {paymentMethod === 'account' ? 'Selecione a Conta' : 'Selecione o Cartão'}
          </label>
          <select
            value={formData.accountId}
            onChange={(e) => {
              if (e.target.value === '__create_new_account__') {
                setShowCreateAccountModal(true)
                // Resetar para a conta/cartão anterior
                setTimeout(() => {
                  if (filteredAccounts[0]?.id) {
                    setFormData({ ...formData, accountId: filteredAccounts[0].id })
                  }
                }, 0)
              } else if (e.target.value === '__create_new_card__') {
                setShowCreateCardModal(true)
                // Resetar para a conta/cartão anterior
                setTimeout(() => {
                  if (filteredAccounts[0]?.id) {
                    setFormData({ ...formData, accountId: filteredAccounts[0].id })
                  }
                }, 0)
              } else {
                setFormData({ ...formData, accountId: e.target.value })
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
          >
            {filteredAccounts.length > 0 ? (
              <>
                {filteredAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
                <option value={paymentMethod === 'account' ? '__create_new_account__' : '__create_new_card__'} className="font-semibold text-blue-600">
                  + {paymentMethod === 'account' ? 'Adicionar Nova Conta' : 'Adicionar Novo Cartão'}
                </option>
              </>
            ) : (
              <option value={paymentMethod === 'account' ? '__create_new_account__' : '__create_new_card__'} className="font-semibold text-blue-600">
                + {paymentMethod === 'account' ? 'Adicionar Nova Conta' : 'Adicionar Novo Cartão'}
              </option>
            )}
          </select>
        </div>

        {/* Anexar Arquivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Anexar Comprovante (opcional)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {attachment ? attachment.name : 'Clique para anexar arquivo'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {attachment && (
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Remover
              </button>
            )}
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
          <Button type="button" onClick={onClose} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            {finalLabels.cancel}
          </Button>
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
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
              onClick={() => {
                setShowCreateCategoryModal(false)
                setNewCategoryName('')
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isCreatingCategory}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateCategory}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isCreatingCategory || !newCategoryName.trim()}
            >
              {isCreatingCategory ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal informativo para adicionar conta */}
      <Modal
        isOpen={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
        title="Adicionar Nova Conta"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Para adicionar uma nova conta, acesse a página de <strong>Contas</strong>.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Lá você poderá cadastrar contas corrente, poupança e outros tipos de contas.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setShowCreateAccountModal(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={() => {
                window.location.href = '/contas'
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Ir para Contas
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal informativo para adicionar cartão */}
      <Modal
        isOpen={showCreateCardModal}
        onClose={() => setShowCreateCardModal(false)}
        title="Adicionar Novo Cartão"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Para adicionar um novo cartão de crédito, acesse a página de <strong>Cartões</strong>.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Lá você poderá cadastrar todos os seus cartões de crédito e gerenciar faturas.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setShowCreateCardModal(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={() => {
                window.location.href = '/cartoes'
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Ir para Cartões
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
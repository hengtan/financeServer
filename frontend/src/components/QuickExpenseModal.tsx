import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export interface QuickExpenseData {
  description: string
  amount: number
  categoryId: string
  accountId: string
  date: string
  isPaid: boolean
  ignoreBalance: boolean
  attachment?: File
  type: 'INCOME' | 'EXPENSE'
}

interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

interface QuickExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (expense: QuickExpenseData) => void
  accountId: string
  accountName: string
  categories?: Category[]
  onCreateCategory?: (name: string, type: 'INCOME' | 'EXPENSE') => Promise<string | null>
}

export const QuickExpenseModal = ({
  isOpen,
  onClose,
  onSubmit,
  accountId,
  accountName,
  categories = [],
  onCreateCategory
}: QuickExpenseModalProps) => {
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [amountString, setAmountString] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [isPaid, setIsPaid] = useState(false)
  const [ignoreBalance, setIgnoreBalance] = useState(false)
  const [dateQuickSelect, setDateQuickSelect] = useState<'today' | 'yesterday' | 'custom'>('today')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attachment, setAttachment] = useState<File | null>(null)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Atualizar data quando muda quick select
  React.useEffect(() => {
    const now = new Date()
    if (dateQuickSelect === 'today') {
      setDate(now.toISOString().split('T')[0])
    } else if (dateQuickSelect === 'yesterday') {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      setDate(yesterday.toISOString().split('T')[0])
    }
  }, [dateQuickSelect])

  // Função para formatar o valor em centavos para display
  const formatAmountDisplay = (centavos: string): string => {
    if (!centavos) return '0,00'
    const num = parseInt(centavos) || 0
    const reais = Math.floor(num / 100)
    const cents = num % 100
    const reaisFormatted = reais.toLocaleString('pt-BR')
    return `${reaisFormatted},${cents.toString().padStart(2, '0')}`
  }

  const displayAmount = formatAmountDisplay(amountString)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const centavos = parseInt(amountString) || 0
    const finalAmount = Math.abs(centavos / 100)

    if (finalAmount === 0) {
      alert('O valor deve ser diferente de 0')
      return
    }

    let finalCategoryId = categoryId

    // Se está criando nova categoria
    if (showNewCategory && newCategoryName.trim() && onCreateCategory) {
      const newCatId = await onCreateCategory(newCategoryName.trim(), transactionType)
      if (newCatId) {
        finalCategoryId = newCatId
      } else {
        alert('Erro ao criar categoria. Tente novamente.')
        return
      }
    }

    if (!finalCategoryId) {
      alert('Selecione uma categoria')
      return
    }

    const expense: QuickExpenseData = {
      description,
      amount: finalAmount,
      categoryId: finalCategoryId,
      accountId,
      date,
      isPaid,
      ignoreBalance,
      attachment: attachment || undefined,
      type: transactionType
    }

    onSubmit(expense)

    // Reset form
    setTransactionType('EXPENSE')
    setAmountString('')
    setDescription('')
    setCategoryId(categories[0]?.id || '')
    setIsPaid(true)
    setIgnoreBalance(false)
    setDateQuickSelect('today')
    setAttachment(null)
    setShowNewCategory(false)
    setNewCategoryName('')

    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Transação" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Transação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTransactionType('EXPENSE')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                transactionType === 'EXPENSE'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              💸 Despesa
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('INCOME')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                transactionType === 'INCOME'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              💰 Receita
            </button>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
            placeholder="Ex: Supermercado, Uber, etc."
            required
          />
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Valor
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
              R$
            </span>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
              BRL
            </div>
            <input
              type="text"
              value={displayAmount}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, '')
                const maxValue = 100000000000
                const numValue = parseInt(onlyNumbers) || 0
                if (numValue <= maxValue) {
                  setAmountString(onlyNumbers)
                }
              }}
              className="w-full pl-12 pr-16 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 text-lg font-semibold"
              placeholder="0,00"
              required
            />
          </div>
          {amountString && parseInt(amountString) === 0 && (
            <p className="text-xs text-red-600 mt-1">Deve ter um valor diferente de 0</p>
          )}
        </div>

        {/* Foi paga */}
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

        {/* Botões de data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data
          </label>
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
          {dateQuickSelect === 'custom' && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
              required
            />
          )}
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoria
          </label>
          {!showNewCategory ? (
            <div className="space-y-2">
              <select
                value={categoryId}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '__new__') {
                    setShowNewCategory(true)
                    setCategoryId('')
                  } else {
                    setCategoryId(value)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600"
                required
              >
                {categories.length > 0 ? (
                  <>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="__new__" className="font-semibold text-blue-600">
                      ➕ Adicionar nova categoria
                    </option>
                  </>
                ) : (
                  <>
                    <option value="">Nenhuma categoria disponível</option>
                    <option value="__new__" className="font-semibold text-blue-600">
                      ➕ Adicionar nova categoria
                    </option>
                  </>
                )}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da nova categoria"
                  className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 dark:bg-gray-800"
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false)
                    setNewCategoryName('')
                    setCategoryId(categories[0]?.id || '')
                  }}
                  className="px-3 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  ✕
                </Button>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 Digite o nome e clique em "Salvar e adicionar" no final para criar a categoria
              </p>
            </div>
          )}
        </div>

        {/* Conta (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Conta
          </label>
          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 font-medium">
            {accountName}
          </div>
        </div>

        {/* Anexar Arquivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Anexar Arquivo (opcional)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {attachment ? attachment.name : 'Clique para anexar'}
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
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Ignorar transação */}
        <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <input
            type="checkbox"
            id="ignoreBalance"
            checked={ignoreBalance}
            onChange={(e) => setIgnoreBalance(e.target.checked)}
            className="w-5 h-5 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
          />
          <label htmlFor="ignoreBalance" className="flex-1 cursor-pointer">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Ignorar transação
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Esta {transactionType === 'EXPENSE' ? 'despesa' : 'receita'} não será contabilizada no saldo
            </div>
          </label>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            Cancelar
          </Button>
          <Button
            type="submit"
            className={`flex-1 ${
              transactionType === 'EXPENSE'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
            disabled={!description || parseInt(amountString) === 0}
          >
            {transactionType === 'EXPENSE' ? '💸 Adicionar Despesa' : '💰 Adicionar Receita'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

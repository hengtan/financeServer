import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NewCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (card: NewCardData) => void
}

interface NewCardData {
  name: string
  brand: string
  lastDigits: string
  limit: number
  closingDay: number
  dueDay: number
}

const cardBrands = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'American Express' },
  { value: 'elo', label: 'Elo' },
  { value: 'other', label: 'Outro' }
]

export const NewCardModal = ({ isOpen, onClose, onSave }: NewCardModalProps) => {
  const [formData, setFormData] = useState<NewCardData>({
    name: '',
    brand: 'visa',
    lastDigits: '',
    limit: 0,
    closingDay: 1,
    dueDay: 10
  })

  const [limitString, setLimitString] = useState('')

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
  const displayLimit = formatAmountDisplay(limitString)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Converter centavos para reais (ex: 1000 centavos → 10.00 reais)
    const centavos = parseInt(limitString) || 0
    const finalLimit = Math.abs(centavos / 100) // Sempre positivo

    onSave({
      ...formData,
      limit: finalLimit
    })
    onClose()
    // Reset form
    setFormData({
      name: '',
      brand: 'visa',
      lastDigits: '',
      limit: 0,
      closingDay: 1,
      dueDay: 10
    })
    setLimitString('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Novo cartão de crédito</DialogTitle>
          <DialogDescription>
            Adicione um novo cartão para gerenciar suas faturas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Card Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do cartão</Label>
            <Input
              id="name"
              placeholder="Ex: Nubank, Inter, Itaú..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full !bg-white dark:!bg-gray-800"
            />
          </div>

          {/* Card Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Bandeira</Label>
            <select
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            >
              {cardBrands.map((brand) => (
                <option key={brand.value} value={brand.value}>
                  {brand.label}
                </option>
              ))}
            </select>
          </div>

          {/* Last Digits */}
          <div className="space-y-2">
            <Label htmlFor="lastDigits">Últimos 4 dígitos</Label>
            <Input
              id="lastDigits"
              type="text"
              maxLength={4}
              placeholder="1234"
              value={formData.lastDigits}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setFormData({ ...formData, lastDigits: value })
              }}
              required
              className="w-full !bg-white dark:!bg-gray-800"
            />
          </div>

          {/* Credit Limit */}
          <div className="space-y-2">
            <Label htmlFor="limit">Limite de crédito</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-blue-600">
                R$
              </span>
              <input
                type="text"
                value={displayLimit}
                onChange={(e) => {
                  // Remover tudo exceto dígitos
                  const onlyNumbers = e.target.value.replace(/\D/g, '')
                  // Limitar a 1 bilhão (100.000.000.000 centavos)
                  const maxValue = 100000000000 // 1 bilhão em centavos
                  const numValue = parseInt(onlyNumbers) || 0
                  if (numValue <= maxValue) {
                    setLimitString(onlyNumbers)
                    // Atualizar formData com o valor em reais
                    setFormData({ ...formData, limit: numValue / 100 })
                  }
                }}
                className="w-full pl-11 pr-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 border-blue-300 text-blue-700 dark:text-blue-300 dark:border-blue-600"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {/* Closing and Due Days */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closingDay">Dia de fechamento</Label>
              <Input
                id="closingDay"
                type="number"
                min="1"
                max="31"
                value={formData.closingDay}
                onChange={(e) => setFormData({ ...formData, closingDay: parseInt(e.target.value) || 1 })}
                className="!bg-white dark:!bg-gray-800"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDay">Dia de vencimento</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) || 10 })}
                className="!bg-white dark:!bg-gray-800"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={!formData.name || !formData.lastDigits || formData.limit <= 0}
            >
              Criar cartão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

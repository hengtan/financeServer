import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, DollarSign } from 'lucide-react'

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
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
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="limit"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: parseFloat(e.target.value) || 0 })}
                className="pl-10 !bg-white dark:!bg-gray-800"
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

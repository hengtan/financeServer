import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Building2,
  Wallet,
  Smartphone,
  DollarSign,
  Check
} from 'lucide-react'

interface NewAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (account: NewAccountData) => void
}

interface NewAccountData {
  name: string
  type: 'bank' | 'wallet' | 'digital'
  initialBalance: number
  color: string
}

const accountTypes = [
  { value: 'bank', label: 'Banco', icon: Building2, color: '#3b82f6' },
  { value: 'wallet', label: 'Carteira', icon: Wallet, color: '#10b981' },
  { value: 'digital', label: 'Digital', icon: Smartphone, color: '#8b5cf6' }
]

const accountColors = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
]

export const NewAccountModal = ({ isOpen, onClose, onSave }: NewAccountModalProps) => {
  const [formData, setFormData] = useState<NewAccountData>({
    name: '',
    type: 'bank',
    initialBalance: 0,
    color: accountColors[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
    // Reset form
    setFormData({
      name: '',
      type: 'bank',
      initialBalance: 0,
      color: accountColors[0]
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Nova conta</DialogTitle>
          <DialogDescription>
            Adicione uma nova conta para gerenciar suas finanças
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da conta</Label>
            <Input
              id="name"
              placeholder="Ex: Banco Inter, Carteira, Nubank..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full"
            />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label>Tipo de conta</Label>
            <div className="grid grid-cols-3 gap-3">
              {accountTypes.map((type) => {
                const Icon = type.icon
                const isSelected = formData.type === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${
                          isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <span className={`text-sm font-medium ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {type.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Initial Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">Saldo inicial</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) || 0 })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Cor da conta</Label>
            <div className="flex gap-2">
              {accountColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full transition-all ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {formData.color === color && (
                    <Check className="h-5 w-5 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={!formData.name}
            >
              Criar conta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

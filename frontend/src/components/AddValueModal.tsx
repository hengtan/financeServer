import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface AddValueModalProps {
  isOpen: boolean
  onClose: () => void
  goalTitle: string
  onSubmit: (amount: number) => void
}

export const AddValueModal = ({ isOpen, onClose, goalTitle, onSubmit }: AddValueModalProps) => {
  const [amount, setAmount] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(parseFloat(amount))
    setAmount('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adicionar Valor - ${goalTitle}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor a Adicionar
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="0,00"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[50, 100, 200].map(value => (
            <Button
              key={value}
              type="button"
              variant="outline"
              onClick={() => setAmount(value.toString())}
              className="text-sm"
            >
              R$ {value}
            </Button>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            Adicionar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Building2, Wallet } from 'lucide-react'

interface Account {
  id: string
  name: string
  balance: number
  icon: 'bank' | 'wallet' | 'digital'
  color: string
}

interface PayInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onPay: (accountId: string) => void
  cardName: string
  invoiceAmount: number
  accounts: Account[]
}

export const PayInvoiceModal = ({
  isOpen,
  onClose,
  onPay,
  cardName,
  invoiceAmount,
  accounts
}: PayInvoiceModalProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [insufficientFunds, setInsufficientFunds] = useState(false)

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id)
    }
  }, [accounts, selectedAccountId])

  useEffect(() => {
    if (selectedAccountId) {
      const account = accounts.find(acc => acc.id === selectedAccountId)
      setInsufficientFunds(account ? account.balance < invoiceAmount : false)
    }
  }, [selectedAccountId, accounts, invoiceAmount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!insufficientFunds && selectedAccountId) {
      onPay(selectedAccountId)
      onClose()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Building2 className="h-5 w-5" />
      case 'wallet':
        return <Wallet className="h-5 w-5" />
      case 'digital':
        return <Building2 className="h-5 w-5" />
      default:
        return <Building2 className="h-5 w-5" />
    }
  }

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Pagar fatura</DialogTitle>
          <DialogDescription>
            Selecione a conta para pagamento da fatura do {cardName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Invoice Amount */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Valor da fatura</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(invoiceAmount)}</p>
          </div>

          {/* Select Account */}
          <div className="space-y-3">
            <Label>Pagar com a conta</Label>
            <div className="space-y-2">
              {accounts.map((account) => {
                const isSelected = account.id === selectedAccountId
                const hasBalance = account.balance >= invoiceAmount

                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setSelectedAccountId(account.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: account.color }}
                        >
                          {getAccountIcon(account.icon)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{account.name}</p>
                          <p className={`text-sm ${
                            hasBalance
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            Saldo: {formatCurrency(account.balance)}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    {isSelected && !hasBalance && (
                      <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">Saldo insuficiente</p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Balance After Payment */}
          {selectedAccount && selectedAccount.balance >= invoiceAmount && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Saldo após pagamento</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(selectedAccount.balance - invoiceAmount)}
              </p>
            </div>
          )}

          {/* Warning */}
          {insufficientFunds && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-semibold">
                  A conta selecionada não possui saldo suficiente para pagar esta fatura.
                </p>
              </div>
            </div>
          )}

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
              disabled={insufficientFunds || !selectedAccountId}
            >
              Confirmar Pagamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

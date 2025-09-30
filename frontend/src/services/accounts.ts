// Accounts Service - Gerenciamento de contas financeiras
import { apiService, ApiResponse } from './api'

// Interface para uma conta
export interface Account {
  id: string
  name: string
  type: string
  balance: string
  currency: string
  status: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
}

// Interface para criação/atualização de conta
export interface CreateAccountData {
  name: string
  type: string
  balance?: string
  currency?: string
  status?: string
  description?: string
}

export interface UpdateAccountData extends Partial<CreateAccountData> {}

// Interface para resumo de contas
export interface AccountsSummary {
  totalAccounts: number
  totalBalance: number
  activeAccounts: number
  accountsByType: Record<string, number>
}

// Interface para saldo de conta
export interface AccountBalance {
  accountId: string
  accountName: string
  balance: string
  currency: string
  lastUpdated: string
}

class AccountsService {
  private readonly basePath = '/accounts'

  // Listar todas as contas do usuário
  async getAccounts(): Promise<ApiResponse<Account[]>> {
    return apiService.get<Account[]>(this.basePath)
  }

  // Buscar conta específica por ID
  async getAccountById(id: string): Promise<ApiResponse<Account>> {
    return apiService.get<Account>(`${this.basePath}/${id}`)
  }

  // Criar nova conta
  async createAccount(data: CreateAccountData): Promise<ApiResponse<Account>> {
    return apiService.post<Account>(this.basePath, data)
  }

  // Atualizar conta existente
  async updateAccount(id: string, data: UpdateAccountData): Promise<ApiResponse<Account>> {
    return apiService.put<Account>(`${this.basePath}/${id}`, data)
  }

  // Deletar conta
  async deleteAccount(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.basePath}/${id}`)
  }

  // Obter saldo atual de uma conta
  async getAccountBalance(id: string): Promise<ApiResponse<AccountBalance>> {
    return apiService.get<AccountBalance>(`${this.basePath}/${id}/balance`)
  }

  // Obter resumo de todas as contas
  async getAccountsSummary(): Promise<ApiResponse<{ summary: AccountsSummary; accounts: Account[] }>> {
    return apiService.get<{ summary: AccountsSummary; accounts: Account[] }>(`${this.basePath}/summary`)
  }

  // Testar conectividade da API
  async testConnection(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return apiService.get<{ message: string; timestamp: string }>(`${this.basePath}/test`)
  }

  // Métodos auxiliares para formatação
  formatBalance(balance: string | number, currency: string = 'BRL'): string {
    const value = typeof balance === 'string' ? parseFloat(balance) : balance

    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  // Validar dados da conta
  validateAccountData(data: CreateAccountData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome da conta é obrigatório')
    }

    if (!data.type || data.type.trim().length === 0) {
      errors.push('Tipo da conta é obrigatório')
    }

    if (data.balance && isNaN(parseFloat(data.balance))) {
      errors.push('Saldo deve ser um número válido')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Obter tipos de conta padrão
  getAccountTypes(): { value: string; label: string }[] {
    return [
      { value: 'CHECKING', label: 'Conta Corrente' },
      { value: 'SAVINGS', label: 'Poupança' },
      { value: 'INVESTMENT', label: 'Investimento' },
      { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
      { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
      { value: 'CASH', label: 'Dinheiro' },
      { value: 'OTHER', label: 'Outro' }
    ]
  }

  // Obter moedas suportadas
  getSupportedCurrencies(): { value: string; label: string; symbol: string }[] {
    return [
      { value: 'BRL', label: 'Real Brasileiro', symbol: 'R$' },
      { value: 'USD', label: 'Dólar Americano', symbol: '$' },
      { value: 'EUR', label: 'Euro', symbol: '€' },
      { value: 'GBP', label: 'Libra Esterlina', symbol: '£' }
    ]
  }

  // Obter status de conta
  getAccountStatuses(): { value: string; label: string; color: string }[] {
    return [
      { value: 'ACTIVE', label: 'Ativa', color: 'green' },
      { value: 'INACTIVE', label: 'Inativa', color: 'gray' },
      { value: 'SUSPENDED', label: 'Suspensa', color: 'yellow' },
      { value: 'CLOSED', label: 'Fechada', color: 'red' }
    ]
  }
}

// Instância singleton do serviço
export const accountsService = new AccountsService()

// Exportar tipos para uso em outros arquivos
export type { CreateAccountData, UpdateAccountData, AccountsSummary, AccountBalance }
export { AccountsService }
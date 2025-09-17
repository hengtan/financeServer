// Interfaces de configuração para integração com microserviços

// ============================================================================
// CONFIGURAÇÃO GERAL DA APLICAÇÃO
// ============================================================================

export interface AppConfiguration {
  brand: BrandConfig
  navigation: NavigationConfig
  forms: FormsConfig
  localization: LocalizationConfig
  features: FeatureConfig
  theme: ThemeConfig
}

// ============================================================================
// CONFIGURAÇÃO DE MARCA
// ============================================================================

export interface BrandConfig {
  name: string
  logo?: string
  logoAlt?: string
  favicon?: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  urls: {
    website?: string
    support?: string
    documentation?: string
  }
}

// ============================================================================
// CONFIGURAÇÃO DE NAVEGAÇÃO
// ============================================================================

export interface NavigationConfig {
  items: NavigationItem[]
  userMenu: UserMenuItem[]
  mobileMenuEnabled: boolean
  breadcrumbEnabled: boolean
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: string
  children?: NavigationItem[]
  roles?: string[]
  external?: boolean
  badge?: string
}

export interface UserMenuItem {
  id: string
  label: string
  href?: string
  icon?: string
  action?: 'logout' | 'profile' | 'settings' | 'theme-toggle'
  divider?: boolean
}

// ============================================================================
// CONFIGURAÇÃO DE FORMULÁRIOS
// ============================================================================

export interface FormsConfig {
  transactions: TransactionFormConfig
  goals: GoalFormConfig
  validation: ValidationConfig
}

export interface TransactionFormConfig {
  categories: Category[]
  accounts: Account[]
  transactionTypes: TransactionType[]
  defaultValues: TransactionDefaults
  fieldsEnabled: {
    notes: boolean
    attachments: boolean
    tags: boolean
    recurring: boolean
  }
}

export interface GoalFormConfig {
  categories: GoalCategory[]
  colorOptions: ColorOption[]
  defaultValues: GoalDefaults
  fieldsEnabled: {
    priority: boolean
    notes: boolean
    monthlyTarget: boolean
    milestones: boolean
  }
}

export interface ValidationConfig {
  minAmount: number
  maxAmount: number
  maxDescriptionLength: number
  maxNotesLength: number
  requiredFields: string[]
}

// ============================================================================
// ENTIDADES DE DADOS
// ============================================================================

export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  type: 'income' | 'expense' | 'transfer'
  parentId?: string
  sortOrder?: number
  active: boolean
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash'
  currency: string
  icon?: string
  color?: string
  balance?: number
  active: boolean
}

export interface TransactionType {
  id: string
  name: string
  icon?: string
  description?: string
  category: 'payment' | 'transfer' | 'investment'
  active: boolean
}

export interface GoalCategory {
  id: string
  name: string
  icon?: string
  color?: string
  description?: string
  active: boolean
}

export interface ColorOption {
  id: string
  name: string
  value: string
  preview: string
  group?: string
}

// ============================================================================
// VALORES PADRÃO
// ============================================================================

export interface TransactionDefaults {
  categoryId?: string
  accountId?: string
  typeId?: string
  amount?: number
  date?: 'today' | 'custom'
}

export interface GoalDefaults {
  categoryId?: string
  priority?: 'low' | 'medium' | 'high'
  colorId?: string
  monthlyTarget?: number
}

// ============================================================================
// LOCALIZAÇÃO E IDIOMAS
// ============================================================================

export interface LocalizationConfig {
  defaultLocale: string
  supportedLocales: string[]
  currency: CurrencyConfig
  dateFormat: string
  numberFormat: NumberFormatConfig
  labels: LabelsConfig
}

export interface CurrencyConfig {
  code: string
  symbol: string
  position: 'before' | 'after'
  decimalPlaces: number
  thousandsSeparator: string
  decimalSeparator: string
}

export interface NumberFormatConfig {
  thousandsSeparator: string
  decimalSeparator: string
  decimalPlaces: number
}

export interface LabelsConfig {
  common: CommonLabels
  forms: FormLabels
  navigation: NavigationLabels
  dashboard: DashboardLabels
}

export interface CommonLabels {
  save: string
  cancel: string
  delete: string
  edit: string
  view: string
  close: string
  loading: string
  error: string
  success: string
  warning: string
  info: string
}

export interface FormLabels {
  transaction: TransactionLabels
  goal: GoalLabels
  validation: ValidationLabels
}

export interface TransactionLabels {
  title: string
  description: string
  amount: string
  date: string
  category: string
  account: string
  type: string
  notes: string
  submit: string
  cancel: string
  placeholders: {
    description: string
    amount: string
  }
}

export interface GoalLabels {
  title: string
  goalTitle: string
  description: string
  targetAmount: string
  deadline: string
  category: string
  monthlyTarget: string
  priority: string
  notes: string
  submit: string
  cancel: string
  placeholders: {
    title: string
    description: string
    amount: string
  }
}

export interface ValidationLabels {
  required: string
  minAmount: string
  maxAmount: string
  invalidDate: string
  invalidEmail: string
  maxLength: string
}

export interface NavigationLabels {
  dashboard: string
  transactions: string
  goals: string
  reports: string
  settings: string
  profile: string
  logout: string
}

export interface DashboardLabels {
  welcome: string
  totalBalance: string
  monthlyExpenses: string
  savings: string
  investments: string
  recentTransactions: string
  financialGoals: string
  smartAlerts: string
  monthlySummary: string
}

// ============================================================================
// CONFIGURAÇÃO DE FUNCIONALIDADES
// ============================================================================

export interface FeatureConfig {
  modules: ModuleConfig
  integrations: IntegrationConfig
  limits: LimitsConfig
}

export interface ModuleConfig {
  transactions: boolean
  goals: boolean
  reports: boolean
  budgets: boolean
  investments: boolean
  exports: boolean
  notifications: boolean
}

export interface IntegrationConfig {
  bankSync: boolean
  openBanking: boolean
  exportFormats: string[]
  webhooks: boolean
  apiAccess: boolean
}

export interface LimitsConfig {
  maxTransactionsPerMonth: number
  maxGoals: number
  maxAccounts: number
  maxCategories: number
  maxExportRecords: number
}

// ============================================================================
// CONFIGURAÇÃO DE TEMA
// ============================================================================

export interface ThemeConfig {
  defaultTheme: 'light' | 'dark' | 'system'
  allowThemeToggle: boolean
  customColors?: CustomColorPalette
  fonts?: FontConfig
}

export interface CustomColorPalette {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
}

export interface FontConfig {
  primary: string
  secondary?: string
  sizes: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
  }
}

// ============================================================================
// TIPOS UTILITÁRIOS
// ============================================================================

export type ConfigurationEndpoint = {
  url: string
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  auth?: boolean
}

export type ApiResponse<T> = {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

// ============================================================================
// EXEMPLO DE CONFIGURAÇÃO COMPLETA
// ============================================================================

export const defaultAppConfiguration: AppConfiguration = {
  brand: {
    name: 'FinanceServer',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#10b981'
    },
    urls: {
      website: 'https://financeserver.com',
      support: 'https://support.financeserver.com'
    }
  },
  navigation: {
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { id: 'transactions', label: 'Transações', href: '/transacoes', icon: '💰' },
      { id: 'goals', label: 'Metas', href: '/metas', icon: '🎯' },
      { id: 'reports', label: 'Relatórios', href: '/relatorios', icon: '📈' }
    ],
    userMenu: [
      { id: 'profile', label: 'Perfil', href: '/perfil', icon: '👤' },
      { id: 'settings', label: 'Configurações', href: '/configuracoes', icon: '⚙️' },
      { id: 'divider', label: '', divider: true },
      { id: 'logout', label: 'Sair', action: 'logout', icon: '🚪' }
    ],
    mobileMenuEnabled: true,
    breadcrumbEnabled: true
  },
  forms: {
    transactions: {
      categories: [],
      accounts: [],
      transactionTypes: [],
      defaultValues: {},
      fieldsEnabled: {
        notes: true,
        attachments: false,
        tags: false,
        recurring: false
      }
    },
    goals: {
      categories: [],
      colorOptions: [],
      defaultValues: {},
      fieldsEnabled: {
        priority: false,
        notes: false,
        monthlyTarget: true,
        milestones: false
      }
    },
    validation: {
      minAmount: 0.01,
      maxAmount: 999999999,
      maxDescriptionLength: 255,
      maxNotesLength: 1000,
      requiredFields: ['description', 'amount', 'categoryId', 'accountId']
    }
  },
  localization: {
    defaultLocale: 'pt-BR',
    supportedLocales: ['pt-BR', 'en-US'],
    currency: {
      code: 'BRL',
      symbol: 'R$',
      position: 'before',
      decimalPlaces: 2,
      thousandsSeparator: '.',
      decimalSeparator: ','
    },
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      thousandsSeparator: '.',
      decimalSeparator: ',',
      decimalPlaces: 2
    },
    labels: {
      common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        view: 'Visualizar',
        close: 'Fechar',
        loading: 'Carregando...',
        error: 'Erro',
        success: 'Sucesso',
        warning: 'Aviso',
        info: 'Informação'
      },
      forms: {
        transaction: {
          title: 'Nova Transação',
          description: 'Descrição',
          amount: 'Valor',
          date: 'Data',
          category: 'Categoria',
          account: 'Conta',
          type: 'Tipo',
          notes: 'Observações',
          submit: 'Adicionar Transação',
          cancel: 'Cancelar',
          placeholders: {
            description: 'Ex: Supermercado Extra',
            amount: '0,00'
          }
        },
        goal: {
          title: 'Nova Meta',
          goalTitle: 'Título da Meta',
          description: 'Descrição',
          targetAmount: 'Valor da Meta',
          deadline: 'Data Limite',
          category: 'Categoria',
          monthlyTarget: 'Meta Mensal',
          priority: 'Prioridade',
          notes: 'Observações',
          submit: 'Criar Meta',
          cancel: 'Cancelar',
          placeholders: {
            title: 'Ex: Viagem para Europa',
            description: 'Descreva sua meta em detalhes',
            amount: '0,00'
          }
        },
        validation: {
          required: 'Este campo é obrigatório',
          minAmount: 'Valor mínimo é {min}',
          maxAmount: 'Valor máximo é {max}',
          invalidDate: 'Data inválida',
          invalidEmail: 'Email inválido',
          maxLength: 'Máximo de {max} caracteres'
        }
      },
      navigation: {
        dashboard: 'Dashboard',
        transactions: 'Transações',
        goals: 'Metas',
        reports: 'Relatórios',
        settings: 'Configurações',
        profile: 'Perfil',
        logout: 'Sair'
      },
      dashboard: {
        welcome: 'Bem-vindo',
        totalBalance: 'Saldo Total',
        monthlyExpenses: 'Gastos do Mês',
        savings: 'Economia',
        investments: 'Investimentos',
        recentTransactions: 'Transações Recentes',
        financialGoals: 'Metas Financeiras',
        smartAlerts: 'Alertas Inteligentes',
        monthlySummary: 'Resumo Mensal'
      }
    }
  },
  features: {
    modules: {
      transactions: true,
      goals: true,
      reports: true,
      budgets: false,
      investments: true,
      exports: true,
      notifications: true
    },
    integrations: {
      bankSync: false,
      openBanking: false,
      exportFormats: ['CSV', 'PDF', 'Excel'],
      webhooks: false,
      apiAccess: true
    },
    limits: {
      maxTransactionsPerMonth: 1000,
      maxGoals: 50,
      maxAccounts: 20,
      maxCategories: 100,
      maxExportRecords: 10000
    }
  },
  theme: {
    defaultTheme: 'system',
    allowThemeToggle: true
  }
}
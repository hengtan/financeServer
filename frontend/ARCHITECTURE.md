# FinanceServer - Arquitetura do Sistema 🏗️

Documentação técnica completa da arquitetura, padrões e estrutura do FinanceServer.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura Frontend](#-arquitetura-frontend)
- [Padrões de Design](#-padrões-de-design)
- [Estrutura de Componentes](#-estrutura-de-componentes)
- [Gerenciamento de Estado](#-gerenciamento-de-estado)
- [Roteamento](#-roteamento)
- [Sistema de Temas](#-sistema-de-temas)
- [Tratamento de Dados](#-tratamento-de-dados)
- [Performance](#-performance)
- [Segurança](#-segurança)
- [Escalabilidade](#-escalabilidade)

---

## 🎯 Visão Geral

O FinanceServer é construído como uma **Single Page Application (SPA)** moderna utilizando React 18 com TypeScript, seguindo princípios de **Clean Architecture** e **SOLID**.

### Princípios Arquiteturais

- **Separation of Concerns**: Cada camada tem responsabilidade específica
- **Dependency Inversion**: Dependências apontam para abstrações
- **Component Composition**: Favorecer composição sobre herança
- **Immutability**: Estado imutável para previsibilidade
- **Performance First**: Otimizações desde o design

### Stack Tecnológica

```typescript
// Core
React 18.x          // Biblioteca principal
TypeScript 5.x      // Tipagem estática
Vite 5.x           // Build tool e dev server

// Styling
Tailwind CSS 3.x   // Framework CSS utilitário
shadcn/ui          // Sistema de componentes

// Routing & State
React Router 6.x   // Navegação SPA
Context API        // Gerenciamento de estado

// Development
ESLint            // Linting
Prettier          // Formatação
```

---

## 🏛️ Arquitetura Frontend

### Camadas da Aplicação

```
┌─────────────────────────────────────┐
│           Presentation Layer         │  <- Pages & Components
├─────────────────────────────────────┤
│           Business Logic Layer       │  <- Contexts & Hooks
├─────────────────────────────────────┤
│           Data Access Layer          │  <- Services & APIs
├─────────────────────────────────────┤
│           Infrastructure Layer       │  <- Utils & Config
└─────────────────────────────────────┘
```

#### 1. **Presentation Layer**
```typescript
src/
├── pages/              # Páginas da aplicação
├── components/         # Componentes reutilizáveis
│   ├── ui/            # Componentes base
│   └── business/      # Componentes específicos
```

#### 2. **Business Logic Layer**
```typescript
src/
├── contexts/          # Contextos React
├── hooks/             # Custom hooks
└── types/             # Definições TypeScript
```

#### 3. **Data Access Layer**
```typescript
src/
├── services/          # APIs e serviços
├── repositories/      # Camada de dados
└── models/            # Modelos de dados
```

#### 4. **Infrastructure Layer**
```typescript
src/
├── lib/               # Utilitários
├── config/            # Configurações
└── constants/         # Constantes
```

---

## 🎨 Padrões de Design

### 1. **Component Design Patterns**

#### Container/Presentational Pattern
```typescript
// Container Component (lógica)
export const TransactionsContainer = () => {
  const [transactions, setTransactions] = useState([])
  const handleCreate = (data) => { /* lógica */ }

  return (
    <TransactionsView
      transactions={transactions}
      onCreate={handleCreate}
    />
  )
}

// Presentational Component (UI)
interface TransactionsViewProps {
  transactions: Transaction[]
  onCreate: (data: TransactionData) => void
}

export const TransactionsView = ({ transactions, onCreate }) => {
  // Apenas UI, sem lógica de negócio
}
```

#### Compound Components Pattern
```typescript
export const Modal = ({ children, isOpen, onClose }) => {
  return (
    <ModalContext.Provider value={{ isOpen, onClose }}>
      {children}
    </ModalContext.Provider>
  )
}

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter

// Uso
<Modal isOpen={true} onClose={handleClose}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>Actions</Modal.Footer>
</Modal>
```

### 2. **Custom Hooks Pattern**

```typescript
// Business Logic Hook
export const useTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  const createTransaction = async (data: TransactionData) => {
    setLoading(true)
    try {
      const result = await transactionService.create(data)
      setTransactions(prev => [result, ...prev])
      return result
    } finally {
      setLoading(false)
    }
  }

  return {
    transactions,
    loading,
    createTransaction,
    // ... outras operações
  }
}
```

### 3. **Repository Pattern**

```typescript
interface TransactionRepository {
  findAll(): Promise<Transaction[]>
  findById(id: string): Promise<Transaction | null>
  create(data: TransactionData): Promise<Transaction>
  update(id: string, data: Partial<TransactionData>): Promise<Transaction>
  delete(id: string): Promise<void>
}

class LocalTransactionRepository implements TransactionRepository {
  // Implementação para localStorage
}

class ApiTransactionRepository implements TransactionRepository {
  // Implementação para API REST
}
```

---

## 🧩 Estrutura de Componentes

### Hierarquia de Componentes

```
App
├── Router
├── AuthProvider
├── ThemeProvider
└── Routes
    ├── PublicRoutes
    │   ├── Header
    │   ├── HomePage
    │   ├── LoginPage
    │   └── Footer
    └── PrivateRoutes
        ├── DashboardLayout
        │   ├── Sidebar
        │   ├── Header
        │   └── Main
        ├── DashboardPage
        ├── TransactionsPage
        ├── ReportsPage
        └── GoalsPage
```

### Componente Base Template

```typescript
import React from 'react'
import { cn } from '@/lib/utils'

interface ComponentProps {
  className?: string
  children?: React.ReactNode
  // Props específicas
}

export const Component = React.forwardRef<
  HTMLDivElement,
  ComponentProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("base-styles", className)}
      {...props}
    >
      {children}
    </div>
  )
})

Component.displayName = "Component"
```

### Convenções de Nomenclatura

```typescript
// Componentes: PascalCase
export const UserProfile = () => {}

// Hooks: use + PascalCase
export const useUserData = () => {}

// Contexts: PascalCase + Context
export const AuthContext = createContext()

// Types/Interfaces: PascalCase
interface UserData {
  id: string
  name: string
}

// Constants: UPPER_SNAKE_CASE
export const API_ENDPOINTS = {
  USERS: '/users',
  TRANSACTIONS: '/transactions'
}
```

---

## 🔄 Gerenciamento de Estado

### Estado Global (Context API)

```typescript
// AuthContext.tsx
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (credentials: LoginData) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export const AuthContext = createContext<AuthState & AuthActions>()

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  })

  // Actions implementadas aqui

  return (
    <AuthContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Estado Local (useState/useReducer)

```typescript
// Para estados simples
const [count, setCount] = useState(0)

// Para estados complexos
const [state, dispatch] = useReducer(transactionReducer, initialState)

// Reducer pattern
interface State {
  transactions: Transaction[]
  loading: boolean
  error: string | null
}

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: Transaction[] }
  | { type: 'ERROR'; payload: string }

const transactionReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null }
    case 'SUCCESS':
      return { ...state, loading: false, transactions: action.payload }
    case 'ERROR':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}
```

---

## 🛣️ Roteamento

### Estrutura de Rotas

```typescript
// App.tsx
function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="sobre" element={<AboutPage />} />
          </Route>

          {/* Rotas Protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="transacoes" element={<TransactionsPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
            <Route path="metas" element={<GoalsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
```

### Route Guards

```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return isAuthenticated ?
    <>{children}</> :
    <Navigate to="/login" replace />
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ?
    <Navigate to="/dashboard" replace /> :
    <>{children}</>
}
```

---

## 🎨 Sistema de Temas

### Design Tokens

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... escala completa
          900: '#1e3a8a',
        },

        // Semantic Colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',

        // Surface Colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        // ... escala tipográfica completa
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
}
```

### CSS Variables

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
}
```

---

## 📊 Tratamento de Dados

### Data Models

```typescript
// types/index.ts
export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category: Category
  account: Account
  type: TransactionType
  status: TransactionStatus
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: string
  status: GoalStatus
  monthlyTarget: number
  createdAt: string
  color: string
}

// Tipos utilitários
export type CreateTransactionData = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTransactionData = Partial<CreateTransactionData>
```

### Data Services

```typescript
// services/transactionService.ts
class TransactionService {
  private repository: TransactionRepository

  constructor(repository: TransactionRepository) {
    this.repository = repository
  }

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    // Validações
    this.validateTransactionData(data)

    // Transformações
    const processedData = this.processTransactionData(data)

    // Persistência
    return await this.repository.create(processedData)
  }

  async getTransactionsByPeriod(
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    const transactions = await this.repository.findByDateRange(startDate, endDate)
    return this.sortTransactionsByDate(transactions)
  }

  private validateTransactionData(data: CreateTransactionData): void {
    if (!data.description.trim()) {
      throw new Error('Descrição é obrigatória')
    }

    if (data.amount === 0) {
      throw new Error('Valor deve ser diferente de zero')
    }
  }
}
```

### Data Validation

```typescript
// utils/validation.ts
import { z } from 'zod'

export const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().refine(val => val !== 0, 'Valor deve ser diferente de zero'),
  date: z.string().datetime(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  account: z.string().min(1, 'Conta é obrigatória'),
  type: z.enum(['crédito', 'débito', 'pix', 'cartão', 'transferência']),
})

export type TransactionData = z.infer<typeof transactionSchema>
```

---

## ⚡ Performance

### Code Splitting

```typescript
// Lazy loading de páginas
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'))

// Componente Wrapper
const LazyPage = ({ Component }: { Component: React.ComponentType }) => (
  <Suspense fallback={<PageSkeleton />}>
    <Component />
  </Suspense>
)
```

### Memoization

```typescript
// React.memo para componentes
export const TransactionItem = React.memo(({ transaction, onEdit, onDelete }) => {
  return (
    <div className="transaction-item">
      {/* UI */}
    </div>
  )
})

// useMemo para cálculos custosos
const ExpensiveComponent = ({ transactions }) => {
  const summary = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      // Cálculo complexo
      return acc
    }, {})
  }, [transactions])

  return <div>{/* UI com summary */}</div>
}

// useCallback para funções
const ParentComponent = () => {
  const handleItemClick = useCallback((id: string) => {
    // Handler estável
  }, [])

  return (
    <List onItemClick={handleItemClick} />
  )
}
```

### Virtual Scrolling

```typescript
// Para listas grandes
import { FixedSizeList as List } from 'react-window'

const TransactionList = ({ transactions }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TransactionItem transaction={transactions[index]} />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={transactions.length}
      itemSize={80}
    >
      {Row}
    </List>
  )
}
```

---

## 🔐 Segurança

### Autenticação

```typescript
// Token management
class AuthService {
  private tokenKey = 'finance_token'

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey)
  }

  isTokenValid(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp > Date.now() / 1000
    } catch {
      return false
    }
  }
}
```

### Input Sanitization

```typescript
// Sanitização de inputs
import DOMPurify from 'dompurify'

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim())
}

// Validação de tipos
export const validateNumber = (value: unknown): number => {
  const num = Number(value)
  if (isNaN(num)) {
    throw new Error('Valor deve ser um número válido')
  }
  return num
}
```

### Error Boundaries

```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Log para serviço de monitoramento
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
```

---

## 📈 Escalabilidade

### Micro-Frontends Preparation

```typescript
// Module Federation setup (futuro)
const ModuleFederationPlugin = require('@module-federation/webpack')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'financeCore',
      remotes: {
        reports: 'reports@http://localhost:3001/remoteEntry.js',
        transactions: 'transactions@http://localhost:3002/remoteEntry.js',
      },
    }),
  ],
}
```

### API Abstraction

```typescript
// API client abstraction
interface ApiClient {
  get<T>(url: string): Promise<T>
  post<T>(url: string, data: any): Promise<T>
  put<T>(url: string, data: any): Promise<T>
  delete(url: string): Promise<void>
}

class RestApiClient implements ApiClient {
  constructor(private baseUrl: string) {}

  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`)
    return response.json()
  }

  // ... outras implementações
}

class GraphQLApiClient implements ApiClient {
  // Implementação GraphQL
}
```

### Feature Flags

```typescript
// Feature flags system
interface FeatureFlags {
  darkMode: boolean
  advancedReports: boolean
  socialFeatures: boolean
}

export const useFeatureFlags = (): FeatureFlags => {
  return {
    darkMode: process.env.VITE_FEATURE_DARK_MODE === 'true',
    advancedReports: process.env.VITE_FEATURE_ADVANCED_REPORTS === 'true',
    socialFeatures: process.env.VITE_FEATURE_SOCIAL === 'true',
  }
}

// Uso
const Component = () => {
  const { darkMode } = useFeatureFlags()

  return (
    <div>
      {darkMode && <DarkModeToggle />}
    </div>
  )
}
```

---

## 📚 Documentação e Testes

### JSDoc

```typescript
/**
 * Calcula o resumo financeiro baseado em transações
 * @param transactions - Array de transações para análise
 * @param period - Período para filtrar as transações
 * @returns Objeto com resumo financeiro
 * @example
 * ```typescript
 * const summary = calculateFinancialSummary(transactions, '2024-01')
 * console.log(summary.totalExpenses) // -1500.00
 * ```
 */
export const calculateFinancialSummary = (
  transactions: Transaction[],
  period: string
): FinancialSummary => {
  // Implementação
}
```

### Testing Strategy

```typescript
// Unit Tests
describe('TransactionService', () => {
  it('should create transaction with valid data', async () => {
    const service = new TransactionService(mockRepository)
    const data = createMockTransactionData()

    const result = await service.createTransaction(data)

    expect(result).toMatchObject(data)
    expect(mockRepository.create).toHaveBeenCalledWith(data)
  })
})

// Integration Tests
describe('TransactionPage', () => {
  it('should display transactions and allow creation', async () => {
    render(<TransactionPage />, { wrapper: TestProviders })

    await waitFor(() => {
      expect(screen.getByText('Nova Transação')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Nova Transação'))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
```

---

## 🚀 Build e Deploy

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
```

### Environment Configuration

```typescript
// env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_FEATURE_DARK_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## 📊 Monitoramento

### Error Tracking

```typescript
// Error reporting
export const reportError = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket, etc.
    console.error('Error reported:', error, context)
  } else {
    console.error('Development error:', error, context)
  }
}
```

### Performance Monitoring

```typescript
// Performance tracking
export const trackPerformance = (name: string, fn: () => void) => {
  const start = performance.now()
  fn()
  const end = performance.now()

  console.log(`${name} took ${end - start} milliseconds`)
}
```

---

Esta arquitetura garante um sistema escalável, maintível e performático, seguindo as melhores práticas da indústria e preparado para crescimento futuro.

**FinanceServer Architecture Team** 🏗️
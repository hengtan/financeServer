import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Home,
  CreditCard,
  Receipt,
  TrendingUp,
  BarChart3,
  Target,
  Bell,
  Calculator,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  LogOut,
  Building2,
  ArrowDownUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  badge?: number
}

interface QuickActionProps {
  isOpen: boolean
  onClose: () => void
  onActionSelect: (action: 'expense' | 'income' | 'card-expense' | 'transfer') => void
}

const QuickActionMenu = ({ isOpen, onClose, onActionSelect }: QuickActionProps) => {
  if (!isOpen) return null

  const actions = [
    { id: 'expense', label: 'Nova Despesa', icon: <ArrowDownUp className="h-4 w-4 text-red-500" /> },
    { id: 'income', label: 'Nova Receita', icon: <ArrowDownUp className="h-4 w-4 text-green-500 rotate-180" /> },
    { id: 'card-expense', label: 'Despesa Cartão', icon: <CreditCard className="h-4 w-4 text-orange-500" /> },
    { id: 'transfer', label: 'Transferência', icon: <ArrowDownUp className="h-4 w-4 text-blue-500" /> }
  ]

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <div className="fixed left-20 top-20 bg-background border border-border rounded-lg shadow-lg z-50 p-2 min-w-[200px]">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              onActionSelect(action.id as any)
              onClose()
            }}
            className="flex items-center w-full px-4 py-3 rounded-md hover:bg-accent transition-colors text-left"
          >
            {action.icon}
            <span className="ml-3 text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" />, href: '/dashboard' },
    { id: 'accounts', label: 'Contas', icon: <Building2 className="h-5 w-5" />, href: '/contas' },
    { id: 'cards', label: 'Cartões', icon: <CreditCard className="h-5 w-5" />, href: '/transacoes' },
    { id: 'transactions', label: 'Transações', icon: <Receipt className="h-5 w-5" />, href: '/transacoes' },
    { id: 'reports', label: 'Gráficos', icon: <BarChart3 className="h-5 w-5" />, href: '/relatorios' },
    { id: 'goals', label: 'Metas', icon: <Target className="h-5 w-5" />, href: '/metas' },
    { id: 'alerts', label: 'Alertas', icon: <Bell className="h-5 w-5" />, href: '/alertas' },
    { id: 'calculators', label: 'Calculadoras', icon: <Calculator className="h-5 w-5" />, href: '/calculadoras' }
  ]

  const isActive = (href: string) => location.pathname === href

  const handleQuickAction = (action: 'expense' | 'income' | 'card-expense' | 'transfer') => {
    // Navega para transações com um state indicando qual modal abrir
    navigate('/transacoes', { state: { openModal: action } })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-30 flex flex-col ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center border-b border-border">
          <Link to="/dashboard" className="flex items-center space-x-3 px-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            {isExpanded && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                FinanceApp
              </span>
            )}
          </Link>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <Button
            onClick={() => setShowQuickActions(true)}
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg ${
              isExpanded ? 'justify-start' : 'justify-center p-3'
            }`}
          >
            <Plus className="h-5 w-5" />
            {isExpanded && <span className="ml-2">Novo</span>}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`flex items-center px-3 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                } ${isExpanded ? 'justify-start' : 'justify-center'}`}
                title={!isExpanded ? item.label : undefined}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                {isExpanded && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
                {isExpanded && item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <Separator />

        {/* Settings & Help Section */}
        <div className="p-2 space-y-1">
          <Link
            to="/configuracoes"
            className={`flex items-center px-3 py-3 rounded-lg transition-all ${
              isActive('/configuracoes')
                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            } ${isExpanded ? 'justify-start' : 'justify-center'}`}
            title={!isExpanded ? 'Configurações' : undefined}
          >
            <Settings className="h-5 w-5" />
            {isExpanded && <span className="ml-3 font-medium">Configurações</span>}
          </Link>

          <button
            onClick={() => window.open('https://docs.financeapp.com', '_blank')}
            className={`flex items-center w-full px-3 py-3 rounded-lg transition-all text-muted-foreground hover:bg-accent hover:text-foreground ${
              isExpanded ? 'justify-start' : 'justify-center'
            }`}
            title={!isExpanded ? 'Ajuda' : undefined}
          >
            <HelpCircle className="h-5 w-5" />
            {isExpanded && <span className="ml-3 font-medium">Ajuda</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-3 rounded-lg transition-all text-red-600 hover:bg-red-50 dark:hover:bg-red-950 ${
              isExpanded ? 'justify-start' : 'justify-center'
            }`}
            title={!isExpanded ? 'Sair' : undefined}
          >
            <LogOut className="h-5 w-5" />
            {isExpanded && <span className="ml-3 font-medium">Sair</span>}
          </button>
        </div>

        {/* Footer with Theme Toggle and Version */}
        <div className="p-4 border-t border-border space-y-3">
          <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
            <ThemeToggle />
          </div>
          {isExpanded && (
            <div className="text-center text-xs text-muted-foreground">
              v1.0.0
            </div>
          )}
        </div>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-20 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors"
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* Quick Actions Menu */}
      <QuickActionMenu
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onActionSelect={handleQuickAction}
      />
    </>
  )
}

import { Button } from "@/components/ui/button"
import { TrendingUp, Menu, X, User, LogOut, BarChart3, Settings, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/ThemeToggle"
import { BrandConfig, NavigationItem, UserMenuItem } from "@/types/configuration"
import { NotificationDropdown } from "@/components/NotificationDropdown"
import { useNotifications } from "@/contexts/NotificationContext"

export interface HeaderProps {
  brand?: BrandConfig
  navigationItems?: NavigationItem[]
  userMenuItems?: UserMenuItem[]
  showThemeToggle?: boolean
  mobileMenuEnabled?: boolean
  onNavigate?: (href: string) => void
  customActions?: {
    onLogin?: () => void
    onRegister?: () => void
    onLogout?: () => void
  }
}

export const Header = ({
  brand,
  navigationItems,
  userMenuItems,
  showThemeToggle = true,
  mobileMenuEnabled = true,
  onNavigate,
  customActions
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({})
  const userMenuRef = useRef<HTMLDivElement>(null)
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Notifications
  const { notifications, markAsRead, markAllAsRead, clearNotification } = useNotifications()

  // Default brand configuration
  const defaultBrand: BrandConfig = {
    name: 'FinanceServer',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#10b981'
    },
    urls: {
      website: '/',
      support: '/suporte',
      documentation: '/docs'
    }
  }

  // Default navigation items for authenticated users
  const defaultAuthenticatedNavigation: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      children: [
        { id: 'dashboard-main', label: 'Dashboard Principal', href: '/dashboard' },
        { id: 'dashboard-custom', label: 'Dashboard Customizável', href: '/dashboard/customizado' },
        { id: 'dashboard-specialized', label: 'Dashboards Especializados', href: '/dashboard/especializados' }
      ]
    },
    { id: 'transactions', label: 'Transações', href: '/transacoes' },
    { id: 'reports', label: 'Relatórios', href: '/relatorios' },
    { id: 'goals', label: 'Metas', href: '/metas' },
    { id: 'alerts', label: 'Alertas', href: '/alertas' },
    { id: 'calculators', label: 'Calculadoras', href: '/calculadoras' }
  ]

  // Default navigation items for unauthenticated users
  const defaultPublicNavigation: NavigationItem[] = [
    { id: 'about', label: 'Sobre', href: '/sobre' },
    { id: 'contact', label: 'Contato', href: '/contato' },
    { id: 'demo', label: 'Demonstração', href: '/demonstracao' }
  ]

  // Default user menu items
  const defaultUserMenuItems: UserMenuItem[] = [
    { id: 'settings', label: 'Configurações', href: '/configuracoes' },
    { id: 'divider', label: '', divider: true },
    { id: 'logout', label: 'Sair', action: 'logout' }
  ]

  // Use provided data or fallback to defaults
  const finalBrand = brand || defaultBrand
  const finalNavigation = navigationItems || (isAuthenticated ? defaultAuthenticatedNavigation : defaultPublicNavigation)
  const finalUserMenu = userMenuItems || defaultUserMenuItems

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)
  const toggleDropdown = (itemId: string) => {
    setDropdownStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href)
    } else {
      navigate(href)
    }
  }

  const handleLogout = () => {
    if (customActions?.onLogout) {
      customActions.onLogout()
    } else {
      logout()
      navigate('/')
    }
  }

  const handleUserMenuAction = (action: string) => {
    switch (action) {
      case 'logout':
        handleLogout()
        break
      case 'profile':
        handleNavigation('/perfil')
        break
      case 'settings':
        handleNavigation('/configuracoes')
        break
      case 'theme-toggle':
        // Theme toggle is handled by the ThemeToggle component
        break
    }
  }

  const handleNotificationClick = (notification: any) => {
    if (notification.actionUrl) {
      handleNavigation(notification.actionUrl)
    } else {
      // Navegar baseado no tipo de notificação
      switch (notification.type) {
        case 'transaction':
          handleNavigation('/transacoes')
          break
        case 'goal':
          handleNavigation('/metas')
          break
        case 'achievement':
          handleNavigation('/perfil')
          break
        case 'reminder':
          handleNavigation('/dashboard')
          break
        case 'system':
          handleNavigation('/configuracoes')
          break
        default:
          handleNavigation('/dashboard')
      }
    }
  }

  const isActiveRoute = (href: string) => {
    return location.pathname === href
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }

      // Close dropdowns when clicking outside
      Object.keys(dropdownStates).forEach(itemId => {
        const ref = dropdownRefs.current[itemId]
        if (ref && !ref.contains(event.target as Node)) {
          setDropdownStates(prev => ({ ...prev, [itemId]: false }))
        }
      })
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownStates])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
    setDropdownStates({})
  }, [location.pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            to={isAuthenticated ? "/dashboard" : (finalBrand.urls?.website || "/")}
            className="flex items-center space-x-2"
          >
            {finalBrand.logo ? (
              <img
                src={finalBrand.logo}
                alt={finalBrand.logoAlt || finalBrand.name}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{
                  background: `linear-gradient(to right, ${finalBrand.colors.primary}, ${finalBrand.colors.secondary})`
                }}
              >
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            )}
            <span
              className="text-2xl font-bold bg-clip-text text-transparent"
              style={{
                background: `linear-gradient(to right, ${finalBrand.colors.primary}, ${finalBrand.colors.secondary})`,
                WebkitBackgroundClip: 'text'
              }}
            >
              {finalBrand.name}
            </span>
          </Link>

          {isAuthenticated ? (
            <>
              <nav className="hidden md:flex items-center space-x-8">
                {finalNavigation.map((item) => {
                  if (item.roles && !item.roles.some(role => user?.roles?.includes(role))) {
                    return null
                  }

                  const isActive = isActiveRoute(item.href)

                  if (item.external) {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-muted-foreground hover:text-primary transition-colors font-medium ${
                          item.badge ? 'relative' : ''
                        }`}
                      >
                        {item.icon && <span className="mr-1">{item.icon}</span>}
                        {item.label}
                        {item.badge && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    )
                  }

                  // Navigation item with dropdown children
                  if (item.children && item.children.length > 0) {
                    const isDropdownOpen = dropdownStates[item.id]
                    const hasActiveChild = item.children.some(child => isActiveRoute(child.href))

                    return (
                      <div
                        key={item.id}
                        className="relative"
                        ref={(ref) => { dropdownRefs.current[item.id] = ref }}
                      >
                        <button
                          onClick={() => toggleDropdown(item.id)}
                          className={`flex items-center transition-colors font-medium ${
                            hasActiveChild || isActive
                              ? 'text-primary font-semibold'
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                        >
                          {item.icon && <span className="mr-1">{item.icon}</span>}
                          {item.label}
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                            isDropdownOpen ? 'rotate-180' : ''
                          }`} />
                          {item.badge && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute top-full left-0 mt-2 w-56 bg-popover rounded-lg shadow-lg border border-border py-2 z-50">
                            {item.children.map((child) => {
                              const isChildActive = isActiveRoute(child.href)

                              if (child.external) {
                                return (
                                  <a
                                    key={child.id}
                                    href={child.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
                                  >
                                    {child.icon && <span className="mr-3">{child.icon}</span>}
                                    {child.label}
                                  </a>
                                )
                              }

                              return (
                                <Link
                                  key={child.id}
                                  to={child.href}
                                  onClick={() => {
                                    handleNavigation(child.href)
                                    setDropdownStates(prev => ({ ...prev, [item.id]: false }))
                                  }}
                                  className={`flex items-center px-4 py-2 text-sm transition-colors ${
                                    isChildActive
                                      ? 'text-primary bg-accent font-medium'
                                      : 'text-popover-foreground hover:bg-accent'
                                  }`}
                                >
                                  {child.icon && <span className="mr-3">{child.icon}</span>}
                                  {child.label}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  }

                  // Regular navigation item
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={`transition-colors font-medium relative ${
                        isActive
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground hover:text-primary'
                      } ${item.badge ? 'relative' : ''}`}
                    >
                      {item.icon && <span className="mr-1">{item.icon}</span>}
                      {item.label}
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>

              <div className="hidden md:flex items-center space-x-4">
                {showThemeToggle && <ThemeToggle />}
                {isAuthenticated && (
                  <NotificationDropdown
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onClearNotification={clearNotification}
                    onNotificationClick={handleNotificationClick}
                  />
                )}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(to right, ${finalBrand.colors.primary}, ${finalBrand.colors.secondary})`
                        }}
                      >
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-foreground font-medium">{user?.name?.split(' ')[0]}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-popover rounded-lg shadow-lg border border-border py-2">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-popover-foreground">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      {finalUserMenu.map((menuItem) => {
                        if (menuItem.divider) {
                          return <div key={menuItem.id} className="border-t border-border my-2" />
                        }

                        if (menuItem.action) {
                          return (
                            <button
                              key={menuItem.id}
                              onClick={() => handleUserMenuAction(menuItem.action!)}
                              className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                                menuItem.action === 'logout'
                                  ? 'text-destructive hover:bg-destructive/10'
                                  : 'text-popover-foreground hover:bg-accent'
                              }`}
                            >
                              {menuItem.icon && <span className="mr-3">{menuItem.icon}</span>}
                              {menuItem.label}
                            </button>
                          )
                        }

                        return (
                          <Link
                            key={menuItem.id}
                            to={menuItem.href!}
                            onClick={() => handleNavigation(menuItem.href!)}
                            className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
                          >
                            {menuItem.icon && <span className="mr-3">{menuItem.icon}</span>}
                            {menuItem.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <nav className="hidden md:flex items-center space-x-8">
                {finalNavigation.map((item) => {
                  const isActive = isActiveRoute(item.href)

                  if (item.external) {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-muted-foreground hover:text-primary transition-colors font-medium ${
                          item.badge ? 'relative' : ''
                        }`}
                      >
                        {item.icon && <span className="mr-1">{item.icon}</span>}
                        {item.label}
                        {item.badge && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    )
                  }

                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={`transition-colors font-medium ${
                        isActive
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {item.icon && <span className="mr-1">{item.icon}</span>}
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="hidden md:flex items-center space-x-4">
                {showThemeToggle && <ThemeToggle />}
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => customActions?.onLogin?.()}
                  >
                    Entrar
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    className="text-white"
                    style={{
                      background: `linear-gradient(to right, ${finalBrand.colors.primary}, ${finalBrand.colors.secondary})`
                    }}
                    onClick={() => customActions?.onRegister?.()}
                  >
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </>
          )}

          {mobileMenuEnabled && (
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-muted-foreground hover:text-primary"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>

        {isMenuOpen && mobileMenuEnabled && (
          <div className="md:hidden mt-4 py-4 border-t border-border">
            {isAuthenticated ? (
              <nav className="flex flex-col space-y-4">
                {finalNavigation.map((item) => {
                  if (item.roles && !item.roles.some(role => user?.roles?.includes(role))) {
                    return null
                  }

                  const isActive = isActiveRoute(item.href)

                  if (item.external) {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-muted-foreground hover:text-primary transition-colors font-medium ${
                          item.badge ? 'relative' : ''
                        }`}
                      >
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        {item.label}
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    )
                  }

                  // Mobile menu children handling
                  if (item.children && item.children.length > 0) {
                    const hasActiveChild = item.children.some(child => isActiveRoute(child.href))

                    return (
                      <div key={item.id} className="space-y-2">
                        <div className={`flex items-center font-medium ${
                          hasActiveChild || isActive
                            ? 'text-primary font-semibold'
                            : 'text-muted-foreground'
                        }`}>
                          {item.icon && <span className="mr-2">{item.icon}</span>}
                          {item.label}
                        </div>
                        <div className="ml-6 space-y-2">
                          {item.children.map((child) => {
                            const isChildActive = isActiveRoute(child.href)

                            if (child.external) {
                              return (
                                <a
                                  key={child.id}
                                  href={child.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                  {child.icon && <span className="mr-2">{child.icon}</span>}
                                  {child.label}
                                </a>
                              )
                            }

                            return (
                              <Link
                                key={child.id}
                                to={child.href}
                                onClick={() => handleNavigation(child.href)}
                                className={`flex items-center text-sm transition-colors ${
                                  isChildActive
                                    ? 'text-primary font-medium'
                                    : 'text-muted-foreground hover:text-primary'
                                }`}
                              >
                                {child.icon && <span className="mr-2">{child.icon}</span>}
                                {child.label}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={`transition-colors font-medium ${
                        isActive
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </Link>
                  )
                })}
                <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 px-2 py-2">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(to right, ${finalBrand.colors.primary}, ${finalBrand.colors.secondary})`
                        }}
                      >
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  {finalUserMenu.map((menuItem) => {
                    if (menuItem.divider) {
                      return <div key={menuItem.id} className="border-t border-border my-2" />
                    }

                    if (menuItem.action) {
                      return (
                        <Button
                          key={menuItem.id}
                          onClick={() => handleUserMenuAction(menuItem.action!)}
                          variant="ghost"
                          className={`w-full justify-start ${
                            menuItem.action === 'logout'
                              ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                        >
                          {menuItem.icon && <span className="mr-2">{menuItem.icon}</span>}
                          {menuItem.label}
                        </Button>
                      )
                    }

                    return (
                      <Link key={menuItem.id} to={menuItem.href!}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-muted-foreground hover:text-primary"
                          onClick={() => handleNavigation(menuItem.href!)}
                        >
                          {menuItem.icon && <span className="mr-2">{menuItem.icon}</span>}
                          {menuItem.label}
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              </nav>
            ) : (
              <nav className="flex flex-col space-y-4">
                {finalNavigation.map((item) => {
                  const isActive = isActiveRoute(item.href)

                  if (item.external) {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors font-medium"
                      >
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        {item.label}
                      </a>
                    )
                  }

                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={`transition-colors font-medium ${
                        isActive
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </Link>
                  )
                })}
                <div className="flex flex-col space-y-2 pt-4">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-primary justify-start"
                      onClick={() => customActions?.onLogin?.()}
                    >
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      className="w-full text-white"
                      style={{
                        background: `linear-gradient(to right, ${finalBrand.colors.primary}, ${finalBrand.colors.secondary})`
                      }}
                      onClick={() => customActions?.onRegister?.()}
                    >
                      Começar Grátis
                    </Button>
                  </Link>
                </div>
              </nav>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

/*
EXEMPLO DE USO AVANÇADO COM MICROSERVIÇOS:

// 1. Uso básico (mantém compatibilidade)
<Header />

// 2. Uso com configuração personalizada de marca
const customBrand: BrandConfig = {
  name: 'MinhaEmpresa Financeiro',
  logo: '/logo-empresa.png',
  logoAlt: 'Logo da Minha Empresa',
  colors: {
    primary: '#1e40af',
    secondary: '#7c3aed',
    accent: '#059669'
  },
  urls: {
    website: 'https://minhaempresa.com',
    support: 'https://suporte.minhaempresa.com',
    documentation: 'https://docs.minhaempresa.com'
  }
}

<Header brand={customBrand} />

// 3. Navegação personalizada com dados do microserviço
const navigationFromAPI: NavigationItem[] = [
  { id: 'dashboard', label: 'Painel', href: '/painel', icon: '📊' },
  { id: 'transactions', label: 'Movimentações', href: '/movimentacoes', icon: '💰', badge: '3' },
  { id: 'reports', label: 'Análises', href: '/analises', icon: '📈' },
  { id: 'goals', label: 'Objetivos', href: '/objetivos', icon: '🎯' },
  { id: 'external', label: 'Blog', href: 'https://blog.empresa.com', external: true, icon: '📝' }
]

const userMenuFromAPI: UserMenuItem[] = [
  { id: 'profile', label: 'Meu Perfil', href: '/meu-perfil', icon: '👤' },
  { id: 'billing', label: 'Faturamento', href: '/faturamento', icon: '💳' },
  { id: 'divider', label: '', divider: true },
  { id: 'settings', label: 'Configurações', href: '/config', icon: '⚙️' },
  { id: 'logout', label: 'Sair', action: 'logout', icon: '🚪' }
]

<Header
  brand={customBrand}
  navigationItems={navigationFromAPI}
  userMenuItems={userMenuFromAPI}
  showThemeToggle={true}
  mobileMenuEnabled={true}
  onNavigate={(href) => {
    console.log('Navegando para:', href)
    // Lógica personalizada de navegação
  }}
  customActions={{
    onLogin: () => {
      console.log('Login personalizado')
      // Lógica personalizada de login
    },
    onRegister: () => {
      console.log('Registro personalizado')
      // Lógica personalizada de registro
    },
    onLogout: () => {
      console.log('Logout personalizado')
      // Lógica personalizada de logout
    }
  }}
/>

// 4. Configuração com controle de acesso por função
const navigationWithRoles: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { id: 'users', label: 'Usuários', href: '/usuarios', icon: '👥', roles: ['admin'] },
  { id: 'reports', label: 'Relatórios', href: '/relatorios', icon: '📈', roles: ['admin', 'manager'] },
  { id: 'transactions', label: 'Transações', href: '/transacoes', icon: '💰' }
]

<Header
  navigationItems={navigationWithRoles}
  // Só mostra itens se o usuário tem as funções necessárias
/>

// 5. Configuração mínima para landing page
<Header
  navigationItems={[
    { id: 'about', label: 'Sobre', href: '/sobre' },
    { id: 'pricing', label: 'Preços', href: '/precos' },
    { id: 'contact', label: 'Contato', href: '/contato' }
  ]}
  showThemeToggle={false}
  mobileMenuEnabled={true}
/>

// 6. Configuração empresarial completa
<Header
  brand={{
    name: 'Enterprise Finance',
    logo: '/enterprise-logo.svg',
    colors: {
      primary: '#0f172a',
      secondary: '#334155',
      accent: '#0ea5e9'
    },
    urls: {
      website: 'https://enterprise.finance.com',
      support: 'https://support.enterprise.finance.com'
    }
  }}
  navigationItems={[
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', href: '/analytics', icon: '📈', roles: ['analyst', 'admin'] },
    { id: 'compliance', label: 'Compliance', href: '/compliance', icon: '⚖️', roles: ['compliance', 'admin'] },
    { id: 'audit', label: 'Auditoria', href: '/auditoria', icon: '🔍', roles: ['auditor', 'admin'] }
  ]}
  userMenuItems={[
    { id: 'profile', label: 'Profile', href: '/profile', icon: '👤' },
    { id: 'admin', label: 'Admin Panel', href: '/admin', icon: '⚙️', roles: ['admin'] },
    { id: 'divider', label: '', divider: true },
    { id: 'logout', label: 'Sign Out', action: 'logout', icon: '🚪' }
  ]}
  showThemeToggle={true}
  mobileMenuEnabled={true}
/>
*/
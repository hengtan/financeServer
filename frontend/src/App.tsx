import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { SecurityProvider } from '@/contexts/SecurityContext'
import { DashboardRefreshProvider } from '@/contexts/DashboardRefreshContext'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Toaster } from '@/components/ui/toaster'
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcutsProvider'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { DemoPage } from '@/pages/DemoPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { NewDashboardPage } from '@/pages/NewDashboardPage'
import { FeaturesPage } from '@/pages/FeaturesPage'
import { PricingPage } from '@/pages/PricingPage'
import { IntegrationsPage } from '@/pages/IntegrationsPage'
import { BlogPage } from '@/pages/BlogPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { GoalsPage } from '@/pages/GoalsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { CustomDashboardPage } from '@/pages/CustomDashboardPage'
import { MultiDashboardPage } from '@/pages/MultiDashboardPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { CalculatorsPage } from '@/pages/CalculatorsPage'
import { AccountsPage } from '@/pages/AccountsPage'
import { CardsPage } from '@/pages/CardsPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>
}

const AppLayout = ({ children, showFooter = true, showSidebar = false }: { children: React.ReactNode, showFooter?: boolean, showSidebar?: boolean }) => {
  const { isAuthenticated } = useAuth()
  const useSidebar = showSidebar && isAuthenticated

  return (
    <div className="min-h-screen">
      {useSidebar ? (
        <>
          <Sidebar />
          <main className="ml-20 transition-all duration-300">{children}</main>
        </>
      ) : (
        <>
          <Header />
          <main>{children}</main>
          {showFooter && <Footer />}
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <SecurityProvider>
          <NotificationProvider>
            <DashboardRefreshProvider>
              <Router>
                <KeyboardShortcutsProvider>
                  <ScrollToTop />
          <Routes>
          <Route path="/" element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          } />

          <Route path="/sobre" element={
            <AppLayout>
              <AboutPage />
            </AppLayout>
          } />

          <Route path="/contato" element={
            <AppLayout>
              <ContactPage />
            </AppLayout>
          } />

          <Route path="/demonstracao" element={
            <AppLayout>
              <DemoPage />
            </AppLayout>
          } />

          <Route path="/funcionalidades" element={
            <AppLayout>
              <FeaturesPage />
            </AppLayout>
          } />

          <Route path="/precos" element={
            <AppLayout>
              <PricingPage />
            </AppLayout>
          } />

          <Route path="/integracoes" element={
            <AppLayout>
              <IntegrationsPage />
            </AppLayout>
          } />

          <Route path="/blog" element={
            <AppLayout>
              <BlogPage />
            </AppLayout>
          } />

          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />

          <Route path="/cadastro" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <NewDashboardPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/customizado" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <CustomDashboardPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/especializados" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <MultiDashboardPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/contas" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <AccountsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/cartoes" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <CardsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/transacoes" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <TransactionsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/relatorios" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <ReportsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/metas" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <GoalsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/perfil" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/notificacoes" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <NotificationsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/alertas" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <AlertsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/calculadoras" element={
            <ProtectedRoute>
              <AppLayout showFooter={false} showSidebar={true}>
                <CalculatorsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                  <Toaster />
                </KeyboardShortcutsProvider>
              </Router>
            </DashboardRefreshProvider>
          </NotificationProvider>
        </SecurityProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
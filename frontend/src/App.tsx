import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { SecurityProvider } from '@/contexts/SecurityContext'
import { Header } from '@/components/Header'
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
import { DashboardPageWrapper } from '@/pages/DashboardPageWrapper'
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>
}

const AppLayout = ({ children, showFooter = true }: { children: React.ReactNode, showFooter?: boolean }) => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <SecurityProvider>
          <NotificationProvider>
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
              <AppLayout showFooter={false}>
                <DashboardPageWrapper />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/customizado" element={
            <ProtectedRoute>
              <AppLayout showFooter={false}>
                <CustomDashboardPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/especializados" element={
            <ProtectedRoute>
              <AppLayout showFooter={false}>
                <MultiDashboardPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/transacoes" element={
            <ProtectedRoute>
              <AppLayout showFooter={false}>
                <TransactionsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/relatorios" element={
            <ProtectedRoute>
              <AppLayout showFooter={false}>
                <ReportsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/metas" element={
            <ProtectedRoute>
              <AppLayout showFooter={false}>
                <GoalsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <AppLayout showFooter={false}>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/perfil" element={
            <ProtectedRoute>
              <AppLayout showFooter={false}>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/notificacoes" element={
            <ProtectedRoute>
              <AppLayout showFooter={false}>
                <NotificationsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/alertas" element={
            <ProtectedRoute>
              <AppLayout showFooter={false}>
                <AlertsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/calculadoras" element={
            <ProtectedRoute>
              <AppLayout showFooter={false}>
                <CalculatorsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <Toaster />
              </KeyboardShortcutsProvider>
            </Router>
          </NotificationProvider>
        </SecurityProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
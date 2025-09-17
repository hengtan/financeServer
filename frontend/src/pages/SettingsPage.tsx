import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useSecurity } from '@/contexts/SecurityContext'
import { TwoFactorSetup } from '@/components/TwoFactorSetup'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertTriangle
} from 'lucide-react'

export interface SettingsPageProps {
  onSave?: (settings: any) => void
  onExportData?: () => void
  onImportData?: (file: File) => void
  onDeleteAccount?: () => void
}

export const SettingsPage = ({
  onSave,
  onExportData,
  onImportData,
  onDeleteAccount
}: SettingsPageProps) => {
  usePageTitle('Configurações')

  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { twoFactorSettings, updateTwoFactorSettings } = useSecurity()

  const [showPassword, setShowPassword] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [settings, setSettings] = useState({
    // Perfil
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    avatar: user?.avatar || '',
    bio: '',

    // Notificações
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    goalAlerts: true,
    transactionAlerts: true,
    securityAlerts: true,

    // Aparência
    theme: theme,
    language: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'pt-BR',

    // Privacidade e Segurança
    twoFactorAuth: false,
    loginNotifications: true,
    dataVisibility: 'private',
    sessionTimeout: 30,

    // Financeiro
    defaultAccount: '',
    defaultCategory: '',
    autoCategories: true,
    budgetAlerts: true,
    expenseTracking: true
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    if (onSave) {
      onSave(settings)
    }
    // Aplicar tema imediatamente
    if (settings.theme !== theme) {
      setTheme(settings.theme as any)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImportData) {
      onImportData(file)
    }
  }

  return (
    <>
      {show2FASetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <TwoFactorSetup
            onComplete={() => setShow2FASetup(false)}
            onCancel={() => setShow2FASetup(false)}
          />
        </div>
      )}

      <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-full lg:max-w-2xl">
            <TabsTrigger value="profile" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">Notificações</span>
              <span className="inline md:hidden">Notif.</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">Aparência</span>
              <span className="inline md:hidden">Tema</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
          </TabsList>

          {/* Perfil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={settings.avatar} alt={settings.name} />
                    <AvatarFallback className="text-lg">
                      {settings.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Foto do Perfil</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => handleSettingChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => handleSettingChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={settings.bio}
                    onChange={(e) => handleSettingChange('bio', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent resize-none h-20"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações Financeiras</CardTitle>
                <CardDescription>
                  Configure suas preferências financeiras padrão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Conta Padrão</Label>
                    <Select value={settings.defaultAccount} onValueChange={(value) => handleSettingChange('defaultAccount', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Conta Corrente</SelectItem>
                        <SelectItem value="savings">Conta Poupança</SelectItem>
                        <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria Padrão</Label>
                    <Select value={settings.defaultCategory} onValueChange={(value) => handleSettingChange('defaultCategory', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Alimentação</SelectItem>
                        <SelectItem value="transport">Transporte</SelectItem>
                        <SelectItem value="entertainment">Entretenimento</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Categorização Automática</Label>
                      <p className="text-sm text-muted-foreground">
                        Detectar automaticamente a categoria das transações
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoCategories}
                      onCheckedChange={(checked) => handleSettingChange('autoCategories', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Alertas de Orçamento</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações quando ultrapassar o orçamento
                      </p>
                    </div>
                    <Switch
                      checked={settings.budgetAlerts}
                      onCheckedChange={(checked) => handleSettingChange('budgetAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rastreamento de Gastos</Label>
                      <p className="text-sm text-muted-foreground">
                        Monitorar padrões de gastos e tendências
                      </p>
                    </div>
                    <Switch
                      checked={settings.expenseTracking}
                      onCheckedChange={(checked) => handleSettingChange('expenseTracking', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure como e quando você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações importantes por email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações instantâneas no navegador
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Tipos de Notificação</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Relatórios Semanais</Label>
                        <p className="text-sm text-muted-foreground">
                          Resumo semanal das suas finanças
                        </p>
                      </div>
                      <Switch
                        checked={settings.weeklyReports}
                        onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de Metas</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificações sobre progresso das metas
                        </p>
                      </div>
                      <Switch
                        checked={settings.goalAlerts}
                        onCheckedChange={(checked) => handleSettingChange('goalAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de Transação</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificações sobre transações importantes
                        </p>
                      </div>
                      <Switch
                        checked={settings.transactionAlerts}
                        onCheckedChange={(checked) => handleSettingChange('transactionAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de Segurança</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificações sobre atividades de segurança
                        </p>
                      </div>
                      <Switch
                        checked={settings.securityAlerts}
                        onCheckedChange={(checked) => handleSettingChange('securityAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aparência */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalização da Interface</CardTitle>
                <CardDescription>
                  Configure a aparência e o idioma da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tema</Label>
                    <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Formato de Data</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange('dateFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                        <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Prévia</h4>
                  <div className="space-y-2 text-sm">
                    <p>Data: {new Date().toLocaleDateString(settings.language === 'pt-BR' ? 'pt-BR' : settings.language === 'en-US' ? 'en-US' : 'es-ES')}</p>
                    <p>Valor: {new Intl.NumberFormat(settings.language === 'pt-BR' ? 'pt-BR' : settings.language === 'en-US' ? 'en-US' : 'es-ES', {
                      style: 'currency',
                      currency: settings.currency
                    }).format(1234.56)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Senha e Autenticação</CardTitle>
                <CardDescription>
                  Gerencie sua senha e configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Digite sua nova senha"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirme sua nova senha"
                    />
                  </div>
                  <Button className="w-full md:w-auto">
                    Alterar Senha
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Autenticação de Dois Fatores</Label>
                        <p className="text-sm text-muted-foreground">
                          {twoFactorSettings.enabled
                            ? `Configurado via ${twoFactorSettings.method === 'authenticator' ? 'App Autenticador' : twoFactorSettings.method === 'sms' ? 'SMS' : 'Email'}`
                            : 'Adicione uma camada extra de segurança à sua conta'
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {twoFactorSettings.enabled ? (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <Shield className="h-3 w-3 mr-1" />
                              Ativo
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateTwoFactorSettings({ enabled: false })}
                            >
                              Desativar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShow2FASetup(true)}
                          >
                            Configurar 2FA
                          </Button>
                        )}
                      </div>
                    </div>

                    {twoFactorSettings.enabled && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Sua conta está protegida
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Método: {twoFactorSettings.method === 'authenticator' ? 'App Autenticador' :
                                      twoFactorSettings.method === 'sms' ? `SMS (${twoFactorSettings.phone})` :
                                      `Email (${twoFactorSettings.email})`}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {twoFactorSettings.backupCodes?.length || 0} códigos de backup disponíveis
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações de Login</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber alertas sobre novos logins
                      </p>
                    </div>
                    <Switch
                      checked={settings.loginNotifications}
                      onCheckedChange={(checked) => handleSettingChange('loginNotifications', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Visibilidade dos Dados</Label>
                    <Select value={settings.dataVisibility} onValueChange={(value) => handleSettingChange('dataVisibility', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Privado</SelectItem>
                        <SelectItem value="friends">Amigos</SelectItem>
                        <SelectItem value="public">Público</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeout da Sessão (minutos)</Label>
                    <Select value={settings.sessionTimeout.toString()} onValueChange={(value) => handleSettingChange('sessionTimeout', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dados */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Dados</CardTitle>
                <CardDescription>
                  Exportar, importar ou excluir seus dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Exportar Dados</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Baixe uma cópia de todos os seus dados em formato JSON
                    </p>
                    <Button onClick={onExportData} className="w-full md:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Dados
                    </Button>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Importar Dados</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Importe dados de um backup anterior
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="w-full md:w-auto"
                      />
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-destructive">Zona de Perigo</h4>
                      <p className="text-sm text-muted-foreground">
                        Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={onDeleteAccount}
                        className="mt-2"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Conta
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>
      </div>
    </>
  )
}
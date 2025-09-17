import React, { useState } from 'react'
import { Shield, Smartphone, Mail, Key, Copy, Check, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useSecurity } from '@/contexts/SecurityContext'

interface TwoFactorSetupProps {
  onComplete: () => void
  onCancel: () => void
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete, onCancel }) => {
  const {
    twoFactorSettings,
    updateTwoFactorSettings,
    generateBackupCodes,
    generateTOTPSecret,
    verifyTOTPCode,
    sendVerificationCode,
    verifyCode
  } = useSecurity()

  const [currentStep, setCurrentStep] = useState<'method' | 'setup' | 'verify' | 'backup'>('method')
  const [selectedMethod, setSelectedMethod] = useState<'sms' | 'email' | 'authenticator'>('authenticator')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [secret, setSecret] = useState('')
  const [copiedCodes, setCopiedCodes] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleMethodSelect = (method: 'sms' | 'email' | 'authenticator') => {
    setSelectedMethod(method)
    setCurrentStep('setup')

    if (method === 'authenticator') {
      const newSecret = generateTOTPSecret()
      setSecret(newSecret)
    }
  }

  const handleSetupComplete = async () => {
    setCurrentStep('verify')

    if (selectedMethod === 'sms' || selectedMethod === 'email') {
      await sendVerificationCode(selectedMethod)
    }
  }

  const handleVerification = async () => {
    setIsVerifying(true)

    let isValid = false

    if (selectedMethod === 'authenticator') {
      isValid = verifyTOTPCode(verificationCode, secret)
    } else {
      isValid = verifyCode(verificationCode)
    }

    if (isValid) {
      const codes = generateBackupCodes()
      setBackupCodes(codes)

      updateTwoFactorSettings({
        enabled: true,
        method: selectedMethod,
        phone: selectedMethod === 'sms' ? phoneNumber : undefined,
        email: selectedMethod === 'email' ? email : undefined,
        secret: selectedMethod === 'authenticator' ? secret : undefined,
        backupCodes: codes
      })

      setCurrentStep('backup')
    } else {
      alert('Código incorreto. Tente novamente.')
    }

    setIsVerifying(false)
  }

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <Shield className="h-12 w-12 text-blue-600 mx-auto" />
        <h3 className="text-lg font-semibold">Configurar Autenticação de Dois Fatores</h3>
        <p className="text-sm text-muted-foreground">
          Escolha um método para adicionar uma camada extra de segurança à sua conta
        </p>
      </div>

      <div className="grid gap-4">
        <Card
          className={`cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 ${
            selectedMethod === 'authenticator' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleMethodSelect('authenticator')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Key className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">App Autenticador</h4>
                <p className="text-sm text-muted-foreground">
                  Use Google Authenticator, Authy ou similar
                </p>
              </div>
              <Badge variant="secondary">Recomendado</Badge>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 ${
            selectedMethod === 'sms' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleMethodSelect('sms')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">SMS</h4>
                <p className="text-sm text-muted-foreground">
                  Receba códigos via mensagem de texto
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 ${
            selectedMethod === 'email' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleMethodSelect('email')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-sm text-muted-foreground">
                  Receba códigos no seu email
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSetup = () => (
    <div className="space-y-6">
      {selectedMethod === 'authenticator' && (
        <div className="text-center space-y-4">
          <QrCode className="h-16 w-16 text-blue-600 mx-auto" />
          <h3 className="text-lg font-semibold">Configure seu App Autenticador</h3>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm mb-2">1. Abra seu app autenticador</p>
            <p className="text-sm mb-2">2. Escaneie o QR Code ou insira manualmente:</p>
            <div className="bg-background p-2 rounded border font-mono text-sm break-all">
              {secret}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Apps recomendados:</p>
            <p>• Google Authenticator</p>
            <p>• Microsoft Authenticator</p>
            <p>• Authy</p>
          </div>
        </div>
      )}

      {selectedMethod === 'sms' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Configure SMS</h3>
          <div className="space-y-2">
            <Label htmlFor="phone">Número de Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+55 11 99999-9999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>
      )}

      {selectedMethod === 'email' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Configure Email</h3>
          <div className="space-y-2">
            <Label htmlFor="email">Email para Verificação</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      )}

      <Button onClick={handleSetupComplete} className="w-full">
        Continuar
      </Button>
    </div>
  )

  const renderVerification = () => (
    <div className="space-y-6 text-center">
      <div>
        <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Verificar Configuração</h3>
        <p className="text-sm text-muted-foreground">
          {selectedMethod === 'authenticator'
            ? 'Digite o código de 6 dígitos do seu app autenticador'
            : `Digite o código que enviamos para ${selectedMethod === 'sms' ? 'seu telefone' : 'seu email'}`
          }
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="verification">Código de Verificação</Label>
        <Input
          id="verification"
          type="text"
          placeholder="000000"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          maxLength={6}
          className="text-center text-xl tracking-widest"
        />
      </div>

      <Button
        onClick={handleVerification}
        disabled={verificationCode.length !== 6 || isVerifying}
        className="w-full"
      >
        {isVerifying ? 'Verificando...' : 'Verificar Código'}
      </Button>

      {selectedMethod !== 'authenticator' && (
        <Button
          variant="outline"
          onClick={() => sendVerificationCode(selectedMethod)}
          className="w-full"
        >
          Reenviar Código
        </Button>
      )}
    </div>
  )

  const renderBackupCodes = () => (
    <div className="space-y-6 text-center">
      <div>
        <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">2FA Configurado com Sucesso!</h3>
        <p className="text-sm text-muted-foreground">
          Salve estes códigos de backup em um local seguro
        </p>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
          {backupCodes.map((code, index) => (
            <div key={index} className="bg-background p-2 rounded text-center">
              {code}
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={copyBackupCodes}
        className="w-full"
      >
        {copiedCodes ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Códigos Copiados
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Códigos
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>⚠️ Estes códigos só podem ser usados uma vez cada</p>
        <p>💾 Guarde-os em um local seguro, como um gerenciador de senhas</p>
        <p>🔄 Use-os apenas se não conseguir acessar seu método principal</p>
      </div>

      <Button onClick={onComplete} className="w-full">
        Finalizar Configuração
      </Button>
    </div>
  )

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        {currentStep === 'method' && renderMethodSelection()}
        {currentStep === 'setup' && renderSetup()}
        {currentStep === 'verify' && renderVerification()}
        {currentStep === 'backup' && renderBackupCodes()}

        {currentStep !== 'backup' && (
          <div className="mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
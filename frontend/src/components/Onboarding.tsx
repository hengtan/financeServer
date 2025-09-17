import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, ArrowLeft, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'scroll' | 'wait'
  actionDelay?: number
  skipable?: boolean
  icon?: React.ReactNode
  content?: React.ReactNode
}

interface OnboardingProps {
  steps: OnboardingStep[]
  isVisible: boolean
  onComplete: () => void
  onSkip: () => void
  onStepComplete?: (step: OnboardingStep, stepIndex: number) => void
  theme?: 'light' | 'dark' | 'auto'
  showProgress?: boolean
  allowSkipSteps?: boolean
}

export function Onboarding({
  steps,
  isVisible,
  onComplete,
  onSkip,
  onStepComplete,
  theme = 'auto',
  showProgress = true,
  allowSkipSteps = true,
}: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  useEffect(() => {
    if (!isVisible || !currentStepData?.target) return

    const findTarget = () => {
      const element = document.querySelector(currentStepData.target!) as HTMLElement
      if (element) {
        setTargetElement(element)
        positionTooltip(element)
        highlightElement(element)
      }
    }

    // Aguarda um pouco para garantir que o DOM está pronto
    const timeout = setTimeout(findTarget, 100)

    // Re-posiciona quando a janela muda de tamanho
    const handleResize = () => {
      if (targetElement) {
        positionTooltip(targetElement)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', handleResize)
      if (targetElement) {
        unhighlightElement(targetElement)
      }
    }
  }, [currentStep, isVisible, currentStepData, targetElement])

  const positionTooltip = (element: HTMLElement) => {
    if (!tooltipRef.current) return

    const rect = element.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = 0
    let left = 0

    const position = currentStepData?.position || 'bottom'

    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 20
        left = rect.left + (rect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = rect.bottom + 20
        left = rect.left + (rect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2
        left = rect.left - tooltipRect.width - 20
        break
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2
        left = rect.right + 20
        break
      case 'center':
        top = (viewportHeight - tooltipRect.height) / 2
        left = (viewportWidth - tooltipRect.width) / 2
        break
    }

    // Ajusta se sair da viewport
    if (left < 10) left = 10
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10
    }
    if (top < 10) top = 10
    if (top + tooltipRect.height > viewportHeight - 10) {
      top = viewportHeight - tooltipRect.height - 10
    }

    setTooltipPosition({ top, left })
  }

  const highlightElement = (element: HTMLElement) => {
    element.style.position = 'relative'
    element.style.zIndex = '10001'
    element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2)'
    element.style.borderRadius = '8px'
    element.style.transition = 'all 0.3s ease'
    element.classList.add('onboarding-highlighted')
  }

  const unhighlightElement = (element: HTMLElement) => {
    element.style.zIndex = ''
    element.style.boxShadow = ''
    element.style.borderRadius = ''
    element.classList.remove('onboarding-highlighted')
  }

  const handleNext = () => {
    if (targetElement) {
      unhighlightElement(targetElement)
    }

    const stepCompleted = currentStepData.id
    setCompletedSteps(prev => [...prev, stepCompleted])
    onStepComplete?.(currentStepData, currentStep)

    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      if (targetElement) {
        unhighlightElement(targetElement)
      }
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkipStep = () => {
    if (allowSkipSteps) {
      handleNext()
    }
  }

  const handleClose = () => {
    if (targetElement) {
      unhighlightElement(targetElement)
    }
    onSkip()
  }

  if (!isVisible || !currentStepData) return null

  return (
    <>
      {/* Overlay escuro */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-[10000] transition-opacity duration-300"
        onClick={currentStepData.target ? undefined : handleClose}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10001] transition-all duration-300 animate-fadeIn"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <Card className="w-80 max-w-sm shadow-2xl border-primary/20">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {currentStepData.icon || <Lightbulb className="h-5 w-5 text-primary" />}
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {currentStepData.title}
                  </h3>
                  {showProgress && (
                    <div className="text-sm text-muted-foreground">
                      {currentStep + 1} de {steps.length}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            {showProgress && (
              <div className="mb-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="mb-6">
              <p className="text-muted-foreground mb-4">
                {currentStepData.description}
              </p>
              {currentStepData.content && (
                <div className="mb-4">
                  {currentStepData.content}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                  </Button>
                )}
                {allowSkipSteps && !isLastStep && currentStepData.skipable !== false && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkipStep}
                  >
                    Pular
                  </Button>
                )}
              </div>

              <Button
                onClick={handleNext}
                size="sm"
                className="ml-auto"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Concluir
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Hook para gerenciar onboarding
export function useOnboarding(steps: OnboardingStep[]) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  useEffect(() => {
    // Verifica se já completou o onboarding
    const completed = localStorage.getItem('onboarding-completed')
    if (completed) {
      setHasCompletedOnboarding(true)
    }
  }, [])

  const startOnboarding = () => {
    setIsVisible(true)
  }

  const completeOnboarding = () => {
    setIsVisible(false)
    setHasCompletedOnboarding(true)
    localStorage.setItem('onboarding-completed', 'true')
  }

  const skipOnboarding = () => {
    setIsVisible(false)
    setHasCompletedOnboarding(true)
    localStorage.setItem('onboarding-completed', 'true')
  }

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false)
    localStorage.removeItem('onboarding-completed')
  }

  return {
    isVisible,
    hasCompletedOnboarding,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  }
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calculator, RotateCcw, Download, Share2, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CalculatorField {
  id: string
  label: string
  type: 'number' | 'percentage' | 'currency' | 'years' | 'months'
  value: number
  min?: number
  max?: number
  step?: number
  suffix?: string
  required?: boolean
  description?: string
}

export interface CalculatorResult {
  label: string
  value: number
  format: 'currency' | 'percentage' | 'number' | 'years' | 'months'
  highlight?: boolean
  description?: string
}

export interface CalculatorProps {
  title: string
  description: string
  icon?: React.ReactNode
  fields: CalculatorField[]
  results: CalculatorResult[]
  onFieldChange: (fieldId: string, value: number) => void
  onCalculate: () => void
  onReset: () => void
  isCalculating?: boolean
  className?: string
  tips?: string[]
  chartComponent?: React.ReactNode
}

const formatValue = (value: number, format: string, suffix?: string): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    case 'percentage':
      return `${value.toFixed(2)}%`
    case 'years':
      return `${Math.floor(value)} ano${Math.floor(value) !== 1 ? 's' : ''}`
    case 'months':
      return `${Math.floor(value)} mês${Math.floor(value) !== 1 ? 'es' : ''}`
    case 'number':
    default:
      return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + (suffix || '')
  }
}

const getFieldSuffix = (type: string): string => {
  switch (type) {
    case 'percentage':
      return '%'
    case 'currency':
      return 'R$'
    case 'years':
      return 'anos'
    case 'months':
      return 'meses'
    default:
      return ''
  }
}

export function CalculatorBase({
  title,
  description,
  icon,
  fields,
  results,
  onFieldChange,
  onCalculate,
  onReset,
  isCalculating = false,
  className,
  tips,
  chartComponent
}: CalculatorProps) {

  const handleExport = () => {
    const data = {
      calculator: title,
      inputs: fields.reduce((acc, field) => {
        acc[field.label] = formatValue(field.value, field.type, field.suffix)
        return acc
      }, {} as Record<string, string>),
      results: results.reduce((acc, result) => {
        acc[result.label] = formatValue(result.value, result.format)
        return acc
      }, {} as Record<string, string>),
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-calculo.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const text = `${title}\n\n${results.map(r =>
      `${r.label}: ${formatValue(r.value, r.format)}`
    ).join('\n')}\n\nCalculado em ${new Date().toLocaleDateString('pt-BR')}`

    if (navigator.share) {
      await navigator.share({
        title: `Resultado - ${title}`,
        text
      })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Resultado copiado para a área de transferência!')
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            {icon || <Calculator className="h-6 w-6" />}
            {title}
          </CardTitle>
          <p className="text-muted-foreground">{description}</p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados para Cálculo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <label htmlFor={field.id}>{field.label}</label>
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="relative">
                    {field.type === 'currency' && (
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                    )}
                    <Input
                      id={field.id}
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step || 0.01}
                      value={field.value}
                      onChange={(e) => onFieldChange(field.id, parseFloat(e.target.value) || 0)}
                      className={cn(
                        field.type === 'currency' && 'pl-10',
                        (field.type === 'percentage' || field.type === 'years' || field.type === 'months') && 'pr-16'
                      )}
                      placeholder="0"
                    />
                    {field.type !== 'currency' && field.type !== 'number' && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        {getFieldSuffix(field.type)}
                      </span>
                    )}
                  </div>
                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={onCalculate}
                disabled={isCalculating}
                className="flex-1"
              >
                {isCalculating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Calculator className="h-4 w-4 mr-2" />
                )}
                Calcular
              </Button>
              <Button variant="outline" onClick={onReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts/Visual Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visualização</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Gráficos aparecerão aqui após calcular</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chartComponent || (
                  <div className="h-64 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 text-primary/60" />
                      <p className="text-sm text-primary/60">Gráfico Interativo</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Section - Moved Below */}
      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resultados Detalhados</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-lg border',
                    result.highlight
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/50 border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">{result.label}</div>
                    {result.highlight && (
                      <Badge variant="default" className="text-xs">
                        Destaque
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    'font-bold',
                    result.highlight ? 'text-xl text-primary' : 'text-lg'
                  )}>
                    {formatValue(result.value, result.format)}
                  </p>
                  {result.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      {tips && tips.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 Dicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="font-bold text-primary mt-0.5">•</span>
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
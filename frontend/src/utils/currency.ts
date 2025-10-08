/**
 * Formata valores monetários em Real Brasileiro
 */
export function formatCurrency(value: number | string | undefined | null): string {
  // Convert to number if string
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  // Handle invalid values
  if (numValue === undefined || numValue === null || isNaN(numValue)) {
    return 'R$ 0,00'
  }

  // Format with Brazilian locale
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue)
}

/**
 * Formata valores monetários sem o símbolo R$
 */
export function formatCurrencyValue(value: number | string | undefined | null): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (numValue === undefined || numValue === null || isNaN(numValue)) {
    return '0,00'
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue)
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%'
  }

  return `${value.toFixed(1)}%`
}

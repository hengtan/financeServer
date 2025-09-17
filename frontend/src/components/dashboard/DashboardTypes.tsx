export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: 'personal' | 'business' | 'investment' | 'analysis'
  icon: string
  color: string
  widgets: string[]
  layout: 'grid' | 'list' | 'compact'
  isDefault?: boolean
}

export const dashboardTemplates: DashboardTemplate[] = [
  // Dashboards Pessoais
  {
    id: 'personal-overview',
    name: 'Visão Geral Pessoal',
    description: 'Dashboard principal para controle financeiro pessoal',
    category: 'personal',
    icon: '👤',
    color: '#3b82f6',
    widgets: ['balance', 'expenses', 'transactions', 'goals'],
    layout: 'grid',
    isDefault: true
  },
  {
    id: 'personal-savings',
    name: 'Controle de Economia',
    description: 'Foque em suas metas de economia e reservas',
    category: 'personal',
    icon: '🏦',
    color: '#10b981',
    widgets: ['goals', 'savings-trends', 'expense-breakdown', 'budget-tracker'],
    layout: 'grid'
  },
  {
    id: 'personal-expenses',
    name: 'Análise de Gastos',
    description: 'Monitore e controle seus gastos detalhadamente',
    category: 'personal',
    icon: '💳',
    color: '#ef4444',
    widgets: ['expenses', 'expense-breakdown', 'category-trends', 'monthly-comparison'],
    layout: 'grid'
  },

  // Dashboards Empresariais
  {
    id: 'business-overview',
    name: 'Visão Empresarial',
    description: 'Dashboard completo para gestão financeira empresarial',
    category: 'business',
    icon: '🏢',
    color: '#8b5cf6',
    widgets: ['revenue', 'expenses', 'profit-margin', 'cash-flow', 'accounts-receivable'],
    layout: 'grid'
  },
  {
    id: 'business-cash-flow',
    name: 'Fluxo de Caixa',
    description: 'Monitore entradas e saídas de caixa em tempo real',
    category: 'business',
    icon: '💰',
    color: '#f59e0b',
    widgets: ['cash-flow', 'receivables', 'payables', 'bank-balance'],
    layout: 'list'
  },
  {
    id: 'business-performance',
    name: 'Performance Financeira',
    description: 'KPIs e métricas de performance empresarial',
    category: 'business',
    icon: '📊',
    color: '#06b6d4',
    widgets: ['revenue-growth', 'profit-margin', 'roi', 'financial-ratios'],
    layout: 'compact'
  },

  // Dashboards de Investimento
  {
    id: 'investment-portfolio',
    name: 'Portfólio de Investimentos',
    description: 'Acompanhe seus investimentos e retornos',
    category: 'investment',
    icon: '📈',
    color: '#ec4899',
    widgets: ['portfolio-value', 'asset-allocation', 'performance', 'dividends'],
    layout: 'grid'
  },
  {
    id: 'investment-analysis',
    name: 'Análise de Investimentos',
    description: 'Análise detalhada de performance e riscos',
    category: 'investment',
    icon: '🎯',
    color: '#84cc16',
    widgets: ['returns-analysis', 'risk-metrics', 'benchmark-comparison', 'allocation-trends'],
    layout: 'grid'
  },
  {
    id: 'crypto-tracker',
    name: 'Rastreador Crypto',
    description: 'Monitore suas criptomoedas e DeFi',
    category: 'investment',
    icon: '₿',
    color: '#f97316',
    widgets: ['crypto-portfolio', 'crypto-prices', 'defi-positions', 'crypto-news'],
    layout: 'compact'
  },

  // Dashboards Analíticos
  {
    id: 'financial-analytics',
    name: 'Analytics Financeiro',
    description: 'Análises avançadas e insights financeiros',
    category: 'analysis',
    icon: '🔍',
    color: '#6366f1',
    widgets: ['trend-analysis', 'forecasting', 'correlation-matrix', 'financial-health'],
    layout: 'grid'
  },
  {
    id: 'budget-planning',
    name: 'Planejamento Orçamentário',
    description: 'Ferramentas para planejamento e orçamento',
    category: 'analysis',
    icon: '📋',
    color: '#14b8a6',
    widgets: ['budget-vs-actual', 'variance-analysis', 'budget-forecast', 'spending-patterns'],
    layout: 'list'
  },
  {
    id: 'tax-reporting',
    name: 'Relatórios Fiscais',
    description: 'Dashboards específicos para relatórios fiscais',
    category: 'analysis',
    icon: '📄',
    color: '#64748b',
    widgets: ['tax-summary', 'deductible-expenses', 'income-breakdown', 'tax-obligations'],
    layout: 'compact'
  }
]

export const categoryLabels = {
  personal: 'Pessoal',
  business: 'Empresarial',
  investment: 'Investimentos',
  analysis: 'Análise'
}

export const categoryDescriptions = {
  personal: 'Dashboards para controle financeiro pessoal',
  business: 'Gestão financeira empresarial e corporativa',
  investment: 'Acompanhamento de investimentos e portfólios',
  analysis: 'Análises avançadas e relatórios detalhados'
}

// Widgets especializados para cada categoria
export const specializedWidgets = {
  // Widgets Pessoais
  'savings-trends': {
    name: 'Tendências de Economia',
    description: 'Gráfico de evolução da economia mensal',
    category: 'personal'
  },
  'budget-tracker': {
    name: 'Rastreador de Orçamento',
    description: 'Acompanhe o cumprimento do orçamento',
    category: 'personal'
  },
  'category-trends': {
    name: 'Tendências por Categoria',
    description: 'Evolução dos gastos por categoria',
    category: 'personal'
  },

  // Widgets Empresariais
  'revenue': {
    name: 'Receita',
    description: 'Receita total e crescimento',
    category: 'business'
  },
  'profit-margin': {
    name: 'Margem de Lucro',
    description: 'Análise de margem de lucro',
    category: 'business'
  },
  'cash-flow': {
    name: 'Fluxo de Caixa',
    description: 'Entradas e saídas de caixa',
    category: 'business'
  },
  'accounts-receivable': {
    name: 'Contas a Receber',
    description: 'Valores a receber de clientes',
    category: 'business'
  },

  // Widgets de Investimento
  'portfolio-value': {
    name: 'Valor do Portfólio',
    description: 'Valor total dos investimentos',
    category: 'investment'
  },
  'asset-allocation': {
    name: 'Alocação de Ativos',
    description: 'Distribuição dos investimentos',
    category: 'investment'
  },
  'crypto-portfolio': {
    name: 'Portfólio Crypto',
    description: 'Carteira de criptomoedas',
    category: 'investment'
  },

  // Widgets Analíticos
  'trend-analysis': {
    name: 'Análise de Tendências',
    description: 'Identificação de padrões e tendências',
    category: 'analysis'
  },
  'forecasting': {
    name: 'Previsões',
    description: 'Projeções financeiras futuras',
    category: 'analysis'
  },
  'financial-health': {
    name: 'Saúde Financeira',
    description: 'Score de saúde financeira',
    category: 'analysis'
  }
}
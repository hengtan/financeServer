import { useGoalPrediction } from '@/hooks/useGoalsAI'
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card } from './ui/card'

interface GoalAIInsightProps {
  goalId: string
}

export function GoalAIInsight({ goalId }: GoalAIInsightProps) {
  const { prediction, loading, error } = useGoalPrediction(goalId)

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
          <span className="text-sm text-blue-700">Analisando com IA...</span>
        </div>
      </div>
    )
  }

  if (error || !prediction) {
    return null
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very_low':
      case 'low':
        return 'from-green-50 to-emerald-50 border-green-200'
      case 'medium':
        return 'from-yellow-50 to-orange-50 border-yellow-200'
      case 'high':
      case 'critical':
        return 'from-red-50 to-pink-50 border-red-200'
      default:
        return 'from-gray-50 to-slate-50 border-gray-200'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very_low':
      case 'low':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'medium':
        return <TrendingUp className="h-5 w-5 text-yellow-600" />
      case 'high':
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Brain className="h-5 w-5 text-blue-600" />
    }
  }

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very_low':
        return 'Risco muito baixo'
      case 'low':
        return 'Risco baixo'
      case 'medium':
        return 'Risco médio'
      case 'high':
        return 'Risco alto'
      case 'critical':
        return 'Risco crítico'
      default:
        return 'Analisando'
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {/* AI Prediction Card */}
      <div className={`p-4 bg-gradient-to-r ${getRiskColor(prediction.prediction.riskLevel)} rounded-lg border`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">Previsão IA</span>
          </div>
          <div className="flex items-center space-x-2">
            {getRiskIcon(prediction.prediction.riskLevel)}
            <span className="text-xs font-medium text-gray-700">
              {getRiskText(prediction.prediction.riskLevel)}
            </span>
          </div>
        </div>

        {/* Probability */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Probabilidade de sucesso</span>
            <span className="text-sm font-bold text-gray-900">
              {prediction.prediction.probability.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                prediction.prediction.probability >= 70
                  ? 'bg-green-500'
                  : prediction.prediction.probability >= 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${prediction.prediction.probability}%` }}
            />
          </div>
        </div>

        {/* Financial Info */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white/60 rounded-lg p-2">
            <p className="text-xs text-gray-600">Recomendado/mês</p>
            <p className="text-sm font-bold text-gray-900">
              R$ {prediction.financial.recommendedMonthly.toFixed(2)}
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-2">
            <p className="text-xs text-gray-600">Meses restantes</p>
            <p className="text-sm font-bold text-gray-900">
              {prediction.financial.monthsRemaining.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Insights */}
        {prediction.insights && prediction.insights.length > 0 && (
          <div className="space-y-2">
            {prediction.insights.map((insight, idx) => (
              <div
                key={idx}
                className={`text-xs p-2 rounded-md ${
                  insight.priority === 'high'
                    ? 'bg-red-100/80 text-red-800'
                    : insight.priority === 'medium'
                    ? 'bg-yellow-100/80 text-yellow-800'
                    : 'bg-blue-100/80 text-blue-800'
                }`}
              >
                <p className="font-medium">{insight.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

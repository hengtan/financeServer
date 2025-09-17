import { ReactNode } from 'react'
import {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonDashboard,
  SkeletonTransactionList,
  SkeletonProfile,
} from '@/components/ui/skeleton'

type SkeletonType =
  | 'default'
  | 'card'
  | 'table'
  | 'chart'
  | 'dashboard'
  | 'transactions'
  | 'profile'
  | 'custom'

interface LoadingWrapperProps {
  isLoading: boolean
  children: ReactNode
  skeleton?: SkeletonType
  customSkeleton?: ReactNode
  className?: string
  error?: string | null
  onRetry?: () => void
}

const skeletonComponents = {
  default: () => <Skeleton className="h-32 w-full" />,
  card: SkeletonCard,
  table: SkeletonTable,
  chart: SkeletonChart,
  dashboard: SkeletonDashboard,
  transactions: SkeletonTransactionList,
  profile: SkeletonProfile,
}

export function LoadingWrapper({
  isLoading,
  children,
  skeleton = 'default',
  customSkeleton,
  className = '',
  error,
  onRetry,
}: LoadingWrapperProps) {
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 max-w-md">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/20">
            <svg
              className="w-6 h-6 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Erro ao carregar
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    const SkeletonComponent = customSkeleton || skeletonComponents[skeleton]

    return (
      <div className={`animate-fadeIn ${className}`}>
        {typeof SkeletonComponent === 'function' ? <SkeletonComponent /> : SkeletonComponent}
      </div>
    )
  }

  return <div className={`animate-fadeIn ${className}`}>{children}</div>
}

interface LazyLoadWrapperProps extends LoadingWrapperProps {
  delay?: number
}

export function LazyLoadWrapper({
  delay = 100,
  ...props
}: LazyLoadWrapperProps) {
  return <LoadingWrapper {...props} />
}
import { useState, useCallback, useRef, useEffect } from 'react'

interface UseLoadingOptions {
  initialDelay?: number
  minimumDuration?: number
}

interface LoadingState {
  isLoading: boolean
  error: string | null
  startLoading: () => void
  stopLoading: () => void
  setError: (error: string | null) => void
  clearError: () => void
}

export function useLoading(options: UseLoadingOptions = {}): LoadingState {
  const { initialDelay = 0, minimumDuration = 500 } = options
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadingStartTime = useRef<number | null>(null)
  const delayTimeout = useRef<NodeJS.Timeout | null>(null)
  const minimumTimeout = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback(() => {
    setError(null)

    if (initialDelay > 0) {
      delayTimeout.current = setTimeout(() => {
        setIsLoading(true)
        loadingStartTime.current = Date.now()
      }, initialDelay)
    } else {
      setIsLoading(true)
      loadingStartTime.current = Date.now()
    }
  }, [initialDelay])

  const stopLoading = useCallback(() => {
    if (delayTimeout.current) {
      clearTimeout(delayTimeout.current)
      delayTimeout.current = null
      return
    }

    if (loadingStartTime.current && minimumDuration > 0) {
      const elapsedTime = Date.now() - loadingStartTime.current
      const remainingTime = minimumDuration - elapsedTime

      if (remainingTime > 0) {
        minimumTimeout.current = setTimeout(() => {
          setIsLoading(false)
          loadingStartTime.current = null
        }, remainingTime)
      } else {
        setIsLoading(false)
        loadingStartTime.current = null
      }
    } else {
      setIsLoading(false)
      loadingStartTime.current = null
    }
  }, [minimumDuration])

  const handleSetError = useCallback((error: string | null) => {
    setError(error)
    if (error) {
      stopLoading()
    }
  }, [stopLoading])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      if (delayTimeout.current) {
        clearTimeout(delayTimeout.current)
      }
      if (minimumTimeout.current) {
        clearTimeout(minimumTimeout.current)
      }
    }
  }, [])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: handleSetError,
    clearError,
  }
}

interface UseAsyncOperationOptions extends UseLoadingOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
}

export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  const { onSuccess, onError, ...loadingOptions } = options
  const { isLoading, error, startLoading, stopLoading, setError, clearError } = useLoading(loadingOptions)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async () => {
    try {
      startLoading()
      const result = await operation()
      setData(result)
      onSuccess?.(result)
      stopLoading()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
    }
  }, [operation, startLoading, stopLoading, setError, onSuccess, onError])

  return {
    data,
    isLoading,
    error,
    execute,
    clearError,
    setData,
  }
}

export function usePageLoading() {
  const [isPageLoading, setIsPageLoading] = useState(true)

  const finishPageLoading = useCallback(() => {
    setTimeout(() => setIsPageLoading(false), 300)
  }, [])

  useEffect(() => {
    const timer = setTimeout(finishPageLoading, 1000)
    return () => clearTimeout(timer)
  }, [finishPageLoading])

  return {
    isPageLoading,
    finishPageLoading,
  }
}
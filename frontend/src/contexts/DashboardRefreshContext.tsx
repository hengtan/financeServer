import React, { createContext, useContext, useState, useCallback } from 'react'

interface DashboardRefreshContextType {
  refreshTrigger: number
  triggerRefresh: () => void
}

const DashboardRefreshContext = createContext<DashboardRefreshContextType | undefined>(undefined)

export const DashboardRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = useCallback(() => {
    console.log('🔄 Triggering dashboard refresh')
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return (
    <DashboardRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </DashboardRefreshContext.Provider>
  )
}

export const useDashboardRefresh = () => {
  const context = useContext(DashboardRefreshContext)
  if (!context) {
    // Fallback for components outside provider - no-op
    console.warn('useDashboardRefresh: not within DashboardRefreshProvider, using fallback')
    return {
      refreshTrigger: 0,
      triggerRefresh: () => console.warn('DashboardRefreshProvider not available')
    }
  }
  return context
}

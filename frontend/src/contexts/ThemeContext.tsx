import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

export const ThemeProvider = ({ children, defaultTheme = 'system' }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('finance-theme') as Theme
    return stored || defaultTheme
  })

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const stored = localStorage.getItem('finance-accent-color') as AccentColor
    return stored || 'blue'
  })

  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')
    root.classList.remove('accent-blue', 'accent-green', 'accent-purple', 'accent-orange', 'accent-red', 'accent-pink')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      setIsDark(systemTheme === 'dark')
    } else {
      root.classList.add(theme)
      setIsDark(theme === 'dark')
    }

    root.classList.add(`accent-${accentColor}`)
  }, [theme, accentColor])

  useEffect(() => {
    localStorage.setItem('finance-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('finance-accent-color', accentColor)
  }, [accentColor])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (theme === 'system') {
        setIsDark(mediaQuery.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    accentColor,
    setAccentColor,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
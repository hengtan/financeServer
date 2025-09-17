import { Moon, Sun, Laptop, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

const accentColors = {
  blue: { name: 'Azul', color: '#3b82f6' },
  green: { name: 'Verde', color: '#10b981' },
  purple: { name: 'Roxo', color: '#8b5cf6' },
  orange: { name: 'Laranja', color: '#f59e0b' },
  red: { name: 'Vermelho', color: '#ef4444' },
  pink: { name: 'Rosa', color: '#ec4899' }
} as const

export const ThemeToggle = () => {
  const { theme, setTheme, isDark, accentColor, setAccentColor } = useTheme()

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'system':
        return <Laptop className="h-4 w-4" />
      default:
        return <Sun className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-9 h-9 p-0"
        >
          {getThemeIcon()}
          <span className="sr-only">Configurar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="h-4 w-4 mr-2" />
          Claro
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          Escuro
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Laptop className="h-4 w-4 mr-2" />
          Sistema
          {theme === 'system' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="h-4 w-4 mr-2" />
            Cor de destaque
            <div
              className="w-3 h-3 rounded-full ml-auto border border-border"
              style={{ backgroundColor: accentColors[accentColor].color }}
            />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {Object.entries(accentColors).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setAccentColor(key as any)}
                className="flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: value.color }}
                />
                {value.name}
                {accentColor === key && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
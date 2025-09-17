import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KeyboardShortcut, formatShortcut, getOS } from '@/hooks/useKeyboardShortcuts'
import { Keyboard, Command, Navigation, Zap, HelpCircle, X } from 'lucide-react'

interface ShortcutsHelpProps {
  shortcuts: KeyboardShortcut[]
  isOpen: boolean
  onClose: () => void
}

function ShortcutsHelp({ shortcuts, isOpen, onClose }: ShortcutsHelpProps) {
  const os = getOS()

  // Agrupa atalhos por categoria
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Geral'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  const categories = Object.keys(groupedShortcuts)

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'navegação':
        return <Navigation className="h-4 w-4" />
      case 'ações':
        return <Zap className="h-4 w-4" />
      case 'ajuda':
        return <HelpCircle className="h-4 w-4" />
      default:
        return <Command className="h-4 w-4" />
    }
  }

  const getOSSpecificKey = (key: string) => {
    if (os === 'mac') {
      switch (key.toLowerCase()) {
        case 'ctrl':
          return '⌘'
        case 'alt':
          return '⌥'
        case 'shift':
          return '⇧'
        default:
          return key
      }
    }
    return key
  }

  const formatShortcutForOS = (shortcut: KeyboardShortcut) => {
    const parts: string[] = []

    if (shortcut.ctrlKey) parts.push(getOSSpecificKey('ctrl'))
    if (shortcut.altKey) parts.push(getOSSpecificKey('alt'))
    if (shortcut.shiftKey) parts.push(getOSSpecificKey('shift'))
    if (shortcut.metaKey) parts.push('⌘')

    parts.push(shortcut.key.toUpperCase())

    return parts.join(os === 'mac' ? '' : ' + ')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atalhos de Teclado" size="xl">
      <div className="mb-4">
        <p className="text-muted-foreground">
          Use estes atalhos para navegar mais rapidamente pela aplicação.
          {os === 'mac' && ' Os atalhos foram adaptados para macOS.'}
        </p>
      </div>

        <div className="mt-6">
          {categories.length > 1 ? (
            <Tabs defaultValue={categories[0]} className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-6">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map(category => (
                <TabsContent key={category} value={category}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {getCategoryIcon(category)}
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {groupedShortcuts[category].map((shortcut, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-foreground">
                              {shortcut.description}
                            </span>
                            <Badge variant="outline" className="font-mono text-xs">
                              {formatShortcutForOS(shortcut)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Atalhos Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-foreground">
                        {shortcut.description}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {formatShortcutForOS(shortcut)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      <div className="flex justify-between items-center mt-6">
        <div className="text-xs text-muted-foreground">
          Pressione <Badge variant="outline" className="mx-1 text-xs">?</Badge> para abrir esta ajuda
        </div>
      </div>
    </Modal>
  )
}

// Hook para gerenciar o modal de ajuda
export function useShortcutsHelp(shortcuts: KeyboardShortcut[]) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleShowHelp = () => setIsOpen(true)

    document.addEventListener('show-shortcuts-help', handleShowHelp)

    return () => {
      document.removeEventListener('show-shortcuts-help', handleShowHelp)
    }
  }, [])

  const showHelp = () => setIsOpen(true)
  const hideHelp = () => setIsOpen(false)

  return {
    isOpen,
    showHelp,
    hideHelp,
    ShortcutsHelpModal: () => (
      <ShortcutsHelp
        shortcuts={shortcuts}
        isOpen={isOpen}
        onClose={hideHelp}
      />
    )
  }
}

export default ShortcutsHelp
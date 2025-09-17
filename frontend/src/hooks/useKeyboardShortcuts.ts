import { useEffect, useCallback, useRef } from 'react'
import { showInfoToast } from '@/lib/utils'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
  preventDefault?: boolean
  category?: string
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
  showToasts?: boolean
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  showToasts = false
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts)
  const enabledRef = useRef(enabled)

  // Atualiza as refs quando os valores mudam
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabledRef.current) return

    // Ignora se o foco está em um input, textarea ou elemento editável
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return
    }

    for (const shortcut of shortcutsRef.current) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = !!event.ctrlKey === !!shortcut.ctrlKey
      const altMatches = !!event.altKey === !!shortcut.altKey
      const shiftMatches = !!event.shiftKey === !!shortcut.shiftKey
      const metaMatches = !!event.metaKey === !!shortcut.metaKey

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
          event.stopPropagation()
        }

        if (showToasts) {
          showInfoToast('Atalho ativado', shortcut.description)
        }

        shortcut.action()
        break
      }
    }
  }, [showToasts])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [handleKeyDown, enabled])

  return {
    shortcuts: shortcutsRef.current,
    enabled: enabledRef.current,
  }
}

// Helper para formatar atalhos para exibição
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.altKey) parts.push('Alt')
  if (shortcut.shiftKey) parts.push('Shift')
  if (shortcut.metaKey) parts.push('Cmd')

  parts.push(shortcut.key.toUpperCase())

  return parts.join(' + ')
}

// Hook para atalhos globais comuns
export function useGlobalShortcuts() {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      ctrlKey: true,
      description: 'Ir para página inicial',
      action: () => {
        window.location.href = '/'
      },
      category: 'Navegação'
    },
    {
      key: 'd',
      ctrlKey: true,
      description: 'Ir para dashboard',
      action: () => {
        window.location.href = '/dashboard'
      },
      category: 'Navegação'
    },
    {
      key: 't',
      ctrlKey: true,
      description: 'Ir para transações',
      action: () => {
        window.location.href = '/transacoes'
      },
      category: 'Navegação'
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Ir para relatórios',
      action: () => {
        window.location.href = '/relatorios'
      },
      category: 'Navegação'
    },
    {
      key: 'g',
      ctrlKey: true,
      description: 'Ir para metas',
      action: () => {
        window.location.href = '/metas'
      },
      category: 'Navegação'
    },
    {
      key: 's',
      ctrlKey: true,
      description: 'Ir para configurações',
      action: () => {
        window.location.href = '/configuracoes'
      },
      category: 'Navegação'
    },
    {
      key: 'n',
      ctrlKey: true,
      description: 'Nova transação',
      action: () => {
        // Trigger modal de nova transação
        const event = new CustomEvent('open-new-transaction-modal')
        document.dispatchEvent(event)
      },
      category: 'Ações'
    },
    {
      key: 'k',
      ctrlKey: true,
      description: 'Abrir busca',
      action: () => {
        // Trigger search modal
        const event = new CustomEvent('open-search-modal')
        document.dispatchEvent(event)
      },
      category: 'Ações'
    },
    {
      key: '?',
      description: 'Mostrar atalhos disponíveis',
      action: () => {
        const event = new CustomEvent('show-shortcuts-help')
        document.dispatchEvent(event)
      },
      category: 'Ajuda'
    },
    {
      key: 'Escape',
      description: 'Fechar modal/menu aberto',
      action: () => {
        const event = new CustomEvent('close-all-modals')
        document.dispatchEvent(event)
      },
      category: 'Navegação'
    }
  ]

  return useKeyboardShortcuts({
    shortcuts,
    enabled: true,
    showToasts: false
  })
}

// Hook para atalhos específicos de página
export function usePageShortcuts(pageShortcuts: KeyboardShortcut[]) {
  return useKeyboardShortcuts({
    shortcuts: pageShortcuts,
    enabled: true,
    showToasts: false
  })
}

// Utilitário para detectar sistema operacional
export function getOS(): 'mac' | 'windows' | 'linux' | 'unknown' {
  const userAgent = window.navigator.userAgent.toLowerCase()

  if (userAgent.includes('mac')) return 'mac'
  if (userAgent.includes('win')) return 'windows'
  if (userAgent.includes('linux')) return 'linux'

  return 'unknown'
}

// Adaptador para atalhos baseados no OS
export function adaptShortcutsForOS(shortcuts: KeyboardShortcut[]): KeyboardShortcut[] {
  const os = getOS()

  return shortcuts.map(shortcut => {
    // No Mac, usa Cmd ao invés de Ctrl para navegação
    if (os === 'mac' && shortcut.ctrlKey && shortcut.category === 'Navegação') {
      return {
        ...shortcut,
        ctrlKey: false,
        metaKey: true
      }
    }

    return shortcut
  })
}
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalShortcuts, adaptShortcutsForOS, KeyboardShortcut } from '@/hooks/useKeyboardShortcuts'
import { useShortcutsHelp } from '@/components/ShortcutsHelp'
import { showInfoToast } from '@/lib/utils'

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const navigate = useNavigate()

  // Atalhos globais customizados para esta aplicação
  const globalShortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      ctrlKey: true,
      description: 'Ir para página inicial',
      action: () => navigate('/'),
      category: 'Navegação'
    },
    {
      key: 'd',
      ctrlKey: true,
      description: 'Ir para dashboard',
      action: () => navigate('/dashboard'),
      category: 'Navegação'
    },
    {
      key: 't',
      ctrlKey: true,
      description: 'Ir para transações',
      action: () => navigate('/transacoes'),
      category: 'Navegação'
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Ir para relatórios',
      action: () => navigate('/relatorios'),
      category: 'Navegação'
    },
    {
      key: 'g',
      ctrlKey: true,
      description: 'Ir para metas',
      action: () => navigate('/metas'),
      category: 'Navegação'
    },
    {
      key: 's',
      ctrlKey: true,
      description: 'Ir para configurações',
      action: () => navigate('/configuracoes'),
      category: 'Navegação'
    },
    {
      key: 'p',
      ctrlKey: true,
      description: 'Ir para perfil',
      action: () => navigate('/perfil'),
      category: 'Navegação'
    },
    {
      key: 'n',
      ctrlKey: true,
      description: 'Nova transação',
      action: () => {
        const event = new CustomEvent('open-new-transaction-modal')
        document.dispatchEvent(event)
        showInfoToast('Modal de nova transação', 'Atalho: Ctrl+N')
      },
      category: 'Ações'
    },
    {
      key: 'k',
      ctrlKey: true,
      description: 'Abrir busca rápida',
      action: () => {
        const event = new CustomEvent('open-search-modal')
        document.dispatchEvent(event)
        showInfoToast('Busca rápida', 'Atalho: Ctrl+K')
      },
      category: 'Ações'
    },
    {
      key: 'f',
      ctrlKey: true,
      description: 'Buscar na página',
      action: () => {
        // Permite o comportamento padrão do navegador
        showInfoToast('Busca na página', 'Atalho: Ctrl+F')
      },
      preventDefault: false,
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
    },
    {
      key: '1',
      altKey: true,
      description: 'Trocar para tema escuro',
      action: () => {
        const event = new CustomEvent('toggle-theme', { detail: 'dark' })
        document.dispatchEvent(event)
        showInfoToast('Tema alterado', 'Tema escuro ativado')
      },
      category: 'Personalização'
    },
    {
      key: '2',
      altKey: true,
      description: 'Trocar para tema claro',
      action: () => {
        const event = new CustomEvent('toggle-theme', { detail: 'light' })
        document.dispatchEvent(event)
        showInfoToast('Tema alterado', 'Tema claro ativado')
      },
      category: 'Personalização'
    },
    {
      key: '3',
      altKey: true,
      description: 'Trocar para tema automático',
      action: () => {
        const event = new CustomEvent('toggle-theme', { detail: 'system' })
        document.dispatchEvent(event)
        showInfoToast('Tema alterado', 'Tema automático ativado')
      },
      category: 'Personalização'
    }
  ]

  // Adapta os atalhos para o OS atual
  const adaptedShortcuts = adaptShortcutsForOS(globalShortcuts)

  // Ativa os atalhos globais
  useGlobalShortcuts()

  // Sistema de ajuda dos atalhos
  const { ShortcutsHelpModal } = useShortcutsHelp(adaptedShortcuts)

  // Event listeners para eventos customizados
  useEffect(() => {
    const handleCloseModals = () => {
      // Fecha qualquer modal aberto
      const modals = document.querySelectorAll('[data-modal="true"]')
      modals.forEach(modal => {
        const closeButton = modal.querySelector('[data-close="true"]')
        if (closeButton) {
          (closeButton as HTMLElement).click()
        }
      })

      // Remove focus de elementos
      const activeElement = document.activeElement as HTMLElement
      if (activeElement && activeElement.blur) {
        activeElement.blur()
      }
    }

    const handleToggleTheme = (event: CustomEvent) => {
      const theme = event.detail
      const themeEvent = new CustomEvent('theme-change', { detail: theme })
      document.dispatchEvent(themeEvent)
    }

    document.addEventListener('close-all-modals', handleCloseModals)
    document.addEventListener('toggle-theme', handleToggleTheme as EventListener)

    return () => {
      document.removeEventListener('close-all-modals', handleCloseModals)
      document.removeEventListener('toggle-theme', handleToggleTheme as EventListener)
    }
  }, [])

  return (
    <>
      {children}
      <ShortcutsHelpModal />
    </>
  )
}

export default KeyboardShortcutsProvider
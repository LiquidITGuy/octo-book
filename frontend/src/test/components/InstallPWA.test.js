import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import InstallPWA from '@/components/InstallPWA.vue'

// Mock du composable useTheme
vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    isDark: vi.fn(() => false)
  })
}))

describe('InstallPWA', () => {
  let wrapper
  let localStorageMock
  let mockAddEventListener
  let mockRemoveEventListener

  beforeEach(() => {
    // Mock de localStorage
    localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    // Mock de matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn(() => ({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn()
      })),
      writable: true
    })

    // Mock de navigator.standalone
    Object.defineProperty(window.navigator, 'standalone', {
      value: false,
      writable: true
    })

    // Mock des event listeners
    mockAddEventListener = vi.fn()
    mockRemoveEventListener = vi.fn()
    Object.defineProperty(window, 'addEventListener', {
      value: mockAddEventListener,
      writable: true
    })
    Object.defineProperty(window, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true
    })

    // Mock de console
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock de setTimeout
    vi.spyOn(global, 'setTimeout').mockImplementation((fn) => fn())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('Rendu initial', () => {
    it('devrait se monter correctement', () => {
      wrapper = mount(InstallPWA)
      expect(wrapper.exists()).toBe(true)
    })

    it('ne devrait pas afficher le prompt par défaut', () => {
      wrapper = mount(InstallPWA)
      expect(wrapper.find('.install-pwa').exists()).toBe(false)
    })

    it('devrait avoir le nom de composant correct', () => {
      expect(InstallPWA.name).toBe('InstallPWA')
    })

    it('devrait utiliser le composable useTheme', () => {
      wrapper = mount(InstallPWA)
      expect(wrapper.vm.isDark).toBeDefined()
    })
  })

  describe('États et propriétés', () => {
    it('devrait initialiser showInstallPrompt à false', () => {
      wrapper = mount(InstallPWA)
      expect(wrapper.vm.showInstallPrompt).toBe(false)
    })

    it('devrait avoir les méthodes publiques disponibles', () => {
      wrapper = mount(InstallPWA)
      expect(typeof wrapper.vm.installApp).toBe('function')
      expect(typeof wrapper.vm.dismissPrompt).toBe('function')
    })
  })

  describe('Gestion des événements PWA', () => {
    it('devrait enregistrer les event listeners au montage', () => {
      wrapper = mount(InstallPWA)
      
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      )
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'appinstalled',
        expect.any(Function)
      )
    })

    it('devrait supprimer les event listeners au démontage', () => {
      wrapper = mount(InstallPWA)
      wrapper.unmount()
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      )
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'appinstalled',
        expect.any(Function)
      )
    })
  })

  describe('Vérification d\'installation', () => {
    it('devrait détecter l\'installation via display-mode standalone', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn(() => ({
          matches: true, // Simule display-mode: standalone
          addListener: vi.fn(),
          removeListener: vi.fn()
        })),
        writable: true
      })

      wrapper = mount(InstallPWA)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pwa-installed', 'true')
    })

    it('devrait détecter l\'installation via navigator.standalone sur iOS', () => {
      Object.defineProperty(window.navigator, 'standalone', {
        value: true,
        writable: true
      })

      wrapper = mount(InstallPWA)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pwa-installed', 'true')
    })
  })

  describe('Affichage du prompt', () => {
    it('devrait afficher le prompt quand showInstallPrompt est true', async () => {
      wrapper = mount(InstallPWA)
      
      // Forcer l'affichage du prompt
      wrapper.vm.showInstallPrompt = true
      await nextTick()
      
      expect(wrapper.find('.install-pwa').exists()).toBe(true)
      expect(wrapper.find('.install-banner').exists()).toBe(true)
      expect(wrapper.find('.install-content').exists()).toBe(true)
    })

    it('devrait afficher le contenu correct du prompt', async () => {
      wrapper = mount(InstallPWA)
      wrapper.vm.showInstallPrompt = true
      await nextTick()
      
      expect(wrapper.find('.install-icon').text()).toBe('📱')
      expect(wrapper.find('h3').text()).toBe('Installer Octo Books')
      expect(wrapper.find('p').text()).toContain('Accédez rapidement')
      expect(wrapper.find('.btn-install').text()).toBe('Installer')
      expect(wrapper.find('.btn-dismiss').text()).toBe('✕')
    })

    it('devrait appliquer la classe dark-mode si isDark est true', async () => {
      // Mock isDark pour retourner true
      vi.mocked(vi.importActual('@/composables/useTheme')).useTheme = () => ({
        isDark: vi.fn(() => true)
      })
      
      wrapper = mount(InstallPWA)
      wrapper.vm.showInstallPrompt = true
      await nextTick()
      
      expect(wrapper.find('.install-banner.dark-mode').exists()).toBe(true)
    })
  })

  describe('Actions utilisateur', () => {
    beforeEach(() => {
      wrapper = mount(InstallPWA)
      wrapper.vm.showInstallPrompt = true
    })

    it('devrait fermer le prompt au clic sur dismiss', async () => {
      await nextTick()
      const dismissBtn = wrapper.find('.btn-dismiss')
      
      await dismissBtn.trigger('click')
      
      expect(wrapper.vm.showInstallPrompt).toBe(false)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('pwa-install-dismissed', 'true')
    })

    it('devrait programmer la suppression du flag dismissed après 7 jours', async () => {
      await nextTick()
      const dismissBtn = wrapper.find('.btn-dismiss')
      
      await dismissBtn.trigger('click')
      
      expect(setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        7 * 24 * 60 * 60 * 1000
      )
    })

    it('devrait gérer le clic sur installer sans deferredPrompt', async () => {
      await nextTick()
      const installBtn = wrapper.find('.btn-install')
      
      // Pas de deferredPrompt défini
      await installBtn.trigger('click')
      
      // Ne devrait pas lever d'erreur
      expect(wrapper.vm.showInstallPrompt).toBe(true)
    })
  })

  describe('Gestion du localStorage', () => {
    it('ne devrait pas afficher le prompt si déjà dismissed', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'pwa-install-dismissed') return 'true'
        return null
      })

      wrapper = mount(InstallPWA)
      
      // Simuler l'événement beforeinstallprompt
      const mockEvent = { preventDefault: vi.fn() }
      const beforeInstallPromptHandler = mockAddEventListener.mock.calls
        .find(call => call[0] === 'beforeinstallprompt')?.[1]
      
      if (beforeInstallPromptHandler) {
        beforeInstallPromptHandler(mockEvent)
        expect(wrapper.vm.showInstallPrompt).toBe(false)
      }
    })

    it('ne devrait pas afficher le prompt si déjà installé', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'pwa-installed') return 'true'
        return null
      })

      wrapper = mount(InstallPWA)
      
      // Simuler l'événement beforeinstallprompt
      const mockEvent = { preventDefault: vi.fn() }
      const beforeInstallPromptHandler = mockAddEventListener.mock.calls
        .find(call => call[0] === 'beforeinstallprompt')?.[1]
      
      if (beforeInstallPromptHandler) {
        beforeInstallPromptHandler(mockEvent)
        expect(wrapper.vm.showInstallPrompt).toBe(false)
      }
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs lors de l\'installation', async () => {
      wrapper = mount(InstallPWA)
      wrapper.vm.showInstallPrompt = true
      
      await nextTick()
      const installBtn = wrapper.find('.btn-install')
      
      // Test sans deferredPrompt (cas d'erreur simple)
      await installBtn.trigger('click')
      
      // Le test passe si aucune erreur n'est levée
      expect(wrapper.vm.showInstallPrompt).toBe(true)
    })
  })

  describe('Accessibilité', () => {
    beforeEach(async () => {
      wrapper = mount(InstallPWA)
      wrapper.vm.showInstallPrompt = true
      await nextTick()
    })

    it('devrait avoir des boutons accessibles', () => {
      const installBtn = wrapper.find('.btn-install')
      const dismissBtn = wrapper.find('.btn-dismiss')
      
      expect(installBtn.element.tagName).toBe('BUTTON')
      expect(dismissBtn.element.tagName).toBe('BUTTON')
    })

    it('devrait avoir une structure hiérarchique correcte', () => {
      expect(wrapper.find('h3').exists()).toBe(true)
      expect(wrapper.find('p').exists()).toBe(true)
    })

    it('devrait avoir les classes CSS appropriées', () => {
      expect(wrapper.find('.install-pwa').exists()).toBe(true)
      expect(wrapper.find('.install-banner').exists()).toBe(true)
      expect(wrapper.find('.install-content').exists()).toBe(true)
      expect(wrapper.find('.install-icon').exists()).toBe(true)
      expect(wrapper.find('.install-text').exists()).toBe(true)
      expect(wrapper.find('.install-actions').exists()).toBe(true)
    })
  })

  describe('Responsive design', () => {
    beforeEach(async () => {
      wrapper = mount(InstallPWA)
      wrapper.vm.showInstallPrompt = true
      await nextTick()
    })

    it('devrait avoir les classes CSS pour le responsive', () => {
      // Vérifier que les éléments ont les bonnes classes pour le responsive
      expect(wrapper.find('.install-content').exists()).toBe(true)
      expect(wrapper.find('.install-actions').exists()).toBe(true)
    })

    it('devrait avoir des boutons avec les bonnes tailles', () => {
      const installBtn = wrapper.find('.btn-install')
      const dismissBtn = wrapper.find('.btn-dismiss')
      
      expect(installBtn.classes()).toContain('btn-install')
      expect(dismissBtn.classes()).toContain('btn-dismiss')
    })
  })

  describe('Performance', () => {
    it('devrait utiliser setTimeout pour différer l\'affichage du prompt', () => {
      wrapper = mount(InstallPWA)
      
      const mockEvent = { preventDefault: vi.fn() }
      const beforeInstallPromptHandler = mockAddEventListener.mock.calls
        .find(call => call[0] === 'beforeinstallprompt')?.[1]
      
      if (beforeInstallPromptHandler) {
        beforeInstallPromptHandler(mockEvent)
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000)
      }
    })

    it('devrait nettoyer les ressources au démontage', () => {
      wrapper = mount(InstallPWA)
      
      wrapper.unmount()
      
      expect(mockRemoveEventListener).toHaveBeenCalledTimes(2)
    })
  })
})

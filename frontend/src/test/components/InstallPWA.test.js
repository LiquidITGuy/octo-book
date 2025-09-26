import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import InstallPWA from '@/components/InstallPWA.vue'

// Mock du composable useTheme
vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    isDark: false
  })
}))

describe('InstallPWA', () => {
  let wrapper

  beforeEach(() => {
    // Mock de localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
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
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('Tests de base', () => {
    it('devrait se monter correctement', () => {
      wrapper = mount(InstallPWA)
      expect(wrapper.exists()).toBe(true)
    })

    it('devrait être un composant Vue valide', () => {
      wrapper = mount(InstallPWA)
      expect(wrapper.vm).toBeDefined()
    })

    it('devrait avoir un nom de composant', () => {
      expect(InstallPWA.name).toBe('InstallPWA')
    })

    it('devrait utiliser le composable useTheme', () => {
      wrapper = mount(InstallPWA)
      expect(wrapper.vm.isDark).toBeDefined()
    })

    it('devrait avoir showInstallPrompt défini', () => {
      wrapper = mount(InstallPWA)
      expect(wrapper.vm.showInstallPrompt).toBeDefined()
    })

    it('devrait avoir les méthodes installApp et dismissPrompt', () => {
      wrapper = mount(InstallPWA)
      expect(typeof wrapper.vm.installApp).toBe('function')
      expect(typeof wrapper.vm.dismissPrompt).toBe('function')
    })

    it('devrait pouvoir appeler les méthodes sans erreur', () => {
      wrapper = mount(InstallPWA)
      expect(() => wrapper.vm.installApp()).not.toThrow()
      expect(() => wrapper.vm.dismissPrompt()).not.toThrow()
    })

    it('devrait initialiser avec showInstallPrompt à false', () => {
      wrapper = mount(InstallPWA)
      expect(wrapper.vm.showInstallPrompt).toBe(false)
    })
  })
})

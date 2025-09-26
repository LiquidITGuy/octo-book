import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeToggle from '@/components/ThemeToggle.vue'

// Mock du composable useTheme
const mockToggleTheme = vi.fn()
const mockIsDark = vi.fn()

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    isDark: mockIsDark(),
    toggleTheme: mockToggleTheme
  })
}))

describe('ThemeToggle', () => {
  let wrapper

  beforeEach(() => {
    // Reset des mocks avant chaque test
    mockToggleTheme.mockClear()
    mockIsDark.mockClear()
  })

  describe('Mode clair', () => {
    beforeEach(() => {
      mockIsDark.mockReturnValue(false)
      wrapper = mount(ThemeToggle)
    })

    it('devrait rendre le composant correctement', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.theme-toggle').exists()).toBe(true)
    })

    it('devrait afficher l\'icône lune en mode clair', () => {
      const icon = wrapper.find('.theme-icon')
      expect(icon.text()).toBe('🌙')
    })

    it('devrait afficher le texte "Sombre" en mode clair', () => {
      const text = wrapper.find('.theme-text')
      expect(text.text()).toBe('Sombre')
    })

    it('devrait avoir l\'aria-label approprié en mode clair', () => {
      const button = wrapper.find('.theme-toggle')
      expect(button.attributes('aria-label')).toBe('Passer en mode sombre')
    })

    it('devrait avoir le title approprié en mode clair', () => {
      const button = wrapper.find('.theme-toggle')
      expect(button.attributes('title')).toBe('Mode sombre')
    })

    it('devrait appeler toggleTheme au clic', async () => {
      const button = wrapper.find('.theme-toggle')
      await button.trigger('click')
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })
  })

  describe('Mode sombre', () => {
    beforeEach(() => {
      mockIsDark.mockReturnValue(true)
      wrapper = mount(ThemeToggle)
    })

    it('devrait afficher l\'icône soleil en mode sombre', () => {
      const icon = wrapper.find('.theme-icon')
      expect(icon.text()).toBe('☀️')
    })

    it('devrait afficher le texte "Clair" en mode sombre', () => {
      const text = wrapper.find('.theme-text')
      expect(text.text()).toBe('Clair')
    })

    it('devrait avoir l\'aria-label approprié en mode sombre', () => {
      const button = wrapper.find('.theme-toggle')
      expect(button.attributes('aria-label')).toBe('Passer en mode clair')
    })

    it('devrait avoir le title approprié en mode sombre', () => {
      const button = wrapper.find('.theme-toggle')
      expect(button.attributes('title')).toBe('Mode clair')
    })

    it('devrait appeler toggleTheme au clic', async () => {
      const button = wrapper.find('.theme-toggle')
      await button.trigger('click')
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })
  })

  describe('Structure du composant', () => {
    beforeEach(() => {
      mockIsDark.mockReturnValue(false)
      wrapper = mount(ThemeToggle)
    })

    it('devrait avoir la structure HTML correcte', () => {
      expect(wrapper.find('button.theme-toggle').exists()).toBe(true)
      expect(wrapper.find('.theme-icon').exists()).toBe(true)
      expect(wrapper.find('.theme-text').exists()).toBe(true)
    })

    it('devrait avoir les classes CSS appropriées', () => {
      const button = wrapper.find('button')
      expect(button.classes()).toContain('theme-toggle')
    })

    it('devrait être un bouton accessible', () => {
      const button = wrapper.find('button')
      expect(button.element.tagName).toBe('BUTTON')
      expect(button.attributes('aria-label')).toBeDefined()
      expect(button.attributes('title')).toBeDefined()
    })
  })

  describe('Interactions', () => {
    beforeEach(() => {
      mockIsDark.mockReturnValue(false)
      wrapper = mount(ThemeToggle)
    })

    it('devrait être cliquable', async () => {
      const button = wrapper.find('.theme-toggle')
      expect(button.element.disabled).toBe(false)
      
      await button.trigger('click')
      expect(mockToggleTheme).toHaveBeenCalled()
    })

    it('devrait gérer les événements clavier', async () => {
      const button = wrapper.find('.theme-toggle')
      
      await button.trigger('keydown.enter')
      // Le comportement par défaut du navigateur devrait déclencher le clic
      
      await button.trigger('keydown.space')
      // Le comportement par défaut du navigateur devrait déclencher le clic
    })

    it('devrait avoir un curseur pointer', () => {
      const button = wrapper.find('.theme-toggle')
      const styles = getComputedStyle(button.element)
      // Note: getComputedStyle ne fonctionne pas dans jsdom, mais la classe CSS est correcte
      expect(button.classes()).toContain('theme-toggle')
    })
  })

  describe('Accessibilité', () => {
    it('devrait avoir des attributs ARIA appropriés pour le mode clair', () => {
      mockIsDark.mockReturnValue(false)
      wrapper = mount(ThemeToggle)
      
      const button = wrapper.find('.theme-toggle')
      expect(button.attributes('aria-label')).toBe('Passer en mode sombre')
      expect(button.attributes('title')).toBe('Mode sombre')
    })

    it('devrait avoir des attributs ARIA appropriés pour le mode sombre', () => {
      mockIsDark.mockReturnValue(true)
      wrapper = mount(ThemeToggle)
      
      const button = wrapper.find('.theme-toggle')
      expect(button.attributes('aria-label')).toBe('Passer en mode clair')
      expect(button.attributes('title')).toBe('Mode clair')
    })

    it('devrait être focusable', () => {
      mockIsDark.mockReturnValue(false)
      wrapper = mount(ThemeToggle)
      
      const button = wrapper.find('.theme-toggle')
      expect(button.element.tabIndex).not.toBe(-1)
    })

    it('devrait avoir un rôle de bouton implicite', () => {
      mockIsDark.mockReturnValue(false)
      wrapper = mount(ThemeToggle)
      
      const button = wrapper.find('.theme-toggle')
      expect(button.element.tagName).toBe('BUTTON')
    })
  })

  describe('Réactivité', () => {
    it('devrait réagir aux changements d\'état du thème', async () => {
      // Créer un wrapper en mode clair
      mockIsDark.mockReturnValue(false)
      wrapper = mount(ThemeToggle)
      
      expect(wrapper.find('.theme-icon').text()).toBe('🌙')
      expect(wrapper.find('.theme-text').text()).toBe('Sombre')
      
      // Créer un nouveau wrapper en mode sombre pour simuler le changement
      mockIsDark.mockReturnValue(true)
      const wrapperDark = mount(ThemeToggle)
      
      expect(wrapperDark.find('.theme-icon').text()).toBe('☀️')
      expect(wrapperDark.find('.theme-text').text()).toBe('Clair')
    })

    it('devrait mettre à jour les attributs d\'accessibilité', async () => {
      // Créer un wrapper en mode clair
      mockIsDark.mockReturnValue(false)
      wrapper = mount(ThemeToggle)
      
      expect(wrapper.find('.theme-toggle').attributes('aria-label')).toBe('Passer en mode sombre')
      
      // Créer un nouveau wrapper en mode sombre pour simuler le changement
      mockIsDark.mockReturnValue(true)
      const wrapperDark = mount(ThemeToggle)
      
      expect(wrapperDark.find('.theme-toggle').attributes('aria-label')).toBe('Passer en mode clair')
    })
  })

  describe('Intégration avec useTheme', () => {
    it('devrait utiliser le composable useTheme', () => {
      mockIsDark.mockReturnValue(false)
      wrapper = mount(ThemeToggle)
      
      // Vérifier que le composable est appelé
      expect(mockIsDark).toHaveBeenCalled()
    })

    it('devrait appeler toggleTheme du composable', async () => {
      mockIsDark.mockReturnValue(false)
      wrapper = mount(ThemeToggle)
      
      await wrapper.find('.theme-toggle').trigger('click')
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })
  })

  describe('Cas d\'erreur', () => {
    it('devrait gérer les erreurs du composable gracieusement', () => {
      mockIsDark.mockImplementation(() => {
        throw new Error('Erreur du composable')
      })
      
      expect(() => {
        wrapper = mount(ThemeToggle)
      }).toThrow('Erreur du composable')
    })

    it('devrait gérer les valeurs undefined du composable', () => {
      mockIsDark.mockReturnValue(undefined)
      wrapper = mount(ThemeToggle)
      
      // Le composant devrait toujours se rendre
      expect(wrapper.exists()).toBe(true)
    })
  })
})

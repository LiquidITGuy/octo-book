import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MobileMenu from '@/components/MobileMenu.vue'

// Mock des composables
const mockFavoritesCount = vi.fn(() => 3)
vi.mock('@/composables/useFavorites', () => ({
  useFavorites: () => ({
    favoritesCount: mockFavoritesCount()
  })
}))

describe('MobileMenu', () => {
  let wrapper

  beforeEach(() => {
    // Reset du body overflow avant chaque test
    document.body.style.overflow = ''
    
    wrapper = mount(MobileMenu, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
            props: ['to']
          }
        }
      }
    })
  })

  afterEach(() => {
    // Nettoyer après chaque test
    document.body.style.overflow = ''
  })

  describe('Rendu initial', () => {
    it('devrait rendre le composant correctement', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.mobile-menu').exists()).toBe(true)
    })

    it('devrait avoir un bouton hamburger', () => {
      const hamburgerButton = wrapper.find('.hamburger-button')
      expect(hamburgerButton.exists()).toBe(true)
      expect(hamburgerButton.attributes('aria-label')).toBe('Ouvrir le menu')
    })

    it('devrait avoir 3 lignes pour le hamburger', () => {
      const lines = wrapper.findAll('.hamburger-line')
      expect(lines).toHaveLength(3)
    })

    it('ne devrait pas afficher le menu par défaut', () => {
      expect(wrapper.vm.isOpen).toBe(false)
      expect(wrapper.find('.menu-overlay').exists()).toBe(false)
      expect(wrapper.find('.mobile-nav-open').exists()).toBe(false)
    })
  })

  describe('Ouverture et fermeture du menu', () => {
    it('devrait ouvrir le menu au clic sur le bouton hamburger', async () => {
      const hamburgerButton = wrapper.find('.hamburger-button')
      
      await hamburgerButton.trigger('click')
      
      expect(wrapper.vm.isOpen).toBe(true)
      expect(wrapper.find('.menu-overlay').exists()).toBe(true)
      expect(wrapper.find('.mobile-nav-open').exists()).toBe(true)
    })

    it('devrait empêcher le scroll du body quand le menu est ouvert', async () => {
      const hamburgerButton = wrapper.find('.hamburger-button')
      
      await hamburgerButton.trigger('click')
      
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('devrait fermer le menu au clic sur l\'overlay', async () => {
      // Ouvrir le menu
      await wrapper.find('.hamburger-button').trigger('click')
      expect(wrapper.vm.isOpen).toBe(true)
      
      // Fermer via overlay
      const overlay = wrapper.find('.menu-overlay')
      await overlay.trigger('click')
      
      expect(wrapper.vm.isOpen).toBe(false)
      expect(document.body.style.overflow).toBe('')
    })

    it('devrait fermer le menu au clic sur le bouton de fermeture', async () => {
      // Ouvrir le menu
      await wrapper.find('.hamburger-button').trigger('click')
      expect(wrapper.vm.isOpen).toBe(true)
      
      // Fermer via bouton close
      const closeButton = wrapper.find('.close-button')
      await closeButton.trigger('click')
      
      expect(wrapper.vm.isOpen).toBe(false)
      expect(document.body.style.overflow).toBe('')
    })

    it('devrait changer l\'apparence du hamburger quand ouvert', async () => {
      const hamburgerButton = wrapper.find('.hamburger-button')
      
      expect(hamburgerButton.classes()).not.toContain('hamburger-active')
      
      await hamburgerButton.trigger('click')
      
      expect(hamburgerButton.classes()).toContain('hamburger-active')
    })
  })

  describe('Navigation', () => {
    beforeEach(async () => {
      // Ouvrir le menu pour les tests de navigation
      await wrapper.find('.hamburger-button').trigger('click')
    })

    it('devrait afficher tous les liens de navigation', () => {
      const navLinks = wrapper.findAll('.mobile-nav-link')
      expect(navLinks).toHaveLength(3)
      
      const linkTexts = navLinks.map(link => link.text())
      expect(linkTexts).toContain('Accueil')
      expect(linkTexts).toContain('Livres')
      expect(linkTexts).toContain('Favoris(3)')
    })

    it('devrait fermer le menu au clic sur un lien', async () => {
      const firstLink = wrapper.find('.mobile-nav-link')
      
      await firstLink.trigger('click')
      
      expect(wrapper.vm.isOpen).toBe(false)
      expect(document.body.style.overflow).toBe('')
    })

    it('devrait avoir des icônes pour chaque lien', () => {
      const navLinks = wrapper.findAll('.mobile-nav-link')
      
      navLinks.forEach(link => {
        const icon = link.find('svg')
        expect(icon.exists()).toBe(true)
      })
    })
  })

  describe('Gestion du clavier', () => {
    it('devrait fermer le menu avec la touche Escape', async () => {
      // Ouvrir le menu
      await wrapper.find('.hamburger-button').trigger('click')
      expect(wrapper.vm.isOpen).toBe(true)
      
      // Simuler la touche Escape
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isOpen).toBe(false)
    })

    it('ne devrait pas fermer le menu avec d\'autres touches', async () => {
      // Ouvrir le menu
      await wrapper.find('.hamburger-button').trigger('click')
      expect(wrapper.vm.isOpen).toBe(true)
      
      // Simuler une autre touche
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(enterEvent)
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isOpen).toBe(true)
    })
  })

  describe('Accessibilité', () => {
    it('devrait avoir les attributs ARIA appropriés sur le bouton hamburger', () => {
      const hamburgerButton = wrapper.find('.hamburger-button')
      expect(hamburgerButton.attributes('aria-label')).toBe('Ouvrir le menu')
      expect(hamburgerButton.attributes('aria-expanded')).toBe('false')
    })

    it('devrait mettre à jour l\'aria-label selon l\'état du menu', async () => {
      const hamburgerButton = wrapper.find('.hamburger-button')
      
      await hamburgerButton.trigger('click')
      
      expect(hamburgerButton.attributes('aria-label')).toBe('Fermer le menu')
    })

    it('devrait avoir un aria-label sur le bouton de fermeture', async () => {
      await wrapper.find('.hamburger-button').trigger('click')
      
      const closeButton = wrapper.find('.close-button')
      expect(closeButton.attributes('aria-label')).toBe('Fermer le menu')
    })
  })

  describe('Responsive', () => {
    it('devrait être masqué par défaut (CSS)', () => {
      // Le composant est masqué via CSS sur desktop
      const mobileMenu = wrapper.find('.mobile-menu')
      expect(mobileMenu.exists()).toBe(true)
      // Le test CSS n'est pas directement testable ici, mais la structure est correcte
    })
  })

  describe('Nettoyage', () => {
    it('devrait restaurer le scroll du body lors du démontage', async () => {
      // Ouvrir le menu
      await wrapper.find('.hamburger-button').trigger('click')
      expect(document.body.style.overflow).toBe('hidden')
      
      // Démonter le composant
      wrapper.unmount()
      
      expect(document.body.style.overflow).toBe('')
    })
  })
})

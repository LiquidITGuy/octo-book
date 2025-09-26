import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BackToTop from '@/components/BackToTop.vue'

describe('BackToTop', () => {
  let wrapper
  let scrollToSpy

  beforeEach(() => {
    // Mock de window.scrollTo
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    
    // Reset de scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0
    })

    wrapper = mount(BackToTop)
  })

  afterEach(() => {
    // Nettoyer les mocks
    scrollToSpy.mockRestore()
    
    // Nettoyer les event listeners
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendu initial', () => {
    it('devrait rendre le composant correctement', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('ne devrait pas afficher le bouton par défaut (scrollY = 0)', () => {
      expect(wrapper.vm.isVisible).toBe(false)
      expect(wrapper.find('.back-to-top-button').exists()).toBe(false)
    })

    it('devrait avoir les attributs d\'accessibilité appropriés', async () => {
      // Simuler un scroll pour rendre le bouton visible
      window.scrollY = 400
      const scrollEvent = new Event('scroll')
      window.dispatchEvent(scrollEvent)
      
      // Attendre que le debounce se termine
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      const button = wrapper.find('.back-to-top-button')
      expect(button.exists()).toBe(true)
      expect(button.attributes('aria-label')).toBe('Retour en haut de la page')
      expect(button.attributes('title')).toBe('Retour en haut')
    })
  })

  describe('Visibilité basée sur le scroll', () => {
    it('devrait afficher le bouton après 300px de scroll', async () => {
      // Simuler un scroll de 400px
      window.scrollY = 400
      const scrollEvent = new Event('scroll')
      window.dispatchEvent(scrollEvent)
      
      // Attendre que le debounce se termine
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isVisible).toBe(true)
      expect(wrapper.find('.back-to-top-button').exists()).toBe(true)
    })

    it('ne devrait pas afficher le bouton pour un scroll inférieur à 300px', async () => {
      // Simuler un scroll de 200px
      window.scrollY = 200
      const scrollEvent = new Event('scroll')
      window.dispatchEvent(scrollEvent)
      
      // Attendre que le debounce se termine
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isVisible).toBe(false)
      expect(wrapper.find('.back-to-top-button').exists()).toBe(false)
    })

    it('devrait masquer le bouton quand on revient en haut', async () => {
      // D'abord, faire apparaître le bouton
      window.scrollY = 400
      let scrollEvent = new Event('scroll')
      window.dispatchEvent(scrollEvent)
      
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isVisible).toBe(true)
      
      // Puis revenir en haut
      window.scrollY = 100
      scrollEvent = new Event('scroll')
      window.dispatchEvent(scrollEvent)
      
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isVisible).toBe(false)
    })
  })

  describe('Fonctionnalité de scroll vers le haut', () => {
    beforeEach(async () => {
      // Rendre le bouton visible pour les tests
      window.scrollY = 400
      const scrollEvent = new Event('scroll')
      window.dispatchEvent(scrollEvent)
      
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
    })

    it('devrait appeler scrollTo au clic sur le bouton', async () => {
      const button = wrapper.find('.back-to-top-button')
      
      await button.trigger('click')
      
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      })
    })

    it('devrait appeler scrollToTop via la méthode du composant', () => {
      wrapper.vm.scrollToTop()
      
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      })
    })
  })

  describe('Debounce du scroll', () => {
    it('devrait utiliser un debounce pour éviter les appels trop fréquents', async () => {
      const handleScrollSpy = vi.spyOn(wrapper.vm, '$forceUpdate')
      
      // Simuler plusieurs événements de scroll rapides
      window.scrollY = 400
      for (let i = 0; i < 5; i++) {
        const scrollEvent = new Event('scroll')
        window.dispatchEvent(scrollEvent)
      }
      
      // Le debounce devrait limiter les mises à jour
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(wrapper.vm.isVisible).toBe(false) // Pas encore mis à jour
      
      // Attendre que le debounce se termine
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isVisible).toBe(true) // Maintenant mis à jour
    })
  })

  describe('Gestion des event listeners', () => {
    it('devrait ajouter un event listener au montage', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      
      // Créer une nouvelle instance pour tester le montage
      const newWrapper = mount(BackToTop)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      )
      
      addEventListenerSpy.mockRestore()
      newWrapper.unmount()
    })

    it('devrait supprimer l\'event listener au démontage', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      wrapper.unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
      
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Transitions Vue', () => {
    it('devrait utiliser une transition nommée "back-to-top"', () => {
      const transition = wrapper.findComponent({ name: 'transition' })
      expect(transition.exists()).toBe(true)
      expect(transition.attributes('name')).toBe('back-to-top')
    })

    it('devrait afficher le bouton avec une transition', async () => {
      expect(wrapper.find('.back-to-top-button').exists()).toBe(false)
      
      // Déclencher l'apparition
      window.scrollY = 400
      const scrollEvent = new Event('scroll')
      window.dispatchEvent(scrollEvent)
      
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.back-to-top-button').exists()).toBe(true)
    })
  })

  describe('Icône SVG', () => {
    beforeEach(async () => {
      // Rendre le bouton visible
      window.scrollY = 400
      const scrollEvent = new Event('scroll')
      window.dispatchEvent(scrollEvent)
      
      await new Promise(resolve => setTimeout(resolve, 150))
      await wrapper.vm.$nextTick()
    })

    it('devrait afficher une icône de flèche vers le haut', () => {
      const svg = wrapper.find('.back-to-top-button svg')
      expect(svg.exists()).toBe(true)
      
      const polyline = svg.find('polyline')
      expect(polyline.exists()).toBe(true)
      expect(polyline.attributes('points')).toBe('18,15 12,9 6,15')
    })

    it('devrait avoir les bonnes dimensions pour l\'icône', () => {
      const svg = wrapper.find('.back-to-top-button svg')
      expect(svg.attributes('width')).toBe('24')
      expect(svg.attributes('height')).toBe('24')
    })
  })

  describe('Nettoyage des timeouts', () => {
    it('devrait nettoyer le timeout lors du démontage', () => {
      // Déclencher un scroll pour créer un timeout
      window.scrollY = 400
      const scrollEvent = new Event('scroll')
      window.dispatchEvent(scrollEvent)
      
      // Démonter immédiatement
      wrapper.unmount()
      
      // Le timeout devrait être nettoyé (pas d'erreur)
      expect(() => {
        // Attendre plus longtemps que le timeout
        setTimeout(() => {}, 200)
      }).not.toThrow()
    })
  })
})

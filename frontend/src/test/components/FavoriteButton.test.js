import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FavoriteButton from '@/components/FavoriteButton.vue'

// Mock du composable useFavorites
const mockToggleFavorite = vi.fn()
const mockIsFavorite = vi.fn()

vi.mock('@/composables/useFavorites', () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    isFavorite: mockIsFavorite
  })
}))

describe('FavoriteButton', () => {
  let wrapper

  beforeEach(() => {
    // Reset des mocks avant chaque test
    mockToggleFavorite.mockClear()
    mockIsFavorite.mockClear()
  })

  describe('Props et rendu initial', () => {
    it('devrait rendre le composant correctement', () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.favorite-button').exists()).toBe(true)
    })

    it('devrait accepter bookId comme string', () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      expect(wrapper.props('bookId')).toBe('123')
    })

    it('devrait accepter bookId comme number', () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: 123 }
      })

      expect(wrapper.props('bookId')).toBe(123)
    })

    it('devrait avoir showText à false par défaut', () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      expect(wrapper.props('showText')).toBe(false)
      expect(wrapper.find('.favorite-text').exists()).toBe(false)
    })

    it('devrait afficher le texte quand showText est true', () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { 
          bookId: '123',
          showText: true
        }
      })

      expect(wrapper.find('.favorite-text').exists()).toBe(true)
    })
  })

  describe('État non favori', () => {
    beforeEach(() => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })
    })

    it('devrait afficher l\'icône cœur vide', () => {
      const icon = wrapper.find('.favorite-icon')
      expect(icon.text()).toBe('🤍')
    })

    it('devrait avoir l\'aria-label approprié', () => {
      const button = wrapper.find('.favorite-button')
      expect(button.attributes('aria-label')).toBe('Ajouter aux favoris')
    })

    it('devrait avoir le title approprié', () => {
      const button = wrapper.find('.favorite-button')
      expect(button.attributes('title')).toBe('Ajouter aux favoris')
    })

    it('ne devrait pas avoir la classe is-favorite', () => {
      const button = wrapper.find('.favorite-button')
      expect(button.classes()).not.toContain('is-favorite')
    })

    it('devrait afficher "Ajouter" comme texte', () => {
      wrapper = mount(FavoriteButton, {
        props: { 
          bookId: '123',
          showText: true
        }
      })

      const text = wrapper.find('.favorite-text')
      expect(text.text()).toBe('Ajouter')
    })
  })

  describe('État favori', () => {
    beforeEach(() => {
      mockIsFavorite.mockReturnValue(true)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })
    })

    it('devrait afficher l\'icône cœur plein', () => {
      const icon = wrapper.find('.favorite-icon')
      expect(icon.text()).toBe('❤️')
    })

    it('devrait avoir l\'aria-label approprié', () => {
      const button = wrapper.find('.favorite-button')
      expect(button.attributes('aria-label')).toBe('Retirer des favoris')
    })

    it('devrait avoir le title approprié', () => {
      const button = wrapper.find('.favorite-button')
      expect(button.attributes('title')).toBe('Retirer des favoris')
    })

    it('devrait avoir la classe is-favorite', () => {
      const button = wrapper.find('.favorite-button')
      expect(button.classes()).toContain('is-favorite')
    })

    it('devrait afficher "Favori" comme texte', () => {
      wrapper = mount(FavoriteButton, {
        props: { 
          bookId: '123',
          showText: true
        }
      })

      const text = wrapper.find('.favorite-text')
      expect(text.text()).toBe('Favori')
    })
  })

  describe('Interactions', () => {
    beforeEach(() => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })
    })

    it('devrait appeler toggleFavorite au clic', async () => {
      const button = wrapper.find('.favorite-button')
      await button.trigger('click')

      expect(mockToggleFavorite).toHaveBeenCalledWith('123')
    })

    it('devrait émettre l\'événement favoriteToggled au clic', async () => {
      const button = wrapper.find('.favorite-button')
      await button.trigger('click')

      const emittedEvents = wrapper.emitted('favoriteToggled')
      expect(emittedEvents).toHaveLength(1)
      expect(emittedEvents[0][0]).toEqual({
        bookId: '123',
        isFavorite: false
      })
    })

    it('devrait émettre l\'événement avec le bon état après toggle', async () => {
      // Simuler que le livre devient favori après le toggle
      mockIsFavorite.mockReturnValue(true)
      
      const button = wrapper.find('.favorite-button')
      await button.trigger('click')

      const emittedEvents = wrapper.emitted('favoriteToggled')
      expect(emittedEvents[0][0]).toEqual({
        bookId: '123',
        isFavorite: true
      })
    })

    it('devrait être cliquable plusieurs fois', async () => {
      const button = wrapper.find('.favorite-button')
      
      await button.trigger('click')
      await button.trigger('click')
      await button.trigger('click')

      expect(mockToggleFavorite).toHaveBeenCalledTimes(3)
      expect(wrapper.emitted('favoriteToggled')).toHaveLength(3)
    })
  })

  describe('Structure HTML', () => {
    beforeEach(() => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })
    })

    it('devrait avoir la structure HTML correcte', () => {
      expect(wrapper.find('button.favorite-button').exists()).toBe(true)
      expect(wrapper.find('.favorite-icon').exists()).toBe(true)
    })

    it('devrait être un bouton accessible', () => {
      const button = wrapper.find('button')
      expect(button.element.tagName).toBe('BUTTON')
      expect(button.attributes('aria-label')).toBeDefined()
      expect(button.attributes('title')).toBeDefined()
    })

    it('devrait avoir les bonnes classes CSS', () => {
      const button = wrapper.find('button')
      expect(button.classes()).toContain('favorite-button')
    })
  })

  describe('Accessibilité', () => {
    it('devrait avoir des attributs ARIA appropriés pour l\'état non favori', () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      const button = wrapper.find('.favorite-button')
      expect(button.attributes('aria-label')).toBe('Ajouter aux favoris')
      expect(button.attributes('title')).toBe('Ajouter aux favoris')
    })

    it('devrait avoir des attributs ARIA appropriés pour l\'état favori', () => {
      mockIsFavorite.mockReturnValue(true)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      const button = wrapper.find('.favorite-button')
      expect(button.attributes('aria-label')).toBe('Retirer des favoris')
      expect(button.attributes('title')).toBe('Retirer des favoris')
    })

    it('devrait être focusable', () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      const button = wrapper.find('.favorite-button')
      expect(button.element.tabIndex).not.toBe(-1)
    })

    it('devrait avoir une taille minimale pour l\'accessibilité tactile', () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      const button = wrapper.find('.favorite-button')
      // Les styles CSS définissent min-width: 44px et min-height: 44px
      expect(button.classes()).toContain('favorite-button')
    })
  })

  describe('Réactivité', () => {
    it('devrait réagir aux changements d\'état des favoris', async () => {
      // Commencer en non favori
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      expect(wrapper.find('.favorite-icon').text()).toBe('🤍')
      expect(wrapper.find('.favorite-button').classes()).not.toContain('is-favorite')

      // Simuler le passage en favori
      mockIsFavorite.mockReturnValue(true)
      await wrapper.vm.$forceUpdate()

      expect(wrapper.find('.favorite-icon').text()).toBe('❤️')
      expect(wrapper.find('.favorite-button').classes()).toContain('is-favorite')
    })

    it('devrait mettre à jour les attributs d\'accessibilité', async () => {
      // Commencer en non favori
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      expect(wrapper.find('.favorite-button').attributes('aria-label')).toBe('Ajouter aux favoris')

      // Simuler le passage en favori
      mockIsFavorite.mockReturnValue(true)
      await wrapper.vm.$forceUpdate()

      expect(wrapper.find('.favorite-button').attributes('aria-label')).toBe('Retirer des favoris')
    })
  })

  describe('Intégration avec useFavorites', () => {
    it('devrait utiliser le composable useFavorites', () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      // Vérifier que le composable est appelé avec le bon bookId
      expect(mockIsFavorite).toHaveBeenCalledWith('123')
    })

    it('devrait appeler toggleFavorite avec le bon bookId', async () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: 456 }
      })

      await wrapper.find('.favorite-button').trigger('click')

      expect(mockToggleFavorite).toHaveBeenCalledWith(456)
    })
  })

  describe('Props validation', () => {
    it('devrait accepter différents types de bookId', () => {
      // String
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: 'abc-123' }
      })
      expect(wrapper.props('bookId')).toBe('abc-123')

      // Number
      wrapper = mount(FavoriteButton, {
        props: { bookId: 999 }
      })
      expect(wrapper.props('bookId')).toBe(999)
    })

    it('devrait gérer showText correctement', () => {
      mockIsFavorite.mockReturnValue(false)
      
      // showText false
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123', showText: false }
      })
      expect(wrapper.find('.favorite-text').exists()).toBe(false)

      // showText true
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123', showText: true }
      })
      expect(wrapper.find('.favorite-text').exists()).toBe(true)
    })
  })

  describe('Événements', () => {
    it('devrait émettre favoriteToggled avec les bonnes données', async () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: 'test-book' }
      })

      await wrapper.find('.favorite-button').trigger('click')

      const events = wrapper.emitted('favoriteToggled')
      expect(events).toHaveLength(1)
      expect(events[0][0]).toEqual({
        bookId: 'test-book',
        isFavorite: false
      })
    })

    it('devrait émettre principalement l\'événement favoriteToggled', async () => {
      mockIsFavorite.mockReturnValue(false)
      wrapper = mount(FavoriteButton, {
        props: { bookId: '123' }
      })

      await wrapper.find('.favorite-button').trigger('click')

      const allEvents = wrapper.emitted()
      expect(allEvents['favoriteToggled']).toBeDefined()
      expect(allEvents['favoriteToggled']).toHaveLength(1)
    })
  })
})

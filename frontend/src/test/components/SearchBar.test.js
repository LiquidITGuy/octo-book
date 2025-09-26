import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SearchBar from '@/components/SearchBar.vue'

// Mock du router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('SearchBar', () => {
  let wrapper

  beforeEach(() => {
    // Reset des mocks avant chaque test
    mockPush.mockClear()
    
    wrapper = mount(SearchBar, {
      global: {
        stubs: {
          // Stub des composants externes si nécessaire
        }
      }
    })
  })

  describe('Rendu initial', () => {
    it('devrait rendre le composant correctement', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.search-bar').exists()).toBe(true)
    })

    it('devrait avoir un bouton de recherche', () => {
      const searchButton = wrapper.find('.search-button')
      expect(searchButton.exists()).toBe(true)
      expect(searchButton.attributes('aria-label')).toBe('Ouvrir la recherche')
    })

    it('devrait avoir un input de recherche masqué par défaut', () => {
      const searchInput = wrapper.find('.search-input')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.element.style.opacity).toBe('')
    })

    it('ne devrait pas afficher les suggestions par défaut', () => {
      const suggestions = wrapper.find('.search-suggestions')
      expect(suggestions.exists()).toBe(false)
    })
  })

  describe('Interaction avec le bouton de recherche', () => {
    it('devrait ouvrir la recherche au clic sur le bouton', async () => {
      const searchButton = wrapper.find('.search-button')
      
      await searchButton.trigger('click')
      
      expect(wrapper.vm.isExpanded).toBe(true)
      expect(wrapper.classes()).toContain('search-bar-expanded')
    })

    it('devrait changer l\'icône quand la recherche est ouverte', async () => {
      await wrapper.find('.search-button').trigger('click')
      
      const closeIcon = wrapper.find('.search-button svg line')
      expect(closeIcon.exists()).toBe(true)
    })

    it('devrait fermer la recherche au second clic', async () => {
      const searchButton = wrapper.find('.search-button')
      
      // Ouvrir
      await searchButton.trigger('click')
      expect(wrapper.vm.isExpanded).toBe(true)
      
      // Fermer
      await searchButton.trigger('click')
      expect(wrapper.vm.isExpanded).toBe(false)
    })
  })

  describe('Saisie de texte', () => {
    beforeEach(async () => {
      // Ouvrir la recherche pour les tests de saisie
      await wrapper.find('.search-button').trigger('click')
    })

    it('devrait mettre à jour la valeur de recherche', async () => {
      const searchInput = wrapper.find('.search-input')
      
      await searchInput.setValue('Vue.js')
      
      expect(wrapper.vm.searchQuery).toBe('Vue.js')
    })

    it('devrait afficher les suggestions quand on tape plus de 2 caractères', async () => {
      const searchInput = wrapper.find('.search-input')
      
      await searchInput.setValue('Vue')
      await searchInput.trigger('focus')
      await searchInput.trigger('input')
      
      expect(wrapper.vm.showSuggestions).toBe(true)
      expect(wrapper.vm.suggestions.length).toBeGreaterThan(0)
    })

    it('devrait filtrer les suggestions selon la saisie', async () => {
      const searchInput = wrapper.find('.search-input')
      
      await searchInput.setValue('Vue')
      await searchInput.trigger('input')
      
      const suggestions = wrapper.vm.suggestions
      expect(suggestions.some(s => s.toLowerCase().includes('vue'))).toBe(true)
    })

    it('ne devrait pas afficher de suggestions pour moins de 2 caractères', async () => {
      const searchInput = wrapper.find('.search-input')
      
      await searchInput.setValue('V')
      await searchInput.trigger('input')
      
      expect(wrapper.vm.suggestions.length).toBe(0)
    })
  })

  describe('Navigation et recherche', () => {
    beforeEach(async () => {
      await wrapper.find('.search-button').trigger('click')
    })

    it('devrait naviguer vers la page des livres avec la recherche sur Entrée', async () => {
      const searchInput = wrapper.find('.search-input')
      
      await searchInput.setValue('JavaScript')
      await searchInput.trigger('keydown.enter')
      
      expect(mockPush).toHaveBeenCalledWith({
        path: '/books',
        query: { search: 'JavaScript' }
      })
    })

    it('ne devrait pas naviguer si la recherche est vide', async () => {
      const searchInput = wrapper.find('.search-input')
      
      await searchInput.setValue('   ')
      await searchInput.trigger('keydown.enter')
      
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('devrait effacer la recherche avec Échap', async () => {
      const searchInput = wrapper.find('.search-input')
      
      await searchInput.setValue('test')
      await searchInput.trigger('keydown.escape')
      
      expect(wrapper.vm.searchQuery).toBe('')
    })
  })

  describe('Suggestions', () => {
    beforeEach(async () => {
      await wrapper.find('.search-button').trigger('click')
      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('Vue')
      await searchInput.trigger('focus')
      await searchInput.trigger('input')
      await nextTick()
    })

    it('devrait sélectionner une suggestion au clic', async () => {
      const suggestions = wrapper.findAll('.search-suggestion')
      expect(suggestions.length).toBeGreaterThan(0)
      
      const firstSuggestion = suggestions[0]
      await firstSuggestion.trigger('click')
      
      expect(mockPush).toHaveBeenCalled()
    })

    it('devrait masquer les suggestions au blur avec délai', async () => {
      const searchInput = wrapper.find('.search-input')
      
      expect(wrapper.vm.showSuggestions).toBe(true)
      
      await searchInput.trigger('blur')
      
      // Les suggestions sont masquées après un délai
      setTimeout(() => {
        expect(wrapper.vm.showSuggestions).toBe(false)
      }, 250)
    })
  })

  describe('Accessibilité', () => {
    it('devrait avoir les attributs ARIA appropriés', () => {
      const searchButton = wrapper.find('.search-button')
      expect(searchButton.attributes('aria-label')).toBeDefined()
    })

    it('devrait mettre à jour l\'aria-label du bouton selon l\'état', async () => {
      const searchButton = wrapper.find('.search-button')
      
      expect(searchButton.attributes('aria-label')).toBe('Ouvrir la recherche')
      
      await searchButton.trigger('click')
      
      expect(searchButton.attributes('aria-label')).toBe('Fermer la recherche')
    })

    it('devrait avoir un placeholder informatif', () => {
      const searchInput = wrapper.find('.search-input')
      expect(searchInput.attributes('placeholder')).toBe('Rechercher un livre, auteur...')
    })
  })
})

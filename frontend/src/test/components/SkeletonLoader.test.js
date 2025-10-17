import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

describe('SkeletonLoader', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('Rendu de base', () => {
    it('devrait se monter correctement', () => {
      wrapper = mount(SkeletonLoader)
      expect(wrapper.exists()).toBe(true)
    })

    it('devrait avoir la classe skeleton-loader', () => {
      wrapper = mount(SkeletonLoader)
      expect(wrapper.find('.skeleton-loader').exists()).toBe(true)
    })
  })

  describe('Props par défaut', () => {
    it('devrait utiliser book-card comme type par défaut', () => {
      wrapper = mount(SkeletonLoader)
      expect(wrapper.find('.skeleton-book-card').exists()).toBe(true)
    })

    it('devrait utiliser 6 comme count par défaut', () => {
      wrapper = mount(SkeletonLoader, {
        props: { type: 'books-grid' }
      })
      const bookCards = wrapper.findAll('.skeleton-book-card')
      expect(bookCards).toHaveLength(6)
    })
  })

  describe('Type book-card', () => {
    beforeEach(() => {
      wrapper = mount(SkeletonLoader, {
        props: { type: 'book-card' }
      })
    })

    it('devrait afficher le skeleton book-card', () => {
      expect(wrapper.find('.skeleton-book-card').exists()).toBe(true)
    })

    it('devrait avoir les éléments principaux', () => {
      expect(wrapper.find('.skeleton-thumbnail').exists()).toBe(true)
      expect(wrapper.find('.skeleton-content').exists()).toBe(true)
      expect(wrapper.find('.skeleton-title').exists()).toBe(true)
      expect(wrapper.find('.skeleton-author').exists()).toBe(true)
    })
  })

  describe('Type book-detail', () => {
    beforeEach(() => {
      wrapper = mount(SkeletonLoader, {
        props: { type: 'book-detail' }
      })
    })

    it('devrait afficher le skeleton book-detail', () => {
      expect(wrapper.find('.skeleton-book-detail').exists()).toBe(true)
    })

    it('devrait avoir les éléments du détail', () => {
      expect(wrapper.find('.skeleton-breadcrumb').exists()).toBe(true)
      expect(wrapper.find('.skeleton-detail-content').exists()).toBe(true)
      expect(wrapper.find('.skeleton-detail-image').exists()).toBe(true)
    })
  })

  describe('Type list', () => {
    it('devrait afficher le skeleton list avec le count par défaut', () => {
      wrapper = mount(SkeletonLoader, {
        props: { type: 'list' }
      })
      
      expect(wrapper.find('.skeleton-list').exists()).toBe(true)
      const items = wrapper.findAll('.skeleton-list-item')
      expect(items).toHaveLength(6)
    })

    it('devrait respecter le count personnalisé', () => {
      wrapper = mount(SkeletonLoader, {
        props: { type: 'list', count: 3 }
      })
      
      const items = wrapper.findAll('.skeleton-list-item')
      expect(items).toHaveLength(3)
    })
  })

  describe('Type books-grid', () => {
    it('devrait afficher la grille avec le count par défaut', () => {
      wrapper = mount(SkeletonLoader, {
        props: { type: 'books-grid' }
      })
      
      expect(wrapper.find('.skeleton-books-grid').exists()).toBe(true)
      const cards = wrapper.findAll('.skeleton-book-card')
      expect(cards).toHaveLength(6)
    })

    it('devrait respecter le count personnalisé', () => {
      wrapper = mount(SkeletonLoader, {
        props: { type: 'books-grid', count: 4 }
      })
      
      const cards = wrapper.findAll('.skeleton-book-card')
      expect(cards).toHaveLength(4)
    })
  })

  describe('Validation des props', () => {
    it('devrait accepter les types valides', () => {
      const validTypes = ['book-card', 'book-detail', 'list', 'books-grid']
      
      validTypes.forEach(type => {
        wrapper = mount(SkeletonLoader, {
          props: { type }
        })
        expect(wrapper.exists()).toBe(true)
        wrapper.unmount()
      })
    })

    it('devrait avoir un validateur pour le type', () => {
      const component = SkeletonLoader
      const typeValidator = component.props.type.validator
      
      expect(typeValidator('book-card')).toBe(true)
      expect(typeValidator('book-detail')).toBe(true)
      expect(typeValidator('list')).toBe(true)
      expect(typeValidator('books-grid')).toBe(true)
      expect(typeValidator('invalid-type')).toBe(false)
    })
  })

  describe('Performance', () => {
    it('devrait gérer un grand nombre d\'éléments', () => {
      wrapper = mount(SkeletonLoader, {
        props: { type: 'books-grid', count: 20 }
      })
      
      const cards = wrapper.findAll('.skeleton-book-card')
      expect(cards).toHaveLength(20)
    })

    it('devrait gérer un count de 0', () => {
      wrapper = mount(SkeletonLoader, {
        props: { type: 'list', count: 0 }
      })
      
      const items = wrapper.findAll('.skeleton-list-item')
      expect(items).toHaveLength(0)
    })
  })
})

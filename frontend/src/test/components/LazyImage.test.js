import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LazyImage from '@/components/LazyImage.vue'

// Mock de IntersectionObserver
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
const mockUnobserve = vi.fn()

const createMockIntersectionObserver = (callback) => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  unobserve: mockUnobserve,
  callback
})

// Mock global de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => {
  const observer = createMockIntersectionObserver(callback)
  observer.options = options
  return observer
})

// Mock de Image pour contrôler le chargement
const mockImageLoad = vi.fn()
const mockImageError = vi.fn()

global.Image = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  set onload(fn) { mockImageLoad.mockImplementation(fn) },
  set onerror(fn) { mockImageError.mockImplementation(fn) },
  set src(value) { 
    // Simuler le chargement asynchrone
    setTimeout(() => {
      if (value.includes('error')) {
        mockImageError()
      } else {
        mockImageLoad()
      }
    }, 0)
  }
}))

describe('LazyImage', () => {
  let wrapper

  beforeEach(() => {
    // Reset des mocks avant chaque test
    mockObserve.mockClear()
    mockDisconnect.mockClear()
    mockUnobserve.mockClear()
    mockImageLoad.mockClear()
    mockImageError.mockClear()
    global.IntersectionObserver.mockClear()
    global.Image.mockClear()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Props et rendu initial', () => {
    it('devrait rendre le composant correctement', () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.lazy-image-container').exists()).toBe(true)
    })

    it('devrait afficher le placeholder par défaut', () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      expect(wrapper.find('.lazy-placeholder').exists()).toBe(true)
      expect(wrapper.find('.lazy-skeleton').exists()).toBe(true)
      expect(wrapper.find('.lazy-icon').exists()).toBe(true)
    })

    it('devrait accepter toutes les props', () => {
      wrapper = mount(LazyImage, {
        props: {
          src: 'test-image.jpg',
          alt: 'Test image',
          imageClass: 'custom-class',
          showIcon: false,
          showErrorText: true,
          nativeLazy: true,
          rootMargin: '100px',
          threshold: 0.5
        }
      })

      expect(wrapper.props('src')).toBe('test-image.jpg')
      expect(wrapper.props('alt')).toBe('Test image')
      expect(wrapper.props('imageClass')).toBe('custom-class')
      expect(wrapper.props('showIcon')).toBe(false)
      expect(wrapper.props('showErrorText')).toBe(true)
      expect(wrapper.props('nativeLazy')).toBe(true)
      expect(wrapper.props('rootMargin')).toBe('100px')
      expect(wrapper.props('threshold')).toBe(0.5)
    })

    it('devrait avoir des valeurs par défaut appropriées', () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      expect(wrapper.props('alt')).toBe('')
      expect(wrapper.props('imageClass')).toBe('')
      expect(wrapper.props('showIcon')).toBe(true)
      expect(wrapper.props('showErrorText')).toBe(false)
      expect(wrapper.props('nativeLazy')).toBe(false)
      expect(wrapper.props('rootMargin')).toBe('50px')
      expect(wrapper.props('threshold')).toBe(0.1)
    })
  })

  describe('IntersectionObserver', () => {
    it('devrait créer un IntersectionObserver au montage', () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      )
    })

    it('devrait observer l\'élément target', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      await nextTick()
      expect(mockObserve).toHaveBeenCalled()
    })

    it('devrait utiliser les options personnalisées', () => {
      wrapper = mount(LazyImage, {
        props: {
          src: 'test-image.jpg',
          rootMargin: '100px',
          threshold: 0.5
        }
      })

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          rootMargin: '100px',
          threshold: 0.5
        }
      )
    })

    it('devrait déconnecter l\'observer au démontage', () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      wrapper.unmount()
      expect(mockDisconnect).toHaveBeenCalled()
    })
  })

  describe('Chargement d\'image', () => {
    it('devrait charger l\'image quand elle devient visible', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      // Simuler l'intersection
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      expect(global.Image).toHaveBeenCalled()
    })

    it('devrait afficher l\'image après chargement réussi', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      // Simuler l'intersection et le chargement
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      expect(wrapper.find('img').exists()).toBe(true)
      expect(wrapper.find('.lazy-placeholder').exists()).toBe(false)
      expect(wrapper.classes()).toContain('loaded')
    })

    it('devrait émettre l\'événement load après chargement réussi', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      // Simuler l'intersection et le chargement
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      expect(wrapper.emitted('load')).toHaveLength(1)
    })
  })

  describe('Gestion d\'erreur', () => {
    it('devrait afficher l\'état d\'erreur en cas d\'échec de chargement', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'error-image.jpg' }
      })

      // Simuler l'intersection et l'erreur
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      expect(wrapper.find('.lazy-error').exists()).toBe(true)
      expect(wrapper.find('.lazy-error-icon').exists()).toBe(true)
      expect(wrapper.classes()).toContain('error')
    })

    it('devrait afficher le texte d\'erreur si showErrorText est true', async () => {
      wrapper = mount(LazyImage, {
        props: { 
          src: 'error-image.jpg',
          showErrorText: true
        }
      })

      // Simuler l'intersection et l'erreur
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      expect(wrapper.find('.lazy-error-text').exists()).toBe(true)
      expect(wrapper.find('.lazy-error-text').text()).toBe('Image non disponible')
    })

    it('devrait émettre l\'événement error en cas d\'échec', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'error-image.jpg' }
      })

      // Simuler l'intersection et l'erreur
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      expect(wrapper.emitted('error')).toHaveLength(1)
    })
  })

  describe('Options d\'affichage', () => {
    it('devrait masquer l\'icône si showIcon est false', () => {
      wrapper = mount(LazyImage, {
        props: { 
          src: 'test-image.jpg',
          showIcon: false
        }
      })

      expect(wrapper.find('.lazy-icon').exists()).toBe(false)
    })

    it('devrait appliquer la classe CSS personnalisée à l\'image', async () => {
      wrapper = mount(LazyImage, {
        props: { 
          src: 'test-image.jpg',
          imageClass: 'custom-image-class'
        }
      })

      // Simuler l'intersection et le chargement
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      const img = wrapper.find('img')
      expect(img.classes()).toContain('custom-image-class')
    })

    it('devrait définir l\'attribut alt de l\'image', async () => {
      wrapper = mount(LazyImage, {
        props: { 
          src: 'test-image.jpg',
          alt: 'Description de l\'image'
        }
      })

      // Simuler l'intersection et le chargement
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Description de l\'image')
    })
  })

  describe('Lazy loading natif', () => {
    it('devrait utiliser loading="lazy" si nativeLazy est true', async () => {
      wrapper = mount(LazyImage, {
        props: { 
          src: 'test-image.jpg',
          nativeLazy: true
        }
      })

      // Simuler l'intersection et le chargement
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      const img = wrapper.find('img')
      expect(img.attributes('loading')).toBe('lazy')
    })

    it('devrait utiliser loading="eager" si nativeLazy est false', async () => {
      wrapper = mount(LazyImage, {
        props: { 
          src: 'test-image.jpg',
          nativeLazy: false
        }
      })

      // Simuler l'intersection et le chargement
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      const img = wrapper.find('img')
      expect(img.attributes('loading')).toBe('eager')
    })
  })

  describe('Changement de src', () => {
    it('devrait recharger l\'image quand src change', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'image1.jpg' }
      })

      // Changer la src
      await wrapper.setProps({ src: 'image2.jpg' })

      // Vérifier que l'observer est recréé
      expect(mockDisconnect).toHaveBeenCalled()
      expect(global.IntersectionObserver).toHaveBeenCalledTimes(2)
    })

    it('devrait réinitialiser l\'état lors du changement de src', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'image1.jpg' }
      })

      // Simuler le chargement de la première image
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      expect(wrapper.classes()).toContain('loaded')

      // Changer la src
      await wrapper.setProps({ src: 'image2.jpg' })
      await nextTick()

      // L'état devrait être réinitialisé
      expect(wrapper.classes()).not.toContain('loaded')
      expect(wrapper.find('.lazy-placeholder').exists()).toBe(true)
    })
  })

  describe('Fallback sans IntersectionObserver', () => {
    it('devrait charger l\'image immédiatement si IntersectionObserver n\'est pas disponible', async () => {
      // Temporairement désactiver IntersectionObserver
      const originalIO = global.IntersectionObserver
      global.IntersectionObserver = undefined

      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      await nextTick()
      expect(global.Image).toHaveBeenCalled()

      // Restaurer IntersectionObserver
      global.IntersectionObserver = originalIO
    })
  })

  describe('Événements d\'image', () => {
    it('devrait gérer l\'événement load de l\'image', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      // Simuler l'intersection et le chargement
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      // Simuler l'événement load de l'image
      const img = wrapper.find('img')
      await img.trigger('load')

      // Vérifier qu'au moins un événement load a été émis
      const loadEvents = wrapper.emitted('load')
      expect(loadEvents).toBeTruthy()
      expect(loadEvents.length).toBeGreaterThan(0)
    })

    it('devrait gérer l\'événement error de l\'image', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      // Simuler l'intersection et le chargement
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      // Simuler l'événement error de l'image
      const img = wrapper.find('img')
      await img.trigger('error')

      expect(wrapper.emitted('error')).toHaveLength(1)
    })
  })

  describe('États CSS', () => {
    it('devrait avoir la classe loaded après chargement', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'test-image.jpg' }
      })

      // Simuler l'intersection et le chargement
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      expect(wrapper.classes()).toContain('loaded')
    })

    it('devrait avoir la classe error en cas d\'erreur', async () => {
      wrapper = mount(LazyImage, {
        props: { src: 'error-image.jpg' }
      })

      // Simuler l'intersection et l'erreur
      const observerCallback = global.IntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true }])

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))
      await nextTick()

      expect(wrapper.classes()).toContain('error')
    })
  })
})

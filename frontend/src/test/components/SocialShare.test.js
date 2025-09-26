import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SocialShare from '@/components/SocialShare.vue'

// Mock du composable useTheme
vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    isDark: false
  })
}))

describe('SocialShare', () => {
  let wrapper

  const defaultProps = {
    bookTitle: 'Vue.js Guide Complet',
    bookSummary: 'Un guide complet pour apprendre Vue.js',
    authors: ['John Doe', 'Jane Smith'],
    tags: ['Vue.js', 'JavaScript', 'Frontend']
  }

  beforeEach(() => {
    // Mock de navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue()
      },
      writable: true
    })

    // Mock de window.open
    global.window.open = vi.fn()

    // Mock de window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        origin: 'https://octo-books.com',
        pathname: '/book/123'
      },
      writable: true
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('Rendu de base', () => {
    it('devrait se monter correctement', () => {
      wrapper = mount(SocialShare, {
        props: defaultProps
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('devrait afficher le label par défaut', () => {
      wrapper = mount(SocialShare, {
        props: defaultProps
      })
      
      expect(wrapper.find('.share-label').exists()).toBe(true)
      expect(wrapper.find('.share-label span').text()).toBe('Partager ce livre')
    })

    it('devrait masquer le label si showLabel est false', () => {
      wrapper = mount(SocialShare, {
        props: { ...defaultProps, showLabel: false }
      })
      
      expect(wrapper.find('.share-label').exists()).toBe(false)
    })
  })

  describe('Boutons de partage', () => {
    beforeEach(() => {
      wrapper = mount(SocialShare, {
        props: defaultProps
      })
    })

    it('devrait afficher tous les boutons de partage', () => {
      expect(wrapper.find('.share-btn.twitter').exists()).toBe(true)
      expect(wrapper.find('.share-btn.linkedin').exists()).toBe(true)
      expect(wrapper.find('.share-btn.facebook').exists()).toBe(true)
      expect(wrapper.find('.share-btn.whatsapp').exists()).toBe(true)
      expect(wrapper.find('.share-btn.email').exists()).toBe(true)
      expect(wrapper.find('.share-btn.copy').exists()).toBe(true)
    })

    it('devrait afficher le texte des boutons par défaut', () => {
      expect(wrapper.find('.share-btn.twitter span').text()).toBe('Twitter')
      expect(wrapper.find('.share-btn.linkedin span').text()).toBe('LinkedIn')
      expect(wrapper.find('.share-btn.facebook span').text()).toBe('Facebook')
      expect(wrapper.find('.share-btn.whatsapp span').text()).toBe('WhatsApp')
      expect(wrapper.find('.share-btn.email span').text()).toBe('Email')
      expect(wrapper.find('.share-btn.copy span').text()).toBe('Copier')
    })

    it('devrait masquer le texte si showText est false', () => {
      wrapper = mount(SocialShare, {
        props: { ...defaultProps, showText: false }
      })
      
      expect(wrapper.find('.share-btn.twitter span').exists()).toBe(false)
      expect(wrapper.find('.share-btn.linkedin span').exists()).toBe(false)
    })
  })

  describe('Layout', () => {
    it('devrait utiliser le layout horizontal par défaut', () => {
      wrapper = mount(SocialShare, {
        props: defaultProps
      })
      
      expect(wrapper.find('.share-buttons.vertical').exists()).toBe(false)
    })

    it('devrait appliquer le layout vertical', () => {
      wrapper = mount(SocialShare, {
        props: { ...defaultProps, layout: 'vertical' }
      })
      
      expect(wrapper.find('.share-buttons.vertical').exists()).toBe(true)
    })

    it('devrait valider les layouts', () => {
      const component = SocialShare
      const layoutValidator = component.props.layout.validator
      
      expect(layoutValidator('horizontal')).toBe(true)
      expect(layoutValidator('vertical')).toBe(true)
      expect(layoutValidator('invalid')).toBe(false)
    })
  })

  describe('Actions de partage', () => {
    beforeEach(() => {
      wrapper = mount(SocialShare, {
        props: defaultProps
      })
    })

    it('devrait ouvrir Twitter au clic', async () => {
      const twitterBtn = wrapper.find('.share-btn.twitter')
      await twitterBtn.trigger('click')
      
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        'share-Twitter',
        expect.stringContaining('width=600,height=400')
      )
    })

    it('devrait émettre l\'événement share', async () => {
      const twitterBtn = wrapper.find('.share-btn.twitter')
      await twitterBtn.trigger('click')
      
      expect(wrapper.emitted('share')).toBeTruthy()
      expect(wrapper.emitted('share')[0][0]).toMatchObject({
        platform: 'twitter',
        bookTitle: 'Vue.js Guide Complet'
      })
    })

    it('devrait copier le lien avec clipboard API', async () => {
      const copyBtn = wrapper.find('.share-btn.copy')
      await copyBtn.trigger('click')
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://octo-books.com/book/123'
      )
    })
  })

  describe('Props et validation', () => {
    it('devrait exiger bookTitle', () => {
      const component = SocialShare
      expect(component.props.bookTitle.required).toBe(true)
    })

    it('devrait avoir des valeurs par défaut appropriées', () => {
      const component = SocialShare
      expect(component.props.showText.default).toBe(true)
      expect(component.props.showLabel.default).toBe(true)
      expect(component.props.label.default).toBe('Partager ce livre')
      expect(component.props.layout.default).toBe('horizontal')
    })
  })

  describe('Accessibilité', () => {
    beforeEach(() => {
      wrapper = mount(SocialShare, {
        props: defaultProps
      })
    })

    it('devrait avoir des boutons accessibles', () => {
      const buttons = wrapper.findAll('.share-btn')
      buttons.forEach(button => {
        expect(button.element.tagName).toBe('BUTTON')
        expect(button.attributes('aria-label')).toBeDefined()
        expect(button.attributes('title')).toBeDefined()
      })
    })

    it('devrait avoir les classes CSS appropriées', () => {
      expect(wrapper.find('.social-share').exists()).toBe(true)
      expect(wrapper.find('.share-buttons').exists()).toBe(true)
    })
  })

  describe('États du composant', () => {
    it('devrait utiliser le composable useTheme', () => {
      wrapper = mount(SocialShare, {
        props: defaultProps
      })
      expect(wrapper.vm.isDark).toBeDefined()
    })

    it('devrait initialiser linkCopied à false', () => {
      wrapper = mount(SocialShare, {
        props: defaultProps
      })
      expect(wrapper.vm.linkCopied).toBe(false)
    })
  })
})

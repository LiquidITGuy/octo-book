import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSocialShare, useShareUrls, useOpenGraph } from '@/composables/useSocialShare'

describe('useSocialShare', () => {
  let socialShare

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

    // Mock de console
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})

    // Mock des analytics globaux
    global.gtag = vi.fn()
    global._paq = { push: vi.fn() }
    global.mixpanel = { track: vi.fn() }

    socialShare = useSocialShare()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialisation', () => {
    it('devrait initialiser avec des stats vides', () => {
      const { shareStats } = useSocialShare()
      
      expect(shareStats.totalShares).toBeDefined()
      expect(shareStats.sharesByPlatform).toBeDefined()
      expect(shareStats.sharesByBook).toBeDefined()
      expect(shareStats.recentShares).toBeDefined()
    })

    it('devrait avoir les méthodes nécessaires', () => {
      expect(typeof socialShare.trackShare).toBe('function')
      expect(typeof socialShare.getMostSharedBooks).toBe('function')
      expect(typeof socialShare.resetStats).toBe('function')
    })
  })

  describe('Tracking des partages', () => {
    it('devrait enregistrer un partage basique', () => {
      const shareData = {
        platform: 'twitter',
        bookTitle: 'Vue.js Guide',
        url: 'https://example.com/book/123'
      }
      
      socialShare.trackShare(shareData)
      
      expect(socialShare.shareStats.totalShares).toBeGreaterThan(0)
    })

    it('devrait sauvegarder après chaque partage', () => {
      const shareData = {
        platform: 'linkedin',
        bookTitle: 'Test Book',
        url: 'https://example.com'
      }
      
      socialShare.trackShare(shareData)
      
      expect(window.localStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('Getters', () => {
    it('devrait retourner les livres les plus partagés', () => {
      const mostShared = socialShare.getMostSharedBooks(5)
      
      expect(Array.isArray(mostShared)).toBe(true)
      expect(mostShared.length).toBeLessThanOrEqual(5)
    })

    it('devrait retourner les plateformes les plus utilisées', () => {
      const topPlatforms = socialShare.getMostUsedPlatforms()
      
      expect(Array.isArray(topPlatforms)).toBe(true)
    })

    it('devrait retourner les partages récents', () => {
      const recent = socialShare.getRecentShares(10)
      
      expect(Array.isArray(recent)).toBe(true)
      expect(recent.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Gestion des données', () => {
    it('devrait réinitialiser les statistiques', () => {
      socialShare.resetStats()
      
      expect(socialShare.shareStats.totalShares).toBe(0)
      expect(Object.keys(socialShare.shareStats.sharesByBook)).toHaveLength(0)
    })

    it('devrait générer un rapport', () => {
      const report = socialShare.generateShareReport()
      
      expect(report.summary).toBeDefined()
      expect(report.mostSharedBooks).toBeDefined()
      expect(report.topPlatforms).toBeDefined()
      expect(report.generatedAt).toBeDefined()
    })
  })
})

describe('useShareUrls', () => {
  let shareUrls

  beforeEach(() => {
    shareUrls = useShareUrls()
  })

  describe('Génération d\'URLs', () => {
    const bookData = {
      title: 'Vue.js Guide Complet',
      summary: 'Un guide pour apprendre Vue.js',
      url: 'https://octo-books.com/book/123',
      authors: ['John Doe'],
      tags: ['Vue.js', 'JavaScript']
    }

    it('devrait générer une URL Twitter', () => {
      const url = shareUrls.generateShareUrl('twitter', bookData)
      
      expect(url).toContain('twitter.com/intent/tweet')
      expect(url).toContain(encodeURIComponent('Vue.js Guide Complet'))
    })

    it('devrait générer une URL LinkedIn', () => {
      const url = shareUrls.generateShareUrl('linkedin', bookData)
      
      expect(url).toContain('linkedin.com/sharing/share-offsite')
    })

    it('devrait générer une URL email', () => {
      const url = shareUrls.generateShareUrl('email', bookData)
      
      expect(url).toContain('mailto:')
    })

    it('devrait gérer les données manquantes', () => {
      const minimalData = {
        title: 'Test Book',
        url: 'https://example.com'
      }
      
      const url = shareUrls.generateShareUrl('twitter', minimalData)
      
      expect(url).toContain('twitter.com/intent/tweet')
    })
  })

  describe('Corps d\'email', () => {
    it('devrait générer un corps d\'email', () => {
      const bookData = {
        title: 'Vue.js Guide',
        url: 'https://example.com'
      }
      
      const body = shareUrls.generateEmailBody(bookData)
      
      expect(body).toContain('Vue.js Guide')
      expect(body).toContain('https://example.com')
    })
  })
})

describe('useOpenGraph', () => {
  let openGraph

  beforeEach(() => {
    openGraph = useOpenGraph()
    
    // Mock de document
    document.querySelector = vi.fn(() => null)
    document.createElement = vi.fn(() => ({
      setAttribute: vi.fn()
    }))
    
    // Mock de document.head
    Object.defineProperty(document, 'head', {
      value: {
        appendChild: vi.fn()
      },
      writable: true
    })
    
    document.title = ''
  })

  describe('Mise à jour des meta tags', () => {
    it('devrait mettre à jour les meta tags pour un livre', () => {
      const bookData = {
        title: 'Vue.js Guide',
        summary: 'Guide complet pour Vue.js',
        url: 'https://example.com/book/123'
      }
      
      openGraph.updateMetaTags(bookData)
      
      expect(document.title).toBe('Vue.js Guide - Octo Books')
    })

    it('devrait gérer les données manquantes', () => {
      const bookData = {
        title: 'Test Book'
      }
      
      openGraph.updateMetaTags(bookData)
      
      expect(document.title).toBe('Test Book - Octo Books')
    })
  })

  describe('Réinitialisation des meta tags', () => {
    it('devrait réinitialiser les meta tags', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'https://octo-books.com' },
        writable: true
      })
      
      openGraph.resetMetaTags()
      
      expect(document.title).toBe('Octo Books - Bibliothèque numérique')
    })
  })
})

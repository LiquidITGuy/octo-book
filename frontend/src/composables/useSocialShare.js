import { ref, reactive, readonly } from 'vue'

// Store global pour les statistiques de partage
const shareStats = reactive({
  totalShares: 0,
  sharesByPlatform: {
    twitter: 0,
    linkedin: 0,
    facebook: 0,
    whatsapp: 0,
    email: 0,
    copy: 0,
    native: 0
  },
  sharesByBook: {},
  recentShares: []
})

export function useSocialShare() {
  const isSharing = ref(false)

  // Charger les statistiques depuis localStorage
  const loadStats = () => {
    try {
      const saved = localStorage.getItem('octo-books-share-stats')
      if (saved) {
        const data = JSON.parse(saved)
        Object.assign(shareStats, data)
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des stats de partage:', error)
    }
  }

  // Sauvegarder les statistiques
  const saveStats = () => {
    try {
      localStorage.setItem('octo-books-share-stats', JSON.stringify(shareStats))
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde des stats de partage:', error)
    }
  }

  // Enregistrer un partage
  const trackShare = (shareData) => {
    const { platform, bookTitle, bookId, url } = shareData
    
    // Incrémenter les compteurs
    shareStats.totalShares++
    shareStats.sharesByPlatform[platform] = (shareStats.sharesByPlatform[platform] || 0) + 1
    
    // Tracker par livre
    if (bookId) {
      if (!shareStats.sharesByBook[bookId]) {
        shareStats.sharesByBook[bookId] = {
          title: bookTitle,
          totalShares: 0,
          platforms: {}
        }
      }
      shareStats.sharesByBook[bookId].totalShares++
      shareStats.sharesByBook[bookId].platforms[platform] = 
        (shareStats.sharesByBook[bookId].platforms[platform] || 0) + 1
    }
    
    // Ajouter aux partages récents (garder les 50 derniers)
    shareStats.recentShares.unshift({
      ...shareData,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    })
    
    if (shareStats.recentShares.length > 50) {
      shareStats.recentShares = shareStats.recentShares.slice(0, 50)
    }
    
    // Sauvegarder
    saveStats()
    
    // Analytics externes (Google Analytics, etc.)
    sendToAnalytics(shareData)
    
    console.log('📊 Partage enregistré:', shareData)
  }

  // Envoyer vers les services d'analytics
  const sendToAnalytics = (shareData) => {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        method: shareData.platform,
        content_type: 'book',
        item_id: shareData.bookId || shareData.bookTitle,
        content_id: shareData.bookId,
        custom_parameters: {
          book_title: shareData.bookTitle,
          share_url: shareData.url
        }
      })
    }
    
    // Matomo/Piwik
    if (typeof _paq !== 'undefined') {
      _paq.push(['trackEvent', 'Social Share', shareData.platform, shareData.bookTitle])
    }
    
    // Mixpanel
    if (typeof mixpanel !== 'undefined') {
      mixpanel.track('Book Shared', {
        platform: shareData.platform,
        book_title: shareData.bookTitle,
        book_id: shareData.bookId,
        url: shareData.url
      })
    }
  }

  // Obtenir les livres les plus partagés
  const getMostSharedBooks = (limit = 10) => {
    return Object.entries(shareStats.sharesByBook)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalShares - a.totalShares)
      .slice(0, limit)
  }

  // Obtenir les plateformes les plus utilisées
  const getMostUsedPlatforms = () => {
    return Object.entries(shareStats.sharesByPlatform)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)
  }

  // Obtenir les partages récents
  const getRecentShares = (limit = 10) => {
    return shareStats.recentShares.slice(0, limit)
  }

  // Obtenir les stats d'un livre spécifique
  const getBookStats = (bookId) => {
    return shareStats.sharesByBook[bookId] || {
      title: 'Livre inconnu',
      totalShares: 0,
      platforms: {}
    }
  }

  // Réinitialiser les statistiques
  const resetStats = () => {
    shareStats.totalShares = 0
    shareStats.sharesByPlatform = {
      twitter: 0,
      linkedin: 0,
      facebook: 0,
      whatsapp: 0,
      email: 0,
      copy: 0,
      native: 0
    }
    shareStats.sharesByBook = {}
    shareStats.recentShares = []
    saveStats()
  }

  // Exporter les données
  const exportStats = () => {
    const data = {
      ...shareStats,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `octo-books-share-stats-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Générer un rapport de partage
  const generateShareReport = () => {
    const mostShared = getMostSharedBooks(5)
    const topPlatforms = getMostUsedPlatforms()
    const recent = getRecentShares(10)
    
    return {
      summary: {
        totalShares: shareStats.totalShares,
        totalBooks: Object.keys(shareStats.sharesByBook).length,
        averageSharesPerBook: shareStats.totalShares / Math.max(Object.keys(shareStats.sharesByBook).length, 1)
      },
      mostSharedBooks: mostShared,
      topPlatforms: topPlatforms,
      recentActivity: recent,
      generatedAt: new Date().toISOString()
    }
  }

  // Initialiser au chargement
  loadStats()

  return {
    // État
    shareStats: readonly(shareStats),
    isSharing,
    
    // Actions
    trackShare,
    loadStats,
    saveStats,
    resetStats,
    exportStats,
    
    // Getters
    getMostSharedBooks,
    getMostUsedPlatforms,
    getRecentShares,
    getBookStats,
    generateShareReport
  }
}

// Composable pour les URLs de partage
export function useShareUrls() {
  const generateShareUrl = (platform, data) => {
    const { title, summary, url, image, authors, tags } = data
    
    const shareText = `📚 "${title}"${authors?.length ? ` par ${authors.join(', ')}` : ''} - Découvert sur Octo Books${tags?.length ? ` #${tags.slice(0, 3).join(' #')}` : ''}`
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`,
      
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
      
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      
      pinterest: image ? `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(shareText)}` : null,
      
      email: `mailto:?subject=${encodeURIComponent(`📚 ${title} - Recommandation de livre`)}&body=${encodeURIComponent(generateEmailBody(data))}`
    }
    
    return urls[platform]
  }
  
  const generateEmailBody = (data) => {
    const { title, summary, url, authors, tags } = data
    
    return `Salut !

Je viens de découvrir ce livre intéressant sur Octo Books et je pense qu'il pourrait t'intéresser :

📖 Titre : ${title}
${authors?.length ? `✍️ Auteur(s) : ${authors.join(', ')}` : ''}
${summary ? `📝 Résumé : ${summary}` : ''}
${tags?.length ? `🏷️ Tags : ${tags.join(', ')}` : ''}

🔗 Voir le livre : ${url}

Découvre plus de livres sur Octo Books !

Bonne lecture ! 📚`
  }
  
  return {
    generateShareUrl,
    generateEmailBody
  }
}

// Utilitaires pour les meta tags Open Graph
export function useOpenGraph() {
  const updateMetaTags = (bookData) => {
    const { title, summary, thumbnail, authors, url } = bookData
    
    // Titre
    updateMetaTag('og:title', title)
    updateMetaTag('twitter:title', title)
    
    // Description
    const description = summary || `Découvrez "${title}" sur Octo Books`
    updateMetaTag('og:description', description)
    updateMetaTag('twitter:description', description)
    updateMetaTag('description', description)
    
    // Image
    if (thumbnail) {
      updateMetaTag('og:image', thumbnail)
      updateMetaTag('twitter:image', thumbnail)
    }
    
    // URL
    if (url) {
      updateMetaTag('og:url', url)
      updateMetaTag('twitter:url', url)
    }
    
    // Type
    updateMetaTag('og:type', 'book')
    updateMetaTag('twitter:card', 'summary_large_image')
    
    // Auteurs
    if (authors?.length) {
      updateMetaTag('book:author', authors.join(', '))
    }
    
    // Titre de la page
    document.title = `${title} - Octo Books`
  }
  
  const updateMetaTag = (property, content) => {
    if (!content) return
    
    // Chercher la balise existante
    let meta = document.querySelector(`meta[property="${property}"]`) ||
               document.querySelector(`meta[name="${property}"]`)
    
    if (!meta) {
      // Créer une nouvelle balise
      meta = document.createElement('meta')
      if (property.startsWith('og:') || property.startsWith('book:')) {
        meta.setAttribute('property', property)
      } else {
        meta.setAttribute('name', property)
      }
      document.head.appendChild(meta)
    }
    
    meta.setAttribute('content', content)
  }
  
  const resetMetaTags = () => {
    document.title = 'Octo Books - Bibliothèque numérique'
    updateMetaTag('og:title', 'Octo Books - Bibliothèque numérique')
    updateMetaTag('og:description', 'Une bibliothèque numérique pour découvrir et explorer des livres techniques et méthodologiques')
    updateMetaTag('og:url', window.location.href)
  }
  
  return {
    updateMetaTags,
    resetMetaTags
  }
}

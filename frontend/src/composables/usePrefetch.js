import { ref } from 'vue'
import { booksApi } from '@/services/api'

export function usePrefetch() {
  const prefetchQueue = ref([])
  const prefetchedIds = ref(new Set())
  const isPrefetching = ref(false)

  /**
   * Précharge les détails d'un livre pour le mettre en cache
   * @param {string|number} bookId - ID du livre à précharger
   * @param {number} priority - Priorité (0 = haute, plus élevé = basse)
   */
  const prefetchBook = async (bookId, priority = 5) => {
    // Éviter les doublons
    if (prefetchedIds.value.has(bookId)) {
      console.log(`[Prefetch] Livre ${bookId} déjà préchargé`)
      return
    }

    // Ajouter à la file d'attente
    prefetchQueue.value.push({ bookId, priority })
    
    // Démarrer le traitement si pas déjà en cours
    if (!isPrefetching.value) {
      await processPrefetchQueue()
    }
  }

  /**
   * Précharge les détails de plusieurs livres
   * @param {Array} bookIds - Tableau d'IDs de livres
   * @param {number} priority - Priorité globale
   */
  const prefetchBooks = async (bookIds, priority = 5) => {
    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return
    }

    console.log(`[Prefetch] Ajout de ${bookIds.length} livres à la file de préchargement`)
    
    // Ajouter tous les livres à la file
    bookIds.forEach(bookId => {
      if (!prefetchedIds.value.has(bookId)) {
        prefetchQueue.value.push({ bookId, priority })
      }
    })

    // Trier par priorité (0 = haute priorité en premier)
    prefetchQueue.value.sort((a, b) => a.priority - b.priority)

    // Démarrer le traitement si pas déjà en cours
    if (!isPrefetching.value) {
      await processPrefetchQueue()
    }
  }

  /**
   * Traite la file d'attente de préchargement
   */
  const processPrefetchQueue = async () => {
    if (isPrefetching.value || prefetchQueue.value.length === 0) {
      return
    }

    isPrefetching.value = true
    console.log(`[Prefetch] Traitement de ${prefetchQueue.value.length} livres en attente`)

    while (prefetchQueue.value.length > 0) {
      const { bookId } = prefetchQueue.value.shift()

      // Ignorer si déjà préchargé
      if (prefetchedIds.value.has(bookId)) {
        continue
      }

      try {
        console.log(`[Prefetch] Préchargement du livre ${bookId}...`)
        
        // Appel API - le service worker va automatiquement mettre en cache
        await booksApi.getBookById(bookId)
        
        // Marquer comme préchargé
        prefetchedIds.value.add(bookId)
        
        console.log(`[Prefetch] ✓ Livre ${bookId} mis en cache`)
        
        // Petit délai pour ne pas surcharger le réseau (50ms entre chaque)
        await new Promise(resolve => setTimeout(resolve, 50))
        
      } catch (error) {
        console.warn(`[Prefetch] ✗ Erreur préchargement livre ${bookId}:`, error.message)
        // Continuer même en cas d'erreur pour ne pas bloquer les autres
      }
    }

    isPrefetching.value = false
    console.log(`[Prefetch] Préchargement terminé. ${prefetchedIds.value.size} livres en cache`)
  }

  /**
   * Précharge les détails des livres d'une liste de résultats
   * Utile après avoir récupéré une liste de livres (page d'accueil, recherche, etc.)
   * @param {Array} books - Tableau d'objets livres avec au minimum un id
   * @param {number} priority - Priorité du préchargement
   */
  const prefetchBooksFromList = async (books, priority = 5) => {
    if (!Array.isArray(books) || books.length === 0) {
      return
    }

    const bookIds = books.map(book => book.id).filter(id => id)
    await prefetchBooks(bookIds, priority)
  }

  /**
   * Précharge les images des livres en arrière-plan
   * @param {Array} books - Tableau d'objets livres avec thumbnail
   */
  const prefetchImages = (books) => {
    if (!Array.isArray(books) || books.length === 0) {
      return
    }

    books.forEach(book => {
      if (book.thumbnail) {
        // Créer une image en mémoire pour forcer le chargement
        const img = new Image()
        img.src = book.thumbnail
        console.log(`[Prefetch] Image ${book.thumbnail} en cours de chargement`)
      }
    })
  }

  /**
   * Précharge de manière intelligente : détails + images
   * @param {Array} books - Liste de livres à précharger
   * @param {Object} options - Options de préchargement
   */
  const smartPrefetch = async (books, options = {}) => {
    const {
      priority = 5,
      includeImages = true,
      delay = 500 // Délai avant de commencer le préchargement
    } = options

    if (!Array.isArray(books) || books.length === 0) {
      return
    }

    console.log(`[Prefetch] Préchargement intelligent de ${books.length} livres`)

    // Attendre un peu pour ne pas impacter le chargement initial de la page
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    // Précharger les images d'abord (plus rapide)
    if (includeImages) {
      prefetchImages(books)
    }

    // Puis précharger les détails (requêtes API)
    await prefetchBooksFromList(books, priority)
  }

  /**
   * Réinitialise le système de préchargement
   */
  const reset = () => {
    prefetchQueue.value = []
    prefetchedIds.value.clear()
    isPrefetching.value = false
    console.log('[Prefetch] Système réinitialisé')
  }

  /**
   * Obtient les statistiques du préchargement
   */
  const getStats = () => {
    return {
      prefetchedCount: prefetchedIds.value.size,
      queueLength: prefetchQueue.value.length,
      isPrefetching: isPrefetching.value,
      prefetchedIds: Array.from(prefetchedIds.value)
    }
  }

  return {
    prefetchBook,
    prefetchBooks,
    prefetchBooksFromList,
    prefetchImages,
    smartPrefetch,
    isPrefetching,
    reset,
    getStats
  }
}

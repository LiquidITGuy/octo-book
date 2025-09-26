<template>
  <div class="container">
    <!-- Hero Section avec titre et recherche intégrée -->
    <section class="hero">
      <div class="hero-content">
        <h1>Notre collection de livres</h1>
        <p>Découvrez tous nos ouvrages techniques et méthodologiques</p>
        
        <!-- Barre de recherche intégrée -->
        <div class="search-container">
          <div class="search-wrapper">
            <input
              v-model="searchQuery"
              @input="onSearchInput"
              @keyup.enter="performSearch"
              type="text"
              placeholder="Rechercher dans les titres, descriptions, résumés..."
              class="search-input"
              aria-label="Recherche de livres"
            />
            <button 
              @click="performSearch"
              class="search-button"
              :disabled="!searchQuery.trim()"
              aria-label="Lancer la recherche"
            >
              🔍
            </button>
            <button 
              v-if="isSearchMode"
              @click="clearSearch"
              class="clear-button"
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          </div>
          
          <!-- Indicateur de recherche -->
          <div v-if="isSearchMode" class="search-info">
            <p>
              <strong>{{ searchResults.totalBooks || 0 }}</strong> résultat(s) pour 
              "<strong>{{ currentSearchQuery }}</strong>"
              <span v-if="searchResults.offline" class="offline-search-badge">
                📡 Recherche hors ligne
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <div v-if="loading" class="loading">
      {{ isSearchMode ? 'Recherche en cours...' : 'Chargement des livres...' }}
    </div>

    <div v-else-if="error" class="error card">
      <h2>⚠️ {{ error }}</h2>
      <p v-if="error.includes('API')">
        <strong>Assurez-vous que l'API est démarrée :</strong><br>
        <code>cd api && npm start</code>
      </p>
    </div>

    <div v-else-if="books.length > 0">
      <!-- Informations de pagination -->
      <div v-if="pagination" class="pagination-info">
        <p>
          Affichage de {{ ((pagination.currentPage - 1) * 10) + 1 }} à {{ Math.min(pagination.currentPage * 10, pagination.totalBooks) }} 
          sur {{ pagination.totalBooks }} livres
        </p>
      </div>

      <!-- Liste des livres -->
      <div class="books-grid">
        <article v-for="book in books" :key="book.id" class="book-card card">
          <div class="book-thumbnail">
            <img 
              :src="book.thumbnail" 
              :alt="`Couverture du livre ${book.title}`" 
              loading="lazy"
              @error="handleImageError"
            />
          </div>
          <div class="book-info">
            <div class="book-header">
              <h2>{{ book.title }}</h2>
              <div class="book-controls">
                <span 
                  :class="['availability-badge', book.disponible ? 'available' : 'unavailable']"
                  :aria-label="book.disponible ? 'Livre disponible' : 'Livre non disponible'"
                >
                  {{ book.disponible ? 'Disponible' : 'Non disponible' }}
                </span>
                <FavoriteButton :book-id="book.id" />
              </div>
            </div>
            <p class="authors" aria-label="Auteurs">
              {{ book.authors.join(', ') }}
            </p>
            <p class="summary">{{ book.summary }}</p>
            <div class="tags" role="list" aria-label="Tags du livre">
              <router-link 
                v-for="tag in book.tags" 
                :key="tag" 
                :to="`/tag/${encodeURIComponent(tag)}`"
                class="tag tag-link"
                role="listitem"
              >
                {{ tag }}
              </router-link>
            </div>
            <div class="book-actions">
              <router-link 
                :to="`/books/${book.id}`" 
                class="btn"
                :aria-label="`Voir les détails du livre ${book.title}`"
              >
                Voir le détail
              </router-link>
            </div>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <nav v-if="pagination && pagination.totalPages > 1" class="pagination" aria-label="Navigation des pages">
        <button 
          v-if="pagination.hasPrev" 
          @click="goToPage(pagination.currentPage - 1)"
          class="pagination-link"
          aria-label="Aller à la page précédente"
        >
          ← Précédent
        </button>

        <!-- Afficher les numéros de page -->
        <template v-for="pageNum in getPageNumbers()" :key="pageNum">
          <button 
            v-if="typeof pageNum === 'number'"
            @click="goToPage(pageNum)"
            :class="['pagination-link', { current: pageNum === pagination.currentPage }]"
            :aria-label="`Aller à la page ${pageNum}`"
            :aria-current="pageNum === pagination.currentPage ? 'page' : undefined"
          >
            {{ pageNum }}
          </button>
          <span v-else class="pagination-ellipsis" aria-hidden="true">...</span>
        </template>

        <button 
          v-if="pagination.hasNext" 
          @click="goToPage(pagination.currentPage + 1)"
          class="pagination-link"
          aria-label="Aller à la page suivante"
        >
          Suivant →
        </button>
      </nav>
    </div>

    <div v-else class="card" style="text-align: center; padding: 4rem 2rem;">
      <h2>📚 Aucun livre trouvé</h2>
      <p>Il n'y a pas de livres disponibles pour le moment.</p>
    </div>
  </div>
</template>

<script>
import { booksApi } from '@/services/api'
import FavoriteButton from '@/components/FavoriteButton.vue'

export default {
  name: 'BooksView',
  components: {
    FavoriteButton
  },
  data() {
    return {
      books: [],
      pagination: null,
      loading: true,
      error: null,
      currentPage: 1,
      searchQuery: '',
      currentSearchQuery: '',
      isSearchMode: false,
      searchResults: {},
      searchTimeout: null
    }
  },
  async mounted() {
    // Récupérer la page depuis l'URL
    const page = parseInt(this.$route.query.page) || 1
    this.currentPage = page
    await this.loadBooks(page)
  },
  watch: {
    '$route.query.page'(newPage, oldPage) {
      const page = parseInt(newPage) || 1
      const oldPageNum = parseInt(oldPage) || 1
      
      // Comparer avec l'ancienne page de l'URL, pas avec currentPage qui peut déjà être mis à jour
      if (page !== oldPageNum) {
        this.currentPage = page
        this.loadBooks(page)
        // Remonter en haut de page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  },
  methods: {
    async loadBooks(page = 1) {
      try {
        this.loading = true
        this.error = null
        this.currentPage = page
        const response = await booksApi.getBooks(page, 10)
        this.books = response.data.books
        this.pagination = response.data.pagination
      } catch (error) {
        console.error('Erreur lors du chargement des livres:', error)
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          this.error = 'Impossible de se connecter à l\'API'
        } else {
          this.error = 'Erreur lors du chargement des livres'
        }
      } finally {
        this.loading = false
      }
    },
    
    async performSearch(page = 1) {
      const query = this.searchQuery.trim()
      if (!query) return

      try {
        this.loading = true
        this.error = null
        this.isSearchMode = true
        this.currentSearchQuery = query
        this.currentPage = page
        
        const response = await booksApi.searchBooks(query, page, 10)
        this.books = response.data.books
        this.pagination = response.data.pagination
        this.searchResults = {
          totalBooks: response.data.pagination.totalBooks,
          query: query,
          offline: response.data.offline || false
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          this.error = 'Impossible de se connecter à l\'API'
        } else {
          this.error = 'Erreur lors de la recherche'
        }
      } finally {
        this.loading = false
      }
    },

    onSearchInput() {
      // Debounce la recherche automatique
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      // Si le champ est vide, effacer la recherche
      if (!this.searchQuery.trim()) {
        this.clearSearch()
        return
      }

      // Recherche automatique après 500ms d'inactivité
      this.searchTimeout = setTimeout(() => {
        this.performSearch()
      }, 500)
    },

    clearSearch() {
      this.searchQuery = ''
      this.currentSearchQuery = ''
      this.isSearchMode = false
      this.searchResults = {}
      this.currentPage = 1
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      // Recharger la liste complète des livres
      this.loadBooks(1)
    },

    goToPage(page) {
      if (page !== this.currentPage) {
        this.currentPage = page
        if (this.isSearchMode) {
          // En mode recherche, effectuer une nouvelle recherche pour la page demandée
          this.performSearch(page)
          // Remonter en haut de page pour la recherche
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          // En mode normal, naviguer vers la page
          this.$router.push({ query: { page: page.toString() } })
        }
      }
    },
    getPageNumbers() {
      if (!this.pagination) return []
      
      const { currentPage, totalPages } = this.pagination
      const pages = []
      
      // Toujours afficher la première page
      if (totalPages > 0) {
        pages.push(1)
      }
      
      // Ajouter des ellipses si nécessaire
      if (currentPage > 4) {
        pages.push('...')
      }
      
      // Ajouter les pages autour de la page courante
      for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }
      
      // Ajouter des ellipses si nécessaire
      if (currentPage < totalPages - 3) {
        pages.push('...')
      }
      
      // Toujours afficher la dernière page
      if (totalPages > 1 && !pages.includes(totalPages)) {
        pages.push(totalPages)
      }
      
      return pages
    },
    handleImageError(event) {
      // Masquer l'image en cas d'erreur de chargement
      event.target.style.display = 'none'
      // Le CSS affichera automatiquement l'icône de fallback
    }
  }
}
</script>

<style scoped>
/* Styles pour la recherche intégrée au hero */
.search-container {
  max-width: 700px;
  margin: 3rem auto 0;
}

.search-wrapper {
  display: flex;
  gap: 0.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0;
  padding: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-wrapper:focus-within {
  border-color: #0E2356;
  box-shadow: 0 0 0 1px #0E2356;
}

.search-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: #0E2356;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 0.02em;
  outline: none;
}

.search-input::placeholder {
  color: #586586;
  font-weight: 300;
}

.search-button, .clear-button {
  padding: 1rem 1.5rem;
  border: 2px solid #0E2356;
  background: transparent;
  color: #0E2356;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.search-button:hover:not(:disabled) {
  background: #0E2356;
  color: #ffffff;
}

.search-button:disabled {
  border-color: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
  opacity: 0.6;
}

.clear-button {
  border-color: #586586;
  color: #586586;
  font-weight: 400;
}

.clear-button:hover {
  background: #586586;
  color: #ffffff;
}

.search-info {
  text-align: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #0E2356;
}

.search-info p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 300;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.search-info strong {
  font-weight: 400;
  color: #0E2356;
}

.offline-search-badge {
  display: inline-block;
  margin-left: 1rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.book-header h2 {
  margin: 0;
  flex: 1;
}

.book-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.availability-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}

.availability-badge.available {
  background-color: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.availability-badge.unavailable {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.pagination-info {
  text-align: center;
  margin-bottom: 2rem;
}

.pagination-info p {
  color: #586586;
  font-size: 0.9rem;
  font-weight: 300;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .search-container {
    max-width: 100%;
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-input {
    font-size: 16px; /* Évite le zoom sur iOS */
  }

  .search-button, .clear-button {
    align-self: stretch;
    justify-content: center;
  }

  .search-info {
    max-width: 100%;
    margin-top: 0.75rem;
  }

  .books-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .book-thumbnail {
    height: 200px;
  }

  .book-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .book-controls {
    align-self: stretch;
    justify-content: space-between;
  }

  .availability-badge {
    align-self: flex-start;
  }

  .pagination {
    gap: 0.25rem;
  }

  .pagination-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .search-container {
    flex-direction: row;
    gap: 0.5rem;
  }

  .search-button, .clear-button {
    min-width: 44px;
    padding: 0.75rem 0.5rem;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }

  .pagination-link {
    padding: 0.5rem;
    min-width: 40px;
  }
}
</style>

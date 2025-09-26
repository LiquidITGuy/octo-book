<template>
  <div class="container">
    <div>
      <h1>Livres avec le tag "{{ currentTag }}"</h1>
      <p v-if="!loading && !error">
        {{ totalBooks }} livre{{ totalBooks > 1 ? 's' : '' }} trouvé{{ totalBooks > 1 ? 's' : '' }}
      </p>
      <router-link to="/books" class="back-link">← Retour à tous les livres</router-link>
    </div>

    <div v-if="loading" class="loading">
      Chargement des livres...
    </div>

    <div v-else-if="error" class="error card">
      <h2>⚠️ {{ error }}</h2>
      <p v-if="error.includes('API')">
          <strong>Votre donnée n'est malheureusement pas en cache</strong><br>
          <span>Rééssayez en ligne ou consultez un autre contenu pour le moment</span>
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
              <span 
                :class="['availability-badge', book.disponible ? 'available' : 'unavailable']"
                :aria-label="book.disponible ? 'Livre disponible' : 'Livre archivé'"
              >
                {{ book.disponible ? 'Disponible' : 'Archive' }}
              </span>
            </div>
            <p class="authors" aria-label="Auteurs">
              {{ book.authors.join(', ') }}
            </p>
            <p class="summary">{{ book.summary }}</p>
            <div class="tags" role="list" aria-label="Tags du livre">
              <span 
                v-for="tag in book.tags" 
                :key="tag" 
                class="tag"
                :class="{ 'tag-current': tag === currentTag }"
                role="listitem"
                @click="navigateToTag(tag)"
              >
                {{ tag }}
              </span>
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
      <p>Il n'y a pas de livres avec le tag "{{ currentTag }}" pour le moment.</p>
      <router-link to="/books" class="btn">Voir tous les livres</router-link>
    </div>
  </div>
</template>

<script>
import { booksApi } from '@/services/api'

export default {
  name: 'BooksByTagView',
  data() {
    return {
      books: [],
      pagination: null,
      loading: true,
      error: null,
      currentPage: 1,
      currentTag: '',
      totalBooks: 0
    }
  },
  async mounted() {
    this.currentTag = this.$route.params.tag
    // Récupérer la page depuis l'URL
    const page = parseInt(this.$route.query.page) || 1
    this.currentPage = page
    await this.loadBooksByTag(this.currentTag, page)
  },
  watch: {
    '$route.params.tag'(newTag) {
      if (newTag !== this.currentTag) {
        this.currentTag = newTag
        this.currentPage = 1
        this.loadBooksByTag(newTag, 1)
      }
    },
    '$route.query.page'(newPage) {
      const page = parseInt(newPage) || 1
      if (page !== this.currentPage) {
        this.currentPage = page
        this.loadBooksByTag(this.currentTag, page)
      }
    }
  },
  methods: {
    async loadBooksByTag(tag, page = 1) {
      try {
        this.loading = true
        this.error = null
        const response = await booksApi.getBooksByTag(tag, page, 10)
        this.books = response.data.books
        this.pagination = response.data.pagination
        this.totalBooks = response.data.pagination.totalBooks
      } catch (error) {
        console.error('Erreur lors du chargement des livres par tag:', error)
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          this.error = 'Impossible de se connecter à l\'API'
        } else {
          this.error = 'Erreur lors du chargement des livres'
        }
      } finally {
        this.loading = false
      }
    },
    goToPage(page) {
      if (page !== this.currentPage) {
        this.$router.push({ 
          name: 'books-by-tag', 
          params: { tag: this.currentTag },
          query: { page: page.toString() } 
        })
      }
    },
    navigateToTag(tag) {
      if (tag !== this.currentTag) {
        this.$router.push({ 
          name: 'books-by-tag', 
          params: { tag: tag }
        })
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

.back-link {
  display: inline-block;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.6);
  background-color: rgba(255, 255, 255, 0.1);
}

.pagination-info {
  text-align: center;
  margin-bottom: 2rem;
}

.pagination-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.tag-current {
  background-color: #667eea !important;
  color: white !important;
  font-weight: bold;
}

.tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag:hover {
  background-color: #667eea;
  color: white;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .book-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .availability-badge {
    align-self: flex-start;
  }

  .books-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .book-thumbnail {
    height: 200px;
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
  .books-grid {
    grid-template-columns: 1fr;
  }

  .pagination-link {
    padding: 0.5rem;
    min-width: 40px;
  }
}
</style>

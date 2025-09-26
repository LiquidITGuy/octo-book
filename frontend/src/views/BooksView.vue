<template>
  <div class="container">
    <div class="books-header">
      <h1>Notre collection de livres</h1>
      <p>Découvrez tous nos ouvrages techniques et méthodologiques</p>
    </div>

    <div v-if="loading" class="loading">
      Chargement des livres...
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
            <img :src="book.thumbnail" :alt="book.title" loading="lazy" />
          </div>
          <div class="book-info">
            <h2>{{ book.title }}</h2>
            <p class="authors">
              {{ book.authors.join(', ') }}
            </p>
            <p class="summary">{{ book.summary }}</p>
            <div class="tags">
              <span v-for="tag in book.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <div class="book-actions">
              <router-link :to="`/books/${book.id}`" class="btn">Voir le détail</router-link>
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
        >
          ← Précédent
        </button>

        <!-- Afficher les numéros de page -->
        <template v-for="pageNum in getPageNumbers()" :key="pageNum">
          <button 
            v-if="typeof pageNum === 'number'"
            @click="goToPage(pageNum)"
            :class="['pagination-link', { current: pageNum === pagination.currentPage }]"
          >
            {{ pageNum }}
          </button>
          <span v-else class="pagination-ellipsis">...</span>
        </template>

        <button 
          v-if="pagination.hasNext" 
          @click="goToPage(pagination.currentPage + 1)"
          class="pagination-link"
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

export default {
  name: 'BooksView',
  data() {
    return {
      books: [],
      pagination: null,
      loading: true,
      error: null,
      currentPage: 1
    }
  },
  async mounted() {
    // Récupérer la page depuis l'URL
    const page = parseInt(this.$route.query.page) || 1
    this.currentPage = page
    await this.loadBooks(page)
  },
  watch: {
    '$route.query.page'(newPage) {
      const page = parseInt(newPage) || 1
      if (page !== this.currentPage) {
        this.currentPage = page
        this.loadBooks(page)
      }
    }
  },
  methods: {
    async loadBooks(page = 1) {
      try {
        this.loading = true
        this.error = null
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
    goToPage(page) {
      if (page !== this.currentPage) {
        this.$router.push({ query: { page: page.toString() } })
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
    }
  }
}
</script>

<style scoped>
.books-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.books-header h1 {
  font-size: 3rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.books-header p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.pagination-info {
  text-align: center;
  margin-bottom: 2rem;
}

.pagination-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .books-header h1 {
    font-size: 2rem;
  }

  .books-header p {
    font-size: 1rem;
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

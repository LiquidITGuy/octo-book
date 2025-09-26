<template>
  <div class="container">
    <div v-if="loading" class="loading">
      Chargement du livre...
    </div>

    <div v-else-if="error" class="error-section">
      <div class="error card">
        <h1>⚠️ {{ error }}</h1>
        <p v-if="error.includes('API')">
          <strong>Assurez-vous que l'API est démarrée :</strong><br>
          <code>cd api && npm start</code>
        </p>
        <div class="error-actions">
          <router-link to="/books" class="btn">← Retour aux livres</router-link>
          <router-link to="/" class="btn btn-secondary">Accueil</router-link>
        </div>
      </div>
    </div>

    <div v-else-if="book" class="book-detail">
      <!-- Navigation -->
      <nav class="breadcrumb">
        <router-link to="/">Accueil</router-link>
        <span class="separator">›</span>
        <router-link to="/books">Livres</router-link>
        <span class="separator">›</span>
        <span class="current">{{ book.title }}</span>
      </nav>

      <!-- Contenu principal -->
      <div class="book-content">
        <div class="book-image">
          <img :src="book.thumbnail" :alt="book.title" />
        </div>

        <div class="book-details">
          <header class="book-header">
            <div class="title-section">
              <h1>{{ book.title }}</h1>
              <span 
                :class="['availability-badge', book.disponible ? 'available' : 'unavailable']"
                :aria-label="book.disponible ? 'Livre disponible' : 'Livre archivé'"
              >
                {{ book.disponible ? 'Disponible' : 'Archive' }}
              </span>
            </div>
            <div class="authors">
              <strong>Auteur{{ book.authors.length > 1 ? 's' : '' }} :</strong>
              {{ book.authors.join(', ') }}
            </div>
            <div class="tags">
              <span v-for="tag in book.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </header>

          <div class="book-summary">
            <h2>Résumé</h2>
            <p>{{ book.summary }}</p>
          </div>

          <div class="book-long-summary">
            <h2>Description détaillée</h2>
            <div class="long-summary-content">
              <p v-for="(paragraph, index) in getLongSummaryParagraphs()" :key="index">
                {{ paragraph }}
              </p>
            </div>
          </div>

          <div class="book-actions">
            <a 
              v-if="book.disponible"
              :href="book.downloadLink" 
              class="btn btn-download" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              📥 Télécharger le livre
            </a>
            <button 
              v-else
              class="btn btn-disabled" 
              disabled
              title="Ce livre n'est pas disponible actuellement"
            >
              📥 Non disponible
            </button>
            <router-link to="/books" class="btn btn-secondary">
              ← Retour aux livres
            </router-link>
          </div>
        </div>
      </div>

      <!-- Informations supplémentaires -->
      <div class="book-meta card">
        <h3>Informations sur le livre</h3>
        <div class="meta-grid">
          <div class="meta-item">
            <strong>ID :</strong>
            <span>{{ book.id }}</span>
          </div>
          <div class="meta-item">
            <strong>Nombre d'auteurs :</strong>
            <span>{{ book.authors.length }}</span>
          </div>
          <div class="meta-item">
            <strong>Tags :</strong>
            <span>{{ book.tags.length }}</span>
          </div>
          <div class="meta-item">
            <strong>Disponible :</strong>
            <span :class="book.disponible ? 'available' : 'unavailable'">
              {{ book.disponible ? '✅ Oui' : '❌ Non' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { booksApi } from '@/services/api'

export default {
  name: 'BookDetailView',
  data() {
    return {
      book: null,
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadBook()
  },
  watch: {
    '$route.params.id'() {
      this.loadBook()
    }
  },
  methods: {
    async loadBook() {
      const bookId = this.$route.params.id
      
      if (!bookId) {
        this.error = 'ID du livre manquant'
        this.loading = false
        return
      }

      try {
        this.loading = true
        this.error = null
        const response = await booksApi.getBookById(bookId)
        this.book = response.data
      } catch (error) {
        console.error('Erreur lors du chargement du livre:', error)
        if (error.response?.status === 404) {
          this.error = 'Livre non trouvé'
        } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          this.error = 'Impossible de se connecter à l\'API'
        } else {
          this.error = 'Erreur lors du chargement du livre'
        }
      } finally {
        this.loading = false
      }
    },
    getLongSummaryParagraphs() {
      if (!this.book?.longSummary) return []
      return this.book.longSummary.split('\n').filter(p => p.trim())
    }
  }
}
</script>

<style scoped>
.error-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.error {
  text-align: center;
  padding: 3rem;
  max-width: 500px;
}

.error h1 {
  color: #e74c3c;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.error code {
  background: rgba(102, 126, 234, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 5px;
  display: inline-block;
  margin: 1rem 0;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.book-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.breadcrumb a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb a:hover {
  color: white;
}

.separator {
  margin: 0 0.5rem;
  color: rgba(255, 255, 255, 0.6);
}

.current {
  color: white;
  font-weight: 500;
}

.book-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.book-image {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.book-image img {
  width: 100%;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.book-image img:hover {
  transform: scale(1.02);
}

.book-details {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 2.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.title-section h1 {
  margin: 0;
  flex: 1;
}

.availability-badge {
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.85rem;
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

.btn-disabled {
  background-color: rgba(102, 126, 234, 0.3) !important;
  color: rgba(255, 255, 255, 0.6) !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.btn-disabled:hover {
  background-color: rgba(102, 126, 234, 0.3) !important;
  transform: none !important;
}

.authors {
  color: #667eea;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.authors strong {
  color: #333;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.book-summary,
.book-long-summary {
  margin-bottom: 2rem;
}

.book-summary h2,
.book-long-summary h2 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.book-summary p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
}

.long-summary-content {
  color: #555;
  line-height: 1.7;
}

.long-summary-content p {
  margin-bottom: 1rem;
}

.book-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

.book-meta {
  padding: 2rem;
}

.book-meta h3 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
}

.meta-item strong {
  color: #333;
}

.meta-item span {
  color: #666;
}

.available {
  color: #27ae60 !important;
  font-weight: 500;
}

.unavailable {
  color: #e74c3c !important;
  font-weight: 500;
}

@media (max-width: 768px) {
  .book-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .book-image {
    position: static;
    max-width: 250px;
    margin: 0 auto;
  }

  .book-details {
    padding: 1.5rem;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .availability-badge {
    align-self: flex-start;
  }

  .book-actions {
    flex-direction: column;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }

  .breadcrumb {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
 
  .book-details {
    padding: 1rem;
  }

  .book-meta {
    padding: 1rem;
  }
}
</style>

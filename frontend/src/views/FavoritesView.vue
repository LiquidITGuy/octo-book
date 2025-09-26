<template>
  <div class="container">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Mes favoris</h1>
        <p>Retrouvez tous vos livres préférés en un seul endroit</p>
        <div v-if="favoritesCount > 0" class="favorites-stats">
          <p><strong>{{ favoritesCount }}</strong> livre(s) en favoris</p>
          <button @click="clearAllFavorites" class="btn btn-secondary" style="margin-top: 1rem;">
            Vider les favoris
          </button>
        </div>
      </div>
    </section>

    <div v-if="loading" class="loading">
      Chargement de vos favoris...
    </div>

    <div v-else-if="error" class="error card">
      <h2>⚠️ {{ error }}</h2>
    </div>

    <div v-else-if="favoriteBooks.length > 0">
      <!-- Liste des livres favoris -->
      <div class="books-grid">
        <article v-for="book in favoriteBooks" :key="book.id" class="book-card card">
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
                <FavoriteButton 
                  :book-id="book.id" 
                  @favorite-toggled="handleFavoriteToggled"
                />
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
    </div>

    <div v-else class="card" style="text-align: center; padding: 4rem 2rem;">
      <h2>💔 Aucun favori</h2>
      <p>Vous n'avez pas encore ajouté de livres à vos favoris.</p>
      <p>Parcourez notre collection et cliquez sur le cœur pour ajouter vos livres préférés !</p>
      <div style="margin-top: 2rem;">
        <router-link to="/books" class="btn">
          Découvrir les livres
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useFavorites } from '@/composables/useFavorites'
import { booksApi } from '@/services/api'
import FavoriteButton from '@/components/FavoriteButton.vue'

export default {
  name: 'FavoritesView',
  components: {
    FavoriteButton
  },
  setup() {
    const { favorites, favoritesCount, clearFavorites } = useFavorites()
    const favoriteBooks = ref([])
    const loading = ref(true)
    const error = ref(null)

    const loadFavoriteBooks = async () => {
      try {
        loading.value = true
        error.value = null
        
        if (favorites.value.length === 0) {
          favoriteBooks.value = []
          return
        }

        // Charger tous les livres pour filtrer les favoris
        const response = await booksApi.getBooks(1, 100) // Récupérer plus de livres
        const allBooks = response.data.books
        
        // Filtrer les livres favoris
        favoriteBooks.value = allBooks.filter(book => 
          favorites.value.includes(book.id.toString())
        )
        
      } catch (err) {
        console.error('Erreur lors du chargement des favoris:', err)
        error.value = 'Erreur lors du chargement de vos favoris'
      } finally {
        loading.value = false
      }
    }

    const handleFavoriteToggled = (event) => {
      // Recharger la liste des favoris quand un livre est retiré
      if (!event.isFavorite) {
        loadFavoriteBooks()
      }
    }

    const clearAllFavorites = () => {
      if (confirm('Êtes-vous sûr de vouloir vider tous vos favoris ?')) {
        clearFavorites()
        favoriteBooks.value = []
      }
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
    }

    onMounted(() => {
      loadFavoriteBooks()
    })

    return {
      favoriteBooks,
      favoritesCount,
      loading,
      error,
      handleFavoriteToggled,
      clearAllFavorites,
      handleImageError
    }
  }
}
</script>

<style scoped>
.favorites-stats {
  margin-top: 2rem;
  padding: 2rem;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
}

.favorites-stats p {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 300;
}

.favorites-stats strong {
  color: var(--color-primary);
  font-weight: 400;
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

@media (max-width: 768px) {
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
}
</style>

<template>
  <div class="container">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Bienvenue dans la bibliothèque Octo</h1>
        <p>Découvrez notre collection de livres techniques et méthodologiques pour accompagner votre transformation numérique.</p>
        <div class="hero-actions">
          <router-link to="/books" class="btn btn-primary">Explorer les livres</router-link>
          <a href="#featured" class="btn btn-secondary">Voir les nouveautés</a>
        </div>
      </div>
    </section>

    <!-- Featured Books -->
    <section id="featured" class="featured-section">
      <h2>
        Livres à la une
      </h2>
      
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

      <div v-else-if="featuredBooks.length > 0" class="grid">
        <article v-for="book in featuredBooks" :key="book.id" class="book-card card">
          <div class="book-thumbnail">
            <img :src="book.thumbnail" :alt="book.title" />
          </div>
          <div class="book-info">
            <h3>{{ book.title }}</h3>
            <p class="authors">
              {{ book.authors.join(', ') }}
            </p>
            <p class="summary">{{ book.summary }}</p>
            <div class="tags">
              <router-link 
                v-for="tag in book.tags" 
                :key="tag" 
                :to="`/tag/${encodeURIComponent(tag)}`"
                class="tag tag-link"
              >
                {{ tag }}
              </router-link>
            </div>
            <div class="book-actions">
              <router-link :to="`/books/${book.id}`" class="btn">Voir le détail</router-link>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="card" style="text-align: center; padding: 3rem;">
        <p>Aucun livre disponible pour le moment.</p>
      </div>
    </section>

    <!-- Notifications Section -->
    <section class="notifications-section">
      <div class="card">
        <h2>Restez informé</h2>
        <p>
          Ne manquez aucun nouveau livre ! Activez les notifications push pour être alerté 
          dès qu'un nouveau livre est ajouté à notre bibliothèque.
        </p>
        <PushNotifications />
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="card">
        <h2>À propos d'Octo Books</h2>
        <p>
          Octo Books est votre bibliothèque numérique dédiée aux technologies et méthodologies modernes. 
          Nous rassemblons les meilleurs ouvrages pour vous accompagner dans votre parcours professionnel 
          et votre transformation numérique.
        </p>
        <div class="features" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem;">
          <div class="feature">
            <h3 style="color: #667eea; margin-bottom: 0.5rem;">📚 Collection variée</h3>
            <p style="color: #666; margin-bottom: 0;">Des livres sur l'architecture logicielle, DevOps, IA, sécurité et bien plus.</p>
          </div>
          <div class="feature">
            <h3 style="color: #667eea; margin-bottom: 0.5rem;">🔍 Recherche avancée</h3>
            <p style="color: #666; margin-bottom: 0;">Trouvez facilement les livres par titre, auteur ou tags.</p>
          </div>
          <div class="feature">
            <h3 style="color: #667eea; margin-bottom: 0.5rem;">📱 Interface moderne</h3>
            <p style="color: #666; margin-bottom: 0;">Une expérience utilisateur optimisée et responsive.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { booksApi } from '@/services/api'
import PushNotifications from '@/components/PushNotifications.vue'

export default {
  name: 'HomeView',
  components: {
    PushNotifications
  },
  data() {
    return {
      featuredBooks: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadFeaturedBooks()
  },
  methods: {
    async loadFeaturedBooks() {
      try {
        this.loading = true
        this.error = null
        const response = await booksApi.getBooks(1, 2)        
        this.featuredBooks = response.data.books
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
    }
  }
}
</script>

<style scoped>
.featured-section {
  margin-bottom: 3rem;
}

.notifications-section {
  margin-bottom: 3rem;
}

.notifications-section h2 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.notifications-section p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #666;
}

.about-section {
  margin-bottom: 3rem;
}

.about-section h2 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.about-section p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-content p {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .featured-section h2 {
    font-size: 2rem !important;
  }
}
</style>

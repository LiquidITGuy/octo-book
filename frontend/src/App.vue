<template>
  <div id="app">
    <!-- Indicateur hors ligne -->
    <OfflineIndicator @connection-restored="handleConnectionRestored" />
    
    <!-- Prompt d'installation PWA -->
    <InstallPWA />
    
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">Octo Books</router-link>
        
        <!-- Navigation desktop -->
        <nav class="desktop-nav">
          <ul class="nav">
            <li><router-link to="/">Accueil</router-link></li>
            <li><router-link to="/books">Livres</router-link></li>
            <li><router-link to="/favorites">Favoris ({{ favoritesCount }})</router-link></li>
          </ul>
        </nav>
        
        <div class="header-controls">
          <SearchBar />
          <ThemeToggle class="desktop-theme-toggle" />
          <MobileMenu />
        </div>
      </div>
    </header>

    <main>
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    
    <!-- Bouton retour en haut -->
    <BackToTop />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import OfflineIndicator from './components/OfflineIndicator.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import InstallPWA from './components/InstallPWA.vue'
import SearchBar from './components/SearchBar.vue'
import MobileMenu from './components/MobileMenu.vue'
import BackToTop from './components/BackToTop.vue'
import { useTheme } from './composables/useTheme'
import { useFavorites } from './composables/useFavorites'
import { usePerformance } from './composables/usePerformance'

export default {
  name: 'App',
  components: {
    OfflineIndicator,
    ThemeToggle,
    InstallPWA,
    SearchBar,
    MobileMenu,
    BackToTop
  },
  setup() {
    const { initTheme } = useTheme()
    const { initFavorites, favoritesCount } = useFavorites()
    const { metrics, logMetrics } = usePerformance()

    onMounted(() => {
      // Initialiser le thème et les favoris au démarrage
      initTheme()
      initFavorites()

      // Logger les métriques après un délai pour laisser l'app se charger
      setTimeout(() => {
        logMetrics()
      }, 2000)
    })

    return {
      favoritesCount,
      metrics
    }
  },
  methods: {
    handleConnectionRestored() {
      console.log('Connexion rétablie - l\'application peut maintenant récupérer les dernières données')
      
      // Optionnel : recharger la page actuelle pour récupérer les dernières données
      // this.$router.go(0)
      
      // Ou émettre un événement global pour que les composants se mettent à jour
      this.$root.$emit('connection-restored')
    }
  }
}
</script>

<style>
@import './assets/main.css';
</style>

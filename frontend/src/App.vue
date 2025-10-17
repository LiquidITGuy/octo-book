<template>
  <div id="app">
    <!-- Indicateur de pull-to-refresh -->
    <PullToRefresh 
      :is-pull-to-refresh-enabled="isPullToRefreshEnabled"
      :is-refreshing="isRefreshing"
      :pull-distance="pullDistance"
    />
    
    <!-- Indicateur hors ligne -->
    <OfflineIndicator @connection-restored="handleConnectionRestored" />
    
    <!-- Notification de mise à jour -->
    <UpdateNotification 
      :update-available="updateAvailable"
      @update="handleUpdate"
      @dismiss="handleDismiss"
    />
    
    <!-- Prompt d'installation PWA -->
    <InstallPWA />
    
    <header class="header">
      <div class="header-content">
        <!-- Menu burger mobile (à gauche sur mobile) -->
        <MobileMenu class="mobile-menu-left" />
        
        <router-link to="/" class="logo">Octo Books</router-link>
        
        <!-- Navigation desktop -->
        <nav class="desktop-nav">
          <ul class="nav">
            <li><router-link to="/">Accueil </router-link></li>
            <li><router-link to="/books">Livres</router-link></li>
            <li><router-link to="/favorites">Favoris ({{ favoritesCount }})</router-link></li>
          </ul>
        </nav>
        
        <div class="header-controls">
          <SearchBar />
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
import { useRouter } from 'vue-router'
import OfflineIndicator from './components/OfflineIndicator.vue'
import PullToRefresh from './components/PullToRefresh.vue'
import UpdateNotification from './components/UpdateNotification.vue'
import InstallPWA from './components/InstallPWA.vue'
import SearchBar from './components/SearchBar.vue'
import MobileMenu from './components/MobileMenu.vue'
import BackToTop from './components/BackToTop.vue'
import { useFavorites } from './composables/useFavorites'
import { usePerformance } from './composables/usePerformance'
import { useServiceWorkerUpdate } from './composables/useServiceWorkerUpdate'
import { useGestures } from './composables/useGestures'

export default {
  name: 'App',
  components: {
    OfflineIndicator,
    PullToRefresh,
    UpdateNotification,
    InstallPWA,
    SearchBar,
    MobileMenu,
    BackToTop
  },
  setup() {
    const router = useRouter()
    const { initFavorites, favoritesCount } = useFavorites()
    const { metrics, logMetrics } = usePerformance()
    const { updateAvailable, activateUpdate } = useServiceWorkerUpdate()
    const { isRefreshing, pullDistance, isPullToRefreshEnabled, isGestureSupported } = useGestures()

    onMounted(() => {
      // Initialiser les favoris au démarrage
      initFavorites()

      // Logger les métriques après un délai pour laisser l'app se charger
      setTimeout(() => {
        logMetrics()
      }, 2000)

      // Écouter les messages du service worker pour la navigation
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'NAVIGATE_TO') {
            // Naviguer vers l'URL demandée
            router.push(event.data.url)
          }
        })
      }
    })

    const handleUpdate = () => {
      console.log('Activation de la mise à jour...')
      activateUpdate()
    }

    const handleDismiss = () => {
      console.log('Mise à jour reportée')
    }

    return {
      favoritesCount,
      metrics,
      updateAvailable,
      handleUpdate,
      handleDismiss,
      isRefreshing,
      pullDistance,
      isPullToRefreshEnabled,
      isGestureSupported
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

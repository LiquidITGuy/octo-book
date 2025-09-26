<template>
  <div id="app">
    <!-- Indicateur hors ligne -->
    <OfflineIndicator @connection-restored="handleConnectionRestored" />
    
    <!-- Prompt d'installation PWA -->
    <InstallPWA />
    
    <header class="header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <router-link to="/" class="logo">Octo Books</router-link>
        <nav>
          <ul class="nav">
            <li><router-link to="/">Accueil</router-link></li>
            <li><router-link to="/books">Livres</router-link></li>
            <li><router-link to="/favorites">Favoris ({{ favoritesCount }})</router-link></li>
          </ul>
        </nav>
        <div class="header-controls" :class="{ 'header-controls-hidden': isScrolled && isMobile }">
          <ThemeToggle />
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
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import OfflineIndicator from './components/OfflineIndicator.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import InstallPWA from './components/InstallPWA.vue'
import { useTheme } from './composables/useTheme'
import { useFavorites } from './composables/useFavorites'
import { usePerformance } from './composables/usePerformance'

export default {
  name: 'App',
  components: {
    OfflineIndicator,
    ThemeToggle,
    InstallPWA
  },
  setup() {
    const { initTheme } = useTheme()
    const { initFavorites, favoritesCount } = useFavorites()
    const { metrics, logMetrics } = usePerformance()
    
    // État pour le scroll et la détection mobile
    const isScrolled = ref(false)
    const isMobile = ref(false)
    let scrollTimeout = null
    
    // Fonction pour détecter si on est sur mobile
    const checkIfMobile = () => {
      isMobile.value = window.innerWidth <= 768
    }
    
    // Fonction pour gérer le scroll avec debounce et hysteresis
    const handleScroll = () => {
      const scrollY = window.scrollY
      const threshold = 350 // Seuil très élevé pour éviter l'activation précoce
      const hysteresis = 200 // Zone d'hystérésis pour éviter les oscillations
      
      // Clearner le timeout précédent
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      
      // Debounce pour éviter les appels trop fréquents
      scrollTimeout = setTimeout(() => {
        if (!isScrolled.value && scrollY > threshold) {
          // Activer le mode scrollé
          isScrolled.value = true
        } else if (isScrolled.value && scrollY < (threshold - hysteresis)) {
          // Désactiver le mode scrollé avec hystérésis
          isScrolled.value = false
        }
      }, 10) // Petit délai pour debounce
    }
    
    // Fonction pour gérer le redimensionnement
    const handleResize = () => {
      checkIfMobile()
    }

    onMounted(() => {
      // Initialiser le thème et les favoris au démarrage
      initTheme()
      initFavorites()
      
      // Vérifier si on est sur mobile au démarrage
      checkIfMobile()
      
      // Ajouter les event listeners
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize, { passive: true })

      // Logger les métriques après un délai pour laisser l'app se charger
      setTimeout(() => {
        logMetrics()
      }, 2000)
    })
    
    onUnmounted(() => {
      // Nettoyer les event listeners
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      
      // Nettoyer le timeout si il existe
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    })

    return {
      favoritesCount,
      metrics,
      isScrolled,
      isMobile
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

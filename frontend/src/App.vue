<template>
  <div id="app">
    <!-- Indicateur hors ligne -->
    <OfflineIndicator @connection-restored="handleConnectionRestored" />
    
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">Octo Books</router-link>
        <nav>
          <ul class="nav">
            <li><router-link to="/">Accueil</router-link></li>
            <li><router-link to="/books">Livres</router-link></li>
          </ul>
        </nav>
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
import OfflineIndicator from './components/OfflineIndicator.vue'

export default {
  name: 'App',
  components: {
    OfflineIndicator
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

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker enregistré avec succès:', registration.scope)
      
      // Gestion des mises à jour du service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouveau service worker disponible
              console.log('Nouvelle version disponible')
              // Optionnel: notifier l'utilisateur qu'une mise à jour est disponible
              if (confirm('Une nouvelle version est disponible. Voulez-vous recharger la page ?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' })
                window.location.reload()
              }
            }
          })
        }
      })
      
    } catch (error) {
      console.error('Échec de l\'enregistrement du Service Worker:', error)
    }
  })
  
  // Écouter les changements de contrôleur (nouveau SW activé)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

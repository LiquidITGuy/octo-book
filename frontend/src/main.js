import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

// Masquer le loader initial une fois que Vue est monté
app.mount('#app')

// Masquer le loader initial avec une petite animation
setTimeout(() => {
  const loader = document.querySelector('.initial-loader')
  if (loader) {
    loader.style.opacity = '0'
    loader.style.transition = 'opacity 0.3s ease-out'
    setTimeout(() => {
      loader.remove()
    }, 300)
  }
}, 100)

// Note: L'enregistrement et la gestion des mises à jour du Service Worker
// sont maintenant gérés par le composable useServiceWorkerUpdate dans App.vue

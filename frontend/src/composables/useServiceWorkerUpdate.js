import { ref, onMounted, onUnmounted } from 'vue'
const TEMPS_DE_MISE_A_JOUR_DE_LAPP = 60000

export function useServiceWorkerUpdate() {
  const updateAvailable = ref(false)
  const registration = ref(null)
  const newWorker = ref(null)
  const checkInterval = ref(null)

  // Vérifier les mises à jour du service worker
  const checkForUpdate = async () => {
    if (!registration.value) {
      return
    }

    try {
      console.log('Vérification des mises à jour...')
      await registration.value.update()
    } catch (error) {
      console.error('Erreur lors de la vérification des mises à jour:', error)
    }
  }

  // Activer la mise à jour
  const activateUpdate = () => {
    if (!newWorker.value) {
      return
    }

    newWorker.value.postMessage({ type: 'SKIP_WAITING' })
    updateAvailable.value = false
  }

  // Gérer les événements du service worker
  const handleUpdateFound = (reg) => {
    const installingWorker = reg.installing

    if (!installingWorker) {
      return
    }

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // Nouveau service worker installé et un ancien est déjà actif
        console.log('Nouvelle version détectée')
        newWorker.value = installingWorker
        updateAvailable.value = true
      }
    })
  }

  // Initialiser le gestionnaire de mises à jour
  const initialize = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker non supporté')
      return
    }

    try {
      // Récupérer ou enregistrer le service worker
      let reg = await navigator.serviceWorker.getRegistration()
      
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker enregistré:', reg.scope)
      }

      registration.value = reg

      // Écouter les mises à jour
      reg.addEventListener('updatefound', () => {
        console.log('Mise à jour détectée')
        handleUpdateFound(reg)
      })

      // Vérifier immédiatement au démarrage
      await checkForUpdate()

      // Vérifier périodiquement (toutes les 60 secondes)
      checkInterval.value = setInterval(() => {
        checkForUpdate()
      }, TEMPS_DE_MISE_A_JOUR_DE_LAPP)

      // Écouter les changements de contrôleur
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Nouveau service worker activé, rechargement...')
        window.location.reload()
      })

      // Si un service worker est en attente d'activation
      if (reg.waiting) {
        console.log('Service worker en attente détecté')
        newWorker.value = reg.waiting
        updateAvailable.value = true
      }

    } catch (error) {
      console.error('Erreur lors de l\'initialisation du gestionnaire de mises à jour:', error)
    }
  }

  // Nettoyer l'intervalle lors de la destruction
  const cleanup = () => {
    if (checkInterval.value) {
      clearInterval(checkInterval.value)
      checkInterval.value = null
    }
  }

  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    updateAvailable,
    activateUpdate,
    checkForUpdate
  }
}

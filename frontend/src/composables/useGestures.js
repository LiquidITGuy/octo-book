import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function useGestures() {
  const router = useRouter()
  const isPullToRefreshEnabled = ref(false)
  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  const swipeThreshold = 100 // Distance minimale pour déclencher un swipe
  const pullThreshold = 80 // Distance minimale pour déclencher le refresh

  let touchStartX = 0
  let touchStartY = 0
  let touchEndX = 0
  let touchEndY = 0
  let startScrollY = 0
  let isPulling = false

  // Vérifier si l'appareil supporte les gestes
  const isGestureSupported = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  // Gestion du pull-to-refresh
  const handleTouchStart = (e) => {
    if (!isGestureSupported()) return

    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    startScrollY = window.scrollY

    // Pull-to-refresh uniquement si on est en haut de la page
    if (startScrollY === 0) {
      isPulling = true
      isPullToRefreshEnabled.value = true
    }
  }

  const handleTouchMove = (e) => {
    if (!isGestureSupported()) return

    touchEndX = e.touches[0].clientX
    touchEndY = e.touches[0].clientY

    // Calcul du pull-to-refresh
    if (isPulling && startScrollY === 0) {
      const deltaY = touchEndY - touchStartY
      
      if (deltaY > 0 && deltaY < 150) {
        pullDistance.value = deltaY
        
        // Empêcher le scroll par défaut pendant le pull
        if (deltaY > 10) {
          e.preventDefault()
        }
      }
    }
  }

  const handleTouchEnd = async () => {
    if (!isGestureSupported()) return

    const deltaX = touchEndX - touchStartX
    const deltaY = touchEndY - touchStartY

    // Pull-to-refresh
    if (isPulling && pullDistance.value > pullThreshold) {
      isRefreshing.value = true
      
      try {
        // Attendre un court instant pour l'animation
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Recharger la page courante
        await router.go(0)
      } catch (error) {
        console.error('Erreur lors du rafraîchissement:', error)
      } finally {
        setTimeout(() => {
          isRefreshing.value = false
          pullDistance.value = 0
        }, 500)
      }
    } else {
      // Réinitialiser le pull
      pullDistance.value = 0
    }

    isPulling = false
    isPullToRefreshEnabled.value = false

    // Gestion du swipe horizontal (navigation)
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // S'assurer que c'est un mouvement horizontal
    if (absDeltaX > absDeltaY && absDeltaX > swipeThreshold) {
      if (deltaX > 0) {
        // Swipe vers la droite (retour en arrière)
        handleSwipeRight()
      } else {
        // Swipe vers la gauche (avant)
        handleSwipeLeft()
      }
    }

    // Réinitialiser les positions
    touchStartX = 0
    touchStartY = 0
    touchEndX = 0
    touchEndY = 0
  }

  const handleSwipeRight = () => {
    // Navigation arrière dans l'historique
    if (window.history.length > 1) {
      router.back()
      console.log('Geste: Navigation arrière')
    }
  }

  const handleSwipeLeft = () => {
    // Navigation avant dans l'historique
    try {
      router.forward()
      console.log('Geste: Navigation avant')
    } catch (error) {
      // Pas d'historique en avant
      console.log('Pas d\'historique en avant disponible')
    }
  }

  // Gestion du shake pour actualiser (fonctionnalité bonus)
  let lastShakeTime = 0
  const shakeThreshold = 15
  let lastX = 0
  let lastY = 0
  let lastZ = 0

  const handleDeviceMotion = (e) => {
    if (!e.accelerationIncludingGravity) return

    const { x, y, z } = e.accelerationIncludingGravity
    const now = Date.now()

    // Éviter les déclenchements trop fréquents
    if (now - lastShakeTime < 1000) return

    const deltaX = Math.abs(x - lastX)
    const deltaY = Math.abs(y - lastY)
    const deltaZ = Math.abs(z - lastZ)

    if (deltaX > shakeThreshold || deltaY > shakeThreshold || deltaZ > shakeThreshold) {
      lastShakeTime = now
      handleShake()
    }

    lastX = x
    lastY = y
    lastZ = z
  }

  const handleShake = async () => {
    console.log('Geste: Shake détecté - Actualisation')
    isRefreshing.value = true
    
    try {
      await router.go(0)
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error)
    } finally {
      setTimeout(() => {
        isRefreshing.value = false
      }, 500)
    }
  }

  // Gestion des raccourcis clavier (pour desktop)
  const handleKeydown = (e) => {
    // Alt + Flèche gauche : retour
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault()
      if (window.history.length > 1) {
        router.back()
        console.log('Raccourci: Navigation arrière')
      }
    }

    // Alt + Flèche droite : avant
    if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault()
      try {
        router.forward()
        console.log('Raccourci: Navigation avant')
      } catch (error) {
        console.log('Pas d\'historique en avant disponible')
      }
    }

    // Ctrl/Cmd + R : actualiser
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      // Laisser le comportement par défaut mais logger
      console.log('Raccourci: Actualisation de la page')
    }
  }

  // Initialiser les listeners
  const initialize = () => {
    if (isGestureSupported()) {
      document.addEventListener('touchstart', handleTouchStart, { passive: false })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      
      // Shake gesture (si supporté)
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleDeviceMotion)
      }
    }

    // Raccourcis clavier (desktop)
    document.addEventListener('keydown', handleKeydown)

    console.log('Gestes activés:', {
      touch: isGestureSupported(),
      motion: !!window.DeviceMotionEvent,
      keyboard: true
    })
  }

  // Nettoyer les listeners
  const cleanup = () => {
    if (isGestureSupported()) {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleDeviceMotion)
      }
    }

    document.removeEventListener('keydown', handleKeydown)
  }

  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    isRefreshing,
    pullDistance,
    isPullToRefreshEnabled,
    isGestureSupported: isGestureSupported()
  }
}

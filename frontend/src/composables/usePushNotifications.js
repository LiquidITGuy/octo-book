import { ref, computed } from 'vue'

// État global des notifications push
const isSupported = ref(false)
const isSubscribed = ref(false)
const subscription = ref(null)
const permission = ref('default')
const isLoading = ref(false)
const error = ref(null)

export function usePushNotifications() {
  // Vérifier le support des notifications push
  const checkSupport = () => {
    isSupported.value = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window
    
    if (isSupported.value) {
      permission.value = Notification.permission
    }
    
    return isSupported.value
  }

  // Convertir la clé VAPID en Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Demander la permission pour les notifications
  const requestPermission = async () => {
    if (!isSupported.value) {
      throw new Error('Les notifications push ne sont pas supportées')
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      return result === 'granted'
    } catch (err) {
      console.error('Erreur lors de la demande de permission:', err)
      error.value = 'Impossible de demander la permission pour les notifications'
      throw err
    }
  }

  // S'abonner aux notifications push
  const subscribe = async () => {
    if (!isSupported.value) {
      throw new Error('Les notifications push ne sont pas supportées')
    }

    if (permission.value !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        throw new Error('Permission refusée pour les notifications')
      }
    }

    isLoading.value = true
    error.value = null

    try {
      // Récupérer la clé VAPID depuis l'API
      const vapidResponse = await fetch('/api/push/vapid-public-key')
      if (!vapidResponse.ok) {
        throw new Error('Impossible de récupérer la clé VAPID')
      }
      const { publicKey } = await vapidResponse.json()

      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // S'abonner aux notifications push
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      // Envoyer l'abonnement au serveur
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: newSubscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement de l\'abonnement')
      }

      subscription.value = newSubscription
      isSubscribed.value = true
      
      console.log('Abonnement aux notifications push réussi')
      return newSubscription

    } catch (err) {
      console.error('Erreur lors de l\'abonnement aux notifications push:', err)
      error.value = err.message
      isSubscribed.value = false
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Se désabonner des notifications push
  const unsubscribe = async () => {
    if (!subscription.value) {
      return true
    }

    isLoading.value = true
    error.value = null

    try {
      // Désabonner du navigateur
      const success = await subscription.value.unsubscribe()
      
      if (success) {
        // Supprimer l'abonnement du serveur
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: subscription.value.toJSON()
          })
        })
        
        subscription.value = null
        isSubscribed.value = false
        console.log('Désabonnement des notifications push réussi')
      }
      
      return success
    } catch (err) {
      console.error('Erreur lors du désabonnement:', err)
      error.value = 'Impossible de se désabonner des notifications push'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Tester une notification locale
  const testNotification = async () => {
    if (permission.value !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        throw new Error('Permission refusée pour les notifications')
      }
    }

    const registration = await navigator.serviceWorker.ready
    
    await registration.showNotification('Test - Nouveau livre !', {
      body: 'Ceci est une notification de test pour un nouveau livre.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'test-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'Voir le livre',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Ignorer'
        }
      ],
      data: {
        url: '/books',
        bookId: null,
        test: true
      }
    })
  }

  // Vérifier l'abonnement existant
  const checkExistingSubscription = async () => {
    if (!isSupported.value) {
      console.log('🚫 Push notifications non supportées, skip de la vérification')
      return
    }

    try {
      console.log('🔍 Vérification de l\'abonnement existant...')
      console.log('🔍 État actuel:', { 
        isSupported: isSupported.value, 
        isSubscribed: isSubscribed.value,
        permission: permission.value 
      })
      
      // Attendre que le service worker soit disponible
      if ('serviceWorker' in navigator) {
        console.log('📝 Enregistrement du service worker...')
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('⏳ Attente que le service worker soit prêt...')
        await navigator.serviceWorker.ready
        console.log('✅ Service worker prêt')
        
        console.log('🔍 Recherche d\'un abonnement existant...')
        const existingSubscription = await registration.pushManager.getSubscription()
        
        if (existingSubscription) {
          subscription.value = existingSubscription
          isSubscribed.value = true
          console.log('✅ Abonnement existant détecté!')
          console.log('📋 Endpoint:', existingSubscription.endpoint.substring(0, 50) + '...')
          console.log('📋 Keys:', {
            p256dh: existingSubscription.keys.p256dh.substring(0, 20) + '...',
            auth: existingSubscription.keys.auth.substring(0, 20) + '...'
          })
        } else {
          subscription.value = null
          isSubscribed.value = false
          console.log('ℹ️ Aucun abonnement existant trouvé')
        }
        
        console.log('🔍 État final après vérification:', { 
          isSubscribed: isSubscribed.value,
          hasSubscription: !!subscription.value 
        })
      } else {
        console.log('❌ Service Worker non supporté')
      }
    } catch (err) {
      console.error('❌ Erreur lors de la vérification de l\'abonnement existant:', err)
      subscription.value = null
      isSubscribed.value = false
    }
  }

  // Propriétés calculées
  const canSubscribe = computed(() => 
    isSupported.value && 
    permission.value !== 'denied' && 
    !isSubscribed.value
  )

  const canUnsubscribe = computed(() => 
    isSupported.value && 
    isSubscribed.value
  )

  const permissionDenied = computed(() => 
    permission.value === 'denied'
  )

  // Initialiser au chargement
  const initialize = async () => {
    console.log('🔄 Initialisation des push notifications...')
    checkSupport()
    
    if (isSupported.value) {
      // Attendre un peu pour laisser le temps au navigateur de se préparer
      setTimeout(async () => {
        await checkExistingSubscription()
      }, 100)
    } else {
      console.log('❌ Push notifications non supportées par ce navigateur')
    }
  }

  // Lancer l'initialisation seulement si on est dans le navigateur
  if (typeof window !== 'undefined') {
    initialize()
  }

  return {
    // État
    isSupported: computed(() => isSupported.value),
    isSubscribed: computed(() => isSubscribed.value),
    permission: computed(() => permission.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    subscription: computed(() => subscription.value),
    
    // Propriétés calculées
    canSubscribe,
    canUnsubscribe,
    permissionDenied,
    
    // Méthodes
    requestPermission,
    subscribe,
    unsubscribe,
    testNotification
  }
}

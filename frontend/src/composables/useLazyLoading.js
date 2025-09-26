import { ref, onMounted, onUnmounted, watch } from 'vue'

export function useLazyLoading(options = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    once = true
  } = options

  const isVisible = ref(false)
  const target = ref(null)
  let observer = null

  const createObserver = () => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      // Fallback pour les environnements sans IntersectionObserver
      isVisible.value = true
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            
            // Si on ne veut observer qu'une fois, on déconnecte l'observer
            if (once && observer) {
              observer.disconnect()
            }
          } else if (!once) {
            isVisible.value = false
          }
        })
      },
      {
        rootMargin,
        threshold
      }
    )

    if (target.value) {
      observer.observe(target.value)
    }
  }

  const startObserving = () => {
    if (target.value && observer) {
      observer.observe(target.value)
    }
  }

  const stopObserving = () => {
    if (observer) {
      observer.disconnect()
    }
  }

  onMounted(() => {
    createObserver()
  })

  onUnmounted(() => {
    stopObserving()
  })

  return {
    isVisible,
    target,
    startObserving,
    stopObserving
  }
}

// Composable spécialisé pour les images lazy loading
export function useLazyImage(src, options = {}) {
  const { isVisible, target } = useLazyLoading(options)
  const imageLoaded = ref(false)
  const imageError = ref(false)
  const imageSrc = ref('')

  // Charger l'image quand elle devient visible
  const loadImage = () => {
    if (!src || imageSrc.value || imageLoaded.value) return

    const img = new Image()
    
    img.onload = () => {
      imageSrc.value = src
      imageLoaded.value = true
      imageError.value = false
    }
    
    img.onerror = () => {
      imageError.value = true
      imageLoaded.value = false
    }
    
    img.src = src
  }

  // Surveiller la visibilité pour charger l'image
  const stopWatcher = watch(isVisible, (visible) => {
    if (visible && !imageLoaded.value && !imageError.value) {
      loadImage()
    }
  }, { immediate: true })

  onUnmounted(() => {
    stopWatcher()
  })

  return {
    target,
    imageSrc,
    imageLoaded,
    imageError,
    isVisible
  }
}

// Composable pour la pagination infinie
export function useInfiniteScroll(loadMore, options = {}) {
  const {
    rootMargin = '100px',
    threshold = 0.1
  } = options

  const isLoading = ref(false)
  const hasMore = ref(true)
  const target = ref(null)
  let observer = null

  const createObserver = () => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return
    }

    observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0]
        
        if (entry.isIntersecting && hasMore.value && !isLoading.value) {
          isLoading.value = true
          
          try {
            const result = await loadMore()
            
            // Si loadMore retourne false ou un objet avec hasMore: false
            if (result === false || (result && result.hasMore === false)) {
              hasMore.value = false
            }
          } catch (error) {
            console.error('Erreur lors du chargement:', error)
          } finally {
            isLoading.value = false
          }
        }
      },
      {
        rootMargin,
        threshold
      }
    )

    if (target.value) {
      observer.observe(target.value)
    }
  }

  const reset = () => {
    hasMore.value = true
    isLoading.value = false
  }

  const stop = () => {
    hasMore.value = false
    if (observer) {
      observer.disconnect()
    }
  }

  onMounted(() => {
    createObserver()
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    target,
    isLoading,
    hasMore,
    reset,
    stop
  }
}

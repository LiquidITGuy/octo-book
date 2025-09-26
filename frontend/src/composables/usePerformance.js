import { ref, onMounted, onUnmounted } from 'vue'

// Composable pour mesurer les performances
export function usePerformance() {
  const metrics = ref({
    loadTime: 0,
    renderTime: 0,
    imageLoadTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0
  })

  const startTime = ref(0)
  const observers = []

  // Mesurer le temps de chargement de la page
  const measurePageLoad = () => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation) {
        metrics.value.loadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart)
      }
    }
  }

  // Mesurer le temps de rendu
  const startRenderMeasure = () => {
    startTime.value = performance.now()
  }

  const endRenderMeasure = () => {
    if (startTime.value > 0) {
      metrics.value.renderTime = Math.round(performance.now() - startTime.value)
    }
  }

  // Mesurer le temps de réponse API
  const measureApiCall = async (apiCall) => {
    const start = performance.now()
    try {
      const result = await apiCall()
      metrics.value.apiResponseTime = Math.round(performance.now() - start)
      return result
    } catch (error) {
      metrics.value.apiResponseTime = Math.round(performance.now() - start)
      throw error
    }
  }

  // Mesurer l'utilisation mémoire
  const measureMemoryUsage = () => {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      const memory = window.performance.memory
      metrics.value.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
    }
  }

  // Observer les Core Web Vitals
  const observeWebVitals = () => {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          metrics.value.lcp = Math.round(lastEntry.startTime)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            metrics.value.fid = Math.round(entry.processingStart - entry.startTime)
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        observers.push(fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              metrics.value.cls = Math.round(clsValue * 1000) / 1000
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        observers.push(clsObserver)
      } catch (e) {
        console.warn('CLS observer not supported')
      }
    }
  }

  // Logger les métriques
  const logMetrics = () => {
    console.group('📊 Performance Metrics')
    console.log('Page Load Time:', metrics.value.loadTime + 'ms')
    console.log('Render Time:', metrics.value.renderTime + 'ms')
    console.log('API Response Time:', metrics.value.apiResponseTime + 'ms')
    console.log('Memory Usage:', metrics.value.memoryUsage + 'MB')
    if (metrics.value.lcp) console.log('LCP:', metrics.value.lcp + 'ms')
    if (metrics.value.fid) console.log('FID:', metrics.value.fid + 'ms')
    if (metrics.value.cls) console.log('CLS:', metrics.value.cls)
    console.groupEnd()
  }

  // Nettoyer les observers
  const cleanup = () => {
    observers.forEach(observer => {
      try {
        observer.disconnect()
      } catch (e) {
        // Observer déjà déconnecté
      }
    })
    observers.length = 0
  }

  onMounted(() => {
    measurePageLoad()
    observeWebVitals()
    
    // Mesurer l'utilisation mémoire périodiquement
    const memoryInterval = setInterval(measureMemoryUsage, 5000)
    
    onUnmounted(() => {
      clearInterval(memoryInterval)
      cleanup()
    })
  })

  return {
    metrics,
    startRenderMeasure,
    endRenderMeasure,
    measureApiCall,
    measureMemoryUsage,
    logMetrics
  }
}

// Composable pour optimiser les images
export function useImageOptimization() {
  const imageCache = new Map()
  const loadingImages = new Set()

  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      if (imageCache.has(src)) {
        resolve(imageCache.get(src))
        return
      }

      if (loadingImages.has(src)) {
        // Attendre que l'image en cours de chargement soit terminée
        const checkLoading = () => {
          if (!loadingImages.has(src)) {
            resolve(imageCache.get(src))
          } else {
            setTimeout(checkLoading, 50)
          }
        }
        checkLoading()
        return
      }

      loadingImages.add(src)
      const img = new Image()
      
      img.onload = () => {
        imageCache.set(src, img)
        loadingImages.delete(src)
        resolve(img)
      }
      
      img.onerror = () => {
        loadingImages.delete(src)
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      img.src = src
    })
  }

  const preloadImages = async (sources) => {
    const promises = sources.map(src => preloadImage(src).catch(() => null))
    return Promise.all(promises)
  }

  const clearImageCache = () => {
    imageCache.clear()
    loadingImages.clear()
  }

  const getCacheSize = () => {
    return imageCache.size
  }

  return {
    preloadImage,
    preloadImages,
    clearImageCache,
    getCacheSize
  }
}

// Composable pour optimiser les requêtes API
export function useApiOptimization() {
  const requestCache = new Map()
  const pendingRequests = new Map()

  const cachedRequest = async (key, requestFn, ttl = 300000) => { // 5 minutes par défaut
    const now = Date.now()
    
    // Vérifier le cache
    if (requestCache.has(key)) {
      const cached = requestCache.get(key)
      if (now - cached.timestamp < ttl) {
        return cached.data
      } else {
        requestCache.delete(key)
      }
    }

    // Vérifier les requêtes en cours
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key)
    }

    // Faire la requête
    const promise = requestFn().then(data => {
      requestCache.set(key, { data, timestamp: now })
      pendingRequests.delete(key)
      return data
    }).catch(error => {
      pendingRequests.delete(key)
      throw error
    })

    pendingRequests.set(key, promise)
    return promise
  }

  const clearCache = () => {
    requestCache.clear()
    pendingRequests.clear()
  }

  const getCacheStats = () => {
    return {
      cacheSize: requestCache.size,
      pendingRequests: pendingRequests.size
    }
  }

  return {
    cachedRequest,
    clearCache,
    getCacheStats
  }
}

// Composable pour débouncer les fonctions
export function useDebounce() {
  const debounce = (func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }

  const throttle = (func, delay) => {
    let lastCall = 0
    return (...args) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        return func.apply(null, args)
      }
    }
  }

  return {
    debounce,
    throttle
  }
}

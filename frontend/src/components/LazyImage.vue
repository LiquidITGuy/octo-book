<template>
  <div 
    ref="target" 
    class="lazy-image-container"
    :class="{ 'loaded': imageLoaded, 'error': imageError }"
  >
    <!-- Placeholder pendant le chargement -->
    <div v-if="!imageLoaded && !imageError" class="lazy-placeholder">
      <div class="lazy-skeleton"></div>
      <div v-if="showIcon" class="lazy-icon">📚</div>
    </div>

    <!-- Image chargée -->
    <img
      v-if="imageSrc && !imageError"
      :src="imageSrc"
      :alt="alt"
      :class="imageClass"
      @load="onImageLoad"
      @error="onImageError"
      :loading="nativeLazy ? 'lazy' : 'eager'"
    />

    <!-- Fallback en cas d'erreur -->
    <div v-if="imageError" class="lazy-error">
      <div class="lazy-error-icon">📚</div>
      <span v-if="showErrorText" class="lazy-error-text">Image non disponible</span>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    imageClass: {
      type: String,
      default: ''
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    showErrorText: {
      type: Boolean,
      default: false
    },
    nativeLazy: {
      type: Boolean,
      default: false
    },
    rootMargin: {
      type: String,
      default: '50px'
    },
    threshold: {
      type: Number,
      default: 0.1
    }
  },
  emits: ['load', 'error'],
  setup(props, { emit }) {
    const target = ref(null)
    const imageSrc = ref('')
    const imageLoaded = ref(false)
    const imageError = ref(false)
    const isVisible = ref(false)
    
    let observer = null

    const loadImage = () => {
      if (!props.src || imageSrc.value || imageLoaded.value) return

      const img = new Image()
      
      img.onload = () => {
        imageSrc.value = props.src
        imageLoaded.value = true
        imageError.value = false
        emit('load')
      }
      
      img.onerror = () => {
        imageError.value = true
        imageLoaded.value = false
        emit('error')
      }
      
      img.src = props.src
    }

    const createObserver = () => {
      if (typeof window === 'undefined' || !window.IntersectionObserver) {
        isVisible.value = true
        loadImage()
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isVisible.value) {
              isVisible.value = true
              loadImage()
              observer.disconnect()
            }
          })
        },
        {
          rootMargin: props.rootMargin,
          threshold: props.threshold
        }
      )

      if (target.value) {
        observer.observe(target.value)
      }
    }

    const onImageLoad = () => {
      emit('load')
    }

    const onImageError = () => {
      emit('error')
    }

    // Surveiller les changements de src pour recharger l'image
    watch(() => props.src, (newSrc) => {
      if (newSrc && newSrc !== imageSrc.value) {
        imageLoaded.value = false
        imageError.value = false
        imageSrc.value = ''
        isVisible.value = false
        
        // Recréer l'observer pour la nouvelle image
        if (observer) {
          observer.disconnect()
        }
        createObserver()
      }
    })

    // Surveiller le target pour créer l'observer
    watch(target, (newTarget) => {
      if (newTarget && !observer) {
        createObserver()
      }
    })

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
      imageSrc,
      imageLoaded,
      imageError,
      onImageLoad,
      onImageError
    }
  }
}
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--color-background-secondary);
  transition: all 0.3s ease;
}

.lazy-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lazy-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    var(--color-background-secondary) 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.lazy-icon {
  position: relative;
  z-index: 2;
  font-size: 3rem;
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.lazy-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.lazy-image-container.loaded img {
  opacity: 1;
}

.lazy-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-text-secondary);
  background: var(--color-background-secondary);
}

.lazy-error-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.lazy-error-text {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

/* Animation d'apparition */
.lazy-image-container.loaded {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* États de hover */
.lazy-image-container:hover img {
  transform: scale(1.02);
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .lazy-icon,
  .lazy-error-icon {
    font-size: 2rem;
  }
  
  .lazy-error-text {
    font-size: 0.7rem;
  }
}

/* Désactiver les animations pour les utilisateurs qui préfèrent un mouvement réduit */
@media (prefers-reduced-motion: reduce) {
  .lazy-skeleton {
    animation: none !important;
    background: var(--color-border) !important;
  }
  
  .lazy-image-container.loaded {
    animation: none !important;
  }
  
  .lazy-image-container img,
  .lazy-image-container:hover img {
    transition: none !important;
    transform: none !important;
  }
}
</style>

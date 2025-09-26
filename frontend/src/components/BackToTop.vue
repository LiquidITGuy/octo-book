<template>
  <transition name="back-to-top">
    <button
      v-if="isVisible"
      class="back-to-top-button"
      @click="scrollToTop"
      :aria-label="'Retour en haut de la page'"
      title="Retour en haut"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="18,15 12,9 6,15"></polyline>
      </svg>
    </button>
  </transition>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'BackToTop',
  setup() {
    const isVisible = ref(false)
    let scrollTimeout = null

    const handleScroll = () => {
      // Debounce pour éviter les appels trop fréquents
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      scrollTimeout = setTimeout(() => {
        isVisible.value = window.scrollY > 300
      }, 100)
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll, { passive: true })
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    })

    return {
      isVisible,
      scrollToTop
    }
  }
}
</script>

<style scoped>
.back-to-top-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background: var(--color-primary);
  color: var(--color-background);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.back-to-top-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
  background: var(--color-text);
}

.back-to-top-button:active {
  transform: translateY(0);
}

/* Animations */
.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: all 0.3s ease;
}

.back-to-top-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.back-to-top-enter-to,
.back-to-top-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Responsive */
@media (max-width: 768px) {
  .back-to-top-button {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .back-to-top-button {
    bottom: 1rem;
    right: 1rem;
    width: 44px;
    height: 44px;
  }
}

/* Accessibilité */
.back-to-top-button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Animation de pulsation subtile */
@keyframes pulse {
  0% {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  50% {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  }
  100% {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
}

.back-to-top-button:hover {
  animation: pulse 2s infinite;
}

/* Désactiver les animations pour les utilisateurs qui préfèrent un mouvement réduit */
@media (prefers-reduced-motion: reduce) {
  .back-to-top-button {
    transition: none !important;
    animation: none !important;
  }
  
  .back-to-top-enter-active,
  .back-to-top-leave-active {
    transition: none !important;
  }
  
  .back-to-top-enter-from,
  .back-to-top-leave-to,
  .back-to-top-enter-to,
  .back-to-top-leave-from {
    transform: none !important;
  }
}
</style>

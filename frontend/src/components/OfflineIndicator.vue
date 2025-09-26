<template>
  <transition name="slide-down">
    <div v-if="isOffline" class="offline-indicator">
      <div class="offline-content">
        <span class="offline-icon">📡</span>
        <div class="offline-text">
          <strong>Mode hors ligne</strong>
          <p>Vous consultez les données en cache. Reconnectez-vous pour voir les dernières mises à jour.</p>
        </div>
        <button @click="checkConnection" class="retry-btn" :disabled="isRetrying">
          <span v-if="isRetrying">🔄</span>
          <span v-else>🔄</span>
          {{ isRetrying ? 'Vérification...' : 'Réessayer' }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'OfflineIndicator',
  data() {
    return {
      isOffline: false,
      isRetrying: false
    }
  },
  mounted() {
    this.checkInitialConnection()
    this.setupEventListeners()
  },
  beforeUnmount() {
    this.removeEventListeners()
  },
  methods: {
    checkInitialConnection() {
      this.isOffline = !navigator.onLine
    },
    
    setupEventListeners() {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    },
    
    removeEventListeners() {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    },
    
    handleOnline() {
      console.log('Connexion rétablie')
      this.isOffline = false
      this.isRetrying = false
      
      // Émettre un événement pour informer l'application
      this.$emit('connection-restored')
    },
    
    handleOffline() {
      console.log('Connexion perdue')
      this.isOffline = true
    },
    
    async checkConnection() {
      if (this.isRetrying) return
      
      this.isRetrying = true
      
      try {
        // Tenter une requête vers l'API pour vérifier la connectivité
        const response = await fetch('/api/health', {
          method: 'GET',
          cache: 'no-cache',
          timeout: 5000
        })
        
        if (response.ok) {
          this.handleOnline()
        } else {
          throw new Error('API non accessible')
        }
      } catch (error) {
        console.log('Toujours hors ligne:', error)
        // Rester en mode hors ligne
        setTimeout(() => {
          this.isRetrying = false
        }, 2000)
      }
    }
  }
}
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.offline-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  gap: 1rem;
}

.offline-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.offline-text {
  flex: 1;
  min-width: 0;
}

.offline-text strong {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.offline-text p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.retry-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.retry-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.retry-btn span {
  display: inline-block;
  animation: spin 1s linear infinite;
}

.retry-btn:not(:disabled) span {
  animation: none;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Animations de transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-down-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .offline-content {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .offline-text strong {
    font-size: 0.9rem;
  }
  
  .offline-text p {
    font-size: 0.8rem;
  }
  
  .retry-btn {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .offline-content {
    padding: 0.75rem;
  }
  
  .offline-text p {
    display: none; /* Masquer le texte détaillé sur très petits écrans */
  }
}

/* Ajustement pour éviter que le contenu soit masqué */
body.offline-mode {
  padding-top: 80px;
}

@media (max-width: 768px) {
  body.offline-mode {
    padding-top: 100px;
  }
}
</style>

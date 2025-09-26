<template>
  <div v-if="showInstallPrompt" class="install-pwa">
    <div class="install-banner" :class="{ 'dark-mode': isDark }">
      <div class="install-content">
        <div class="install-icon">📱</div>
        <div class="install-text">
          <h3>Installer Octo Books</h3>
          <p>Accédez rapidement à vos livres depuis votre écran d'accueil</p>
        </div>
        <div class="install-actions">
          <button @click="installApp" class="btn-install">
            Installer
          </button>
          <button @click="dismissPrompt" class="btn-dismiss">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'InstallPWA',
  setup() {
    const { isDark } = useTheme()
    const showInstallPrompt = ref(false)
    const deferredPrompt = ref(null)

    const handleBeforeInstallPrompt = (e) => {
      // Empêcher l'affichage automatique du prompt
      e.preventDefault()
      
      // Stocker l'événement pour l'utiliser plus tard
      deferredPrompt.value = e
      
      // Vérifier si l'utilisateur n'a pas déjà refusé l'installation
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      const installed = localStorage.getItem('pwa-installed')
      
      if (!dismissed && !installed) {
        // Attendre un peu avant d'afficher le prompt pour une meilleure UX
        setTimeout(() => {
          showInstallPrompt.value = true
        }, 3000)
      }
    }

    const handleAppInstalled = () => {
      console.log('PWA installée avec succès')
      localStorage.setItem('pwa-installed', 'true')
      showInstallPrompt.value = false
      deferredPrompt.value = null
    }

    const installApp = async () => {
      if (!deferredPrompt.value) return

      try {
        // Afficher le prompt d'installation
        deferredPrompt.value.prompt()
        
        // Attendre la réponse de l'utilisateur
        const { outcome } = await deferredPrompt.value.userChoice
        
        if (outcome === 'accepted') {
          console.log('Utilisateur a accepté l\'installation')
          localStorage.setItem('pwa-installed', 'true')
        } else {
          console.log('Utilisateur a refusé l\'installation')
          localStorage.setItem('pwa-install-dismissed', 'true')
        }
        
        showInstallPrompt.value = false
        deferredPrompt.value = null
      } catch (error) {
        console.error('Erreur lors de l\'installation:', error)
      }
    }

    const dismissPrompt = () => {
      showInstallPrompt.value = false
      localStorage.setItem('pwa-install-dismissed', 'true')
      
      // Permettre de réafficher le prompt après 7 jours
      setTimeout(() => {
        localStorage.removeItem('pwa-install-dismissed')
      }, 7 * 24 * 60 * 60 * 1000) // 7 jours
    }

    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      // Vérifier si l'app est en mode standalone (installée)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        localStorage.setItem('pwa-installed', 'true')
        return true
      }
      
      // Vérifier pour iOS
      if (window.navigator.standalone === true) {
        localStorage.setItem('pwa-installed', 'true')
        return true
      }
      
      return false
    }

    onMounted(() => {
      // Vérifier si déjà installée
      if (checkIfInstalled()) {
        return
      }

      // Écouter les événements PWA
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.addEventListener('appinstalled', handleAppInstalled)
    })

    onUnmounted(() => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    })

    return {
      isDark,
      showInstallPrompt,
      installApp,
      dismissPrompt
    }
  }
}
</script>

<style scoped>
.install-pwa {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  z-index: 1000;
  pointer-events: none;
}

.install-banner {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
  animation: slideUp 0.3s ease-out;
}

.install-banner.dark-mode {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.install-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.install-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.install-text {
  flex: 1;
}

.install-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.install-text p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.install-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-install {
  background: var(--color-primary);
  color: var(--color-background);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-install:hover {
  background: var(--color-text);
  transform: translateY(-1px);
}

.btn-dismiss {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.btn-dismiss:hover {
  background: var(--color-background-secondary);
  color: var(--color-text);
}

/* Responsive */
@media (max-width: 768px) {
  .install-pwa {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
  }

  .install-content {
    padding: 1rem;
    gap: 0.75rem;
  }

  .install-icon {
    font-size: 1.5rem;
  }

  .install-text h3 {
    font-size: 1rem;
  }

  .install-text p {
    font-size: 0.8rem;
  }

  .btn-install {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .btn-dismiss {
    width: 36px;
    height: 36px;
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .install-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .install-actions {
    justify-content: center;
    width: 100%;
  }

  .btn-install {
    flex: 1;
  }
}

/* Masquer sur les appareils déjà installés */
@media (display-mode: standalone) {
  .install-pwa {
    display: none;
  }
}

/* Désactiver les animations pour les utilisateurs qui préfèrent un mouvement réduit */
@media (prefers-reduced-motion: reduce) {
  .install-banner {
    animation: none !important;
  }
  
  .btn-install:hover,
  .btn-dismiss:hover {
    transform: none !important;
  }
}
</style>

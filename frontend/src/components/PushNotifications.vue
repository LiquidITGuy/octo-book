<template>
  <div class="push-notifications">
    <div class="notification-card">
      <!-- Support non disponible -->
      <div v-if="!isSupported" class="notification-banner warning">
        <div class="banner-icon">⚠️</div>
        <div class="banner-content">
          <strong>Navigateur non compatible</strong>
          <span>Les notifications push ne sont pas supportées</span>
        </div>
      </div>

      <!-- Permission refusée -->
      <div v-else-if="permissionDenied" class="notification-banner error">
        <div class="banner-icon">🚫</div>
        <div class="banner-content">
          <strong>Notifications bloquées</strong>
          <span>Réactivez-les dans les paramètres de votre navigateur</span>
        </div>
      </div>

      <!-- Abonné -->
      <div v-else-if="isSubscribed" class="notification-banner success">
        <div class="banner-icon animated">
          <div class="notification-bell">
            🔔
            <div class="notification-dot"></div>
          </div>
        </div>
        <div class="banner-content">
          <strong>Notifications activées ✨</strong>
          <span>Vous serez alerté des nouveaux livres</span>
        </div>
        <div class="banner-actions">
          <button 
            @click="handleTestNotification" 
            :disabled="isLoading"
            class="btn btn-test"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
            </svg>
            Test
          </button>
          <button 
            @click="handleUnsubscribe" 
            :disabled="isLoading"
            class="btn btn-secondary"
          >
            {{ isLoading ? 'Arrêt...' : 'Arrêter' }}
          </button>
        </div>
      </div>

      <!-- Non abonné -->
      <div v-else class="notification-banner primary">
        <div class="banner-icon">
          <div class="notification-bell inactive">
            🔔
          </div>
        </div>
        <div class="banner-content">
          <strong>Restez informé des nouveaux livres 📚</strong>
          <span>Activez les notifications push pour ne rien manquer</span>
        </div>
        <div class="banner-actions">
          <button 
            @click="handleSubscribe" 
            :disabled="isLoading"
            class="btn btn-primary"
          >
            <svg v-if="!isLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <div v-else class="loading-dots">
              <span></span><span></span><span></span>
            </div>
            {{ isLoading ? 'Activation...' : 'Activer' }}
          </button>
        </div>
      </div>

      <!-- Erreur -->
      <div v-if="error" class="error-alert">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { usePushNotifications } from '@/composables/usePushNotifications'

export default {
  name: 'PushNotifications',
  setup() {
    const {
      isSupported,
      isSubscribed,
      permission,
      isLoading,
      error,
      canSubscribe,
      canUnsubscribe,
      permissionDenied,
      subscribe,
      unsubscribe,
      testNotification
    } = usePushNotifications()

    const handleSubscribe = async () => {
      try {
        await subscribe()
      } catch (err) {
        console.error('Erreur lors de l\'abonnement:', err)
      }
    }

    const handleUnsubscribe = async () => {
      try {
        await unsubscribe()
      } catch (err) {
        console.error('Erreur lors du désabonnement:', err)
      }
    }

    const handleTestNotification = async () => {
      try {
        await testNotification()
      } catch (err) {
        console.error('Erreur lors du test de notification:', err)
      }
    }

    return {
      isSupported,
      isSubscribed,
      permission,
      isLoading,
      error,
      canSubscribe,
      canUnsubscribe,
      permissionDenied,
      handleSubscribe,
      handleUnsubscribe,
      handleTestNotification
    }
  }
}
</script>

<style scoped>
.push-notifications {
  margin: 1rem 0;
}

.notification-card {
  max-width: 800px;
  margin: 0 auto;
}

/* Banner horizontal compact */
.notification-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border-left: 4px solid;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.notification-banner:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* Icônes du banner */
.banner-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-bell {
  position: relative;
  display: inline-block;
  font-size: 1.8rem;
}

.notification-bell.inactive {
  opacity: 0.6;
  filter: grayscale(50%);
}

.notification-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  border-radius: 50%;
  border: 1.5px solid white;
  animation: pulse 2s infinite;
}

.banner-icon.animated .notification-bell {
  animation: bellRing 3s ease-in-out infinite;
}

/* Contenu du banner */
.banner-content {
  flex: 1;
  min-width: 0;
}

.banner-content strong {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text);
}

.banner-content span {
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.4;
}

/* Actions du banner */
.banner-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

/* Boutons compacts */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
  min-height: 36px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-test {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
}

.btn-test:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

/* Loading animation */
.loading-dots {
  display: flex;
  gap: 2px;
  align-items: center;
}

.loading-dots span {
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: loadingBounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

/* Variantes de couleurs */
.notification-banner.success {
  border-left-color: #48bb78;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.05) 0%, rgba(72, 187, 120, 0.02) 100%);
}

.notification-banner.error {
  border-left-color: #f56565;
  background: linear-gradient(135deg, rgba(245, 101, 101, 0.05) 0%, rgba(245, 101, 101, 0.02) 100%);
}

.notification-banner.warning {
  border-left-color: #ed8936;
  background: linear-gradient(135deg, rgba(237, 137, 54, 0.05) 0%, rgba(237, 137, 54, 0.02) 100%);
}

.notification-banner.primary {
  border-left-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(102, 126, 234, 0.02) 100%);
}

/* Alert d'erreur */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #fed7d7, #feb2b2);
  border: 1px solid #fc8181;
  color: #c53030;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.error-icon {
  font-size: 1rem;
}

/* Animations */
@keyframes pulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.1); 
    opacity: 0.8; 
  }
}

@keyframes bellRing {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(15deg); }
  20% { transform: rotate(-15deg); }
  40%, 80% { transform: rotate(0deg); }
}

@keyframes loadingBounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 
  40% { 
    transform: scale(1);
  }
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .notification-banner {
    background: #2d3748;
    color: #f7fafc;
  }

  .banner-content strong {
    color: #f7fafc;
  }

  .banner-content span {
    color: #cbd5e0;
  }

  .btn-secondary {
    background: #4a5568;
    color: #f7fafc;
    border-color: #718096;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #718096;
    border-color: #a0aec0;
  }

  .error-alert {
    background: linear-gradient(135deg, #742a2a, #9c4221);
    border-color: #f56565;
    color: #fed7d7;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .notification-banner {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
    padding: 1rem;
  }

  .banner-content {
    order: 1;
  }

  .banner-icon {
    order: 0;
    font-size: 2rem;
  }

  .banner-actions {
    order: 2;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .notification-banner {
    padding: 0.75rem;
    margin: 0 0.5rem;
  }

  .btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    min-width: 100px;
  }

  .banner-content strong {
    font-size: 0.9rem;
  }

  .banner-content span {
    font-size: 0.8rem;
  }
}
</style>

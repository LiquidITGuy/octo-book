<template>
  <div class="push-notifications">
    <div class="notification-card">
      <div class="card-header">
        <h3>📚 Restez informé</h3>
        <p>Recevez une notification lors de l'ajout d'un nouveau livre</p>
      </div>

      <div class="card-content">
        <!-- Support non disponible -->
        <div v-if="!isSupported" class="status-message warning">
          <span class="icon">⚠️</span>
          <span>Les notifications push ne sont pas supportées par votre navigateur</span>
        </div>

        <!-- Permission refusée -->
        <div v-else-if="permissionDenied" class="status-message error">
          <span class="icon">🚫</span>
          <div>
            <p>Les notifications ont été refusées</p>
            <small>Vous pouvez les réactiver dans les paramètres de votre navigateur</small>
          </div>
        </div>

        <!-- Abonné -->
        <div v-else-if="isSubscribed" class="status-message success">
          <span class="icon">✅</span>
          <div>
            <p>Vous recevrez les notifications des nouveaux livres</p>
            <div class="button-group">
              <button 
                @click="handleUnsubscribe" 
                :disabled="isLoading"
                class="btn btn-secondary"
              >
                {{ isLoading ? 'Désabonnement...' : 'Se désabonner' }}
              </button>
              <button 
                @click="handleTestNotification" 
                :disabled="isLoading"
                class="btn btn-outline"
              >
                Tester
              </button>
            </div>
          </div>
        </div>

        <!-- Non abonné -->
        <div v-else class="status-message info">
          <span class="icon">🔔</span>
          <div>
            <p>Activez les notifications pour être averti des nouveaux livres</p>
            <button 
              @click="handleSubscribe" 
              :disabled="isLoading"
              class="btn btn-primary"
            >
              {{ isLoading ? 'Abonnement...' : 'Recevoir les notifications' }}
            </button>
          </div>
        </div>

        <!-- Erreur -->
        <div v-if="error" class="error-message">
          <span class="icon">❌</span>
          <span>{{ error }}</span>
        </div>
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

<style>
.push-notifications {
  margin: 2rem 0;
}

.notification-card {
  background: var(--color-background-soft, #f8f9fa);
  border: 1px solid var(--color-border, #e9ecef);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-heading, #2c3e50);
  font-size: 1.25rem;
}

.card-header p {
  margin: 0;
  color: var(--color-text-light, #6c757d);
  font-size: 0.9rem;
}

.status-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.status-message:last-child {
  margin-bottom: 0;
}

.status-message .icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.status-message.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.status-message.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.status-message.warning {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.status-message.info {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  border-radius: 6px;
  font-size: 0.9rem;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-background);
  color: var(--color-text);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark, #0056b3);
}

.btn-secondary {
  background-color: var(--color-secondary, #6c757d);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-dark, #545b62);
}

.btn-outline {
  background-color: transparent;
  color: var(--color-primary, #007bff);
  border: 1px solid var(--color-primary, #007bff);
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--color-primary, #007bff);
  color: white;
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .notification-card {
    background: var(--color-background-soft, #1a1a1a);
    border-color: var(--color-border, #333);
  }

  .card-header h3 {
    color: var(--color-heading, #ffffff);
  }

  .card-header p {
    color: var(--color-text-light, #adb5bd);
  }

  .status-message.success {
    background-color: #1e4d2b;
    border-color: #2d5a3d;
    color: #a3d9a5;
  }

  .status-message.error {
    background-color: #4d1e24;
    border-color: #5a2d32;
    color: #f1aeb5;
  }

  .status-message.warning {
    background-color: #4d3d1e;
    border-color: #5a4a2d;
    color: #f0d9a3;
  }

  .status-message.info {
    background-color: #1e3a4d;
    border-color: #2d4a5a;
    color: #a3c9d9;
  }

  .error-message {
    background-color: #4d1e24;
    border-color: #5a2d32;
    color: #f1aeb5;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .notification-card {
    margin: 1rem;
    padding: 1rem;
  }

  .status-message {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .status-message .icon {
    font-size: 2rem;
  }

  .button-group {
    justify-content: center;
  }

  .btn {
    min-width: 140px;
  }
}
</style>

<template>
  <transition name="slide-up">
    <div v-if="show" class="update-notification">
      <div class="update-content">
        <div class="update-icon">🔄</div>
        <div class="update-message">
          <strong>Nouvelle version disponible !</strong>
          <p>Une mise à jour de l'application est prête à être installée.</p>
        </div>
        <div class="update-actions">
          <button @click="handleUpdate" class="btn-update">
            Mettre à jour
          </button>
          <button @click="handleDismiss" class="btn-dismiss">
            Plus tard
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'UpdateNotification',
  props: {
    updateAvailable: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update', 'dismiss'],
  setup(props, { emit }) {
    const show = ref(false)

    watch(() => props.updateAvailable, (newValue) => {
      show.value = newValue
    })

    const handleUpdate = () => {
      emit('update')
    }

    const handleDismiss = () => {
      show.value = false
      emit('dismiss')
    }

    return {
      show,
      handleUpdate,
      handleDismiss
    }
  }
}
</script>

<style scoped>
.update-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  max-width: 500px;
  width: 90%;
}

.update-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 15px;
  animation: pulse 2s ease-in-out infinite;
}

.update-icon {
  font-size: 32px;
  flex-shrink: 0;
  animation: rotate 2s linear infinite;
}

.update-message {
  flex: 1;
}

.update-message strong {
  display: block;
  margin-bottom: 5px;
  font-size: 16px;
}

.update-message p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.update-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.btn-update,
.btn-dismiss {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-update {
  background: white;
  color: #667eea;
}

.btn-update:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-dismiss {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-dismiss:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(100px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(100px);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 10px 50px rgba(102, 126, 234, 0.5);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .update-notification {
    bottom: 10px;
    width: 95%;
  }

  .update-content {
    padding: 15px;
    flex-direction: column;
    text-align: center;
  }

  .update-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn-update,
  .btn-dismiss {
    width: 100%;
  }

  .update-icon {
    font-size: 28px;
  }

  .update-message strong {
    font-size: 15px;
  }

  .update-message p {
    font-size: 13px;
  }
}
</style>

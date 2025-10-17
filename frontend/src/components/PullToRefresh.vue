<template>
  <div 
    v-if="isPullToRefreshEnabled" 
    class="pull-to-refresh-indicator"
    :style="indicatorStyle"
  >
    <div class="refresh-content">
      <div v-if="!isRefreshing" class="pull-icon" :class="{ active: pullDistance >= pullThreshold }">
        <svg 
          :style="{ transform: `rotate(${Math.min(pullDistance * 3.6, 360)}deg)` }"
          viewBox="0 0 24 24" 
          width="32" 
          height="32"
        >
          <path 
            fill="currentColor" 
            d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
          />
        </svg>
      </div>
      <div v-else class="spinner">
        <div class="spinner-ring"></div>
      </div>
      <p class="refresh-text">
        {{ refreshText }}
      </p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'PullToRefresh',
  props: {
    isPullToRefreshEnabled: {
      type: Boolean,
      required: true
    },
    isRefreshing: {
      type: Boolean,
      required: true
    },
    pullDistance: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const pullThreshold = 80

    const indicatorStyle = computed(() => ({
      transform: `translateY(${Math.min(props.pullDistance, 100)}px)`,
      opacity: Math.min(props.pullDistance / pullThreshold, 1)
    }))

    const refreshText = computed(() => {
      if (props.isRefreshing) {
        return 'Actualisation...'
      }
      if (props.pullDistance >= pullThreshold) {
        return 'Relâcher pour actualiser'
      }
      return 'Tirer pour actualiser'
    })

    return {
      pullThreshold,
      indicatorStyle,
      refreshText
    }
  }
}
</script>

<style scoped>
.pull-to-refresh-indicator {
  position: fixed;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.refresh-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.pull-icon {
  color: #667eea;
  transition: all 0.3s ease;
}

.pull-icon.active {
  color: #4caf50;
  transform: scale(1.1);
}

.pull-icon svg {
  display: block;
  transition: transform 0.1s ease;
}

.spinner {
  width: 32px;
  height: 32px;
  position: relative;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.refresh-text {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .refresh-content {
    background: rgba(30, 30, 30, 0.95);
  }

  .refresh-text {
    color: #fff;
  }

  .spinner-ring {
    border-color: rgba(102, 126, 234, 0.3);
    border-top-color: #667eea;
  }
}
</style>

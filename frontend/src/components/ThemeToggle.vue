<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :aria-label="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
    :title="isDark ? 'Mode clair' : 'Mode sombre'"
  >
    <span class="theme-icon">
      {{ isDark ? '☀️' : '🌙' }}
    </span>
    <span class="theme-text">
      {{ isDark ? 'Clair' : 'Sombre' }}
    </span>
  </button>
</template>

<script>
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'ThemeToggle',
  setup() {
    const { isDark, toggleTheme } = useTheme()

    return {
      isDark,
      toggleTheme
    }
  }
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  border-radius: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.theme-toggle:hover {
  background: var(--color-primary);
  color: var(--color-background);
  border-color: var(--color-primary);
}

.theme-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.theme-text {
  font-weight: 400;
}

@media (max-width: 768px) {
  .theme-toggle {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .theme-text {
    display: none;
  }
}
</style>

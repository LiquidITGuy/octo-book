<template>
  <div class="mobile-menu">
    <!-- Bouton hamburger -->
    <button 
      class="hamburger-button"
      @click="toggleMenu"
      :class="{ 'hamburger-active': isOpen }"
      :aria-label="isOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
      aria-expanded="false"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- Overlay -->
    <div 
      v-if="isOpen" 
      class="menu-overlay"
      @click="closeMenu"
    ></div>

    <!-- Menu coulissant -->
    <nav 
      class="mobile-nav"
      :class="{ 'mobile-nav-open': isOpen }"
    >
      <div class="mobile-nav-header">
        <div class="mobile-nav-logo">
          <div class="logo-icon"></div>
          <span>Octo Books</span>
        </div>
        <button 
          class="close-button"
          @click="closeMenu"
          aria-label="Fermer le menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="mobile-nav-content">
        <ul class="mobile-nav-links">
          <li>
            <router-link 
              to="/" 
              @click="closeMenu"
              class="mobile-nav-link"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
              </svg>
              <span>Accueil</span>
            </router-link>
          </li>
          <li>
            <router-link 
              to="/books" 
              @click="closeMenu"
              class="mobile-nav-link"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Livres</span>
            </router-link>
          </li>
          <li>
            <router-link 
              to="/favorites" 
              @click="closeMenu"
              class="mobile-nav-link"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
              </svg>
              <span>Favoris</span>
              <span class="favorites-count" v-if="favoritesCount > 0">({{ favoritesCount }})</span>
            </router-link>
          </li>
        </ul>

        <div class="mobile-nav-actions">
          <div class="theme-toggle-container">
            <span class="theme-label">Thème</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import { useFavorites } from '@/composables/useFavorites'

export default {
  name: 'MobileMenu',
  components: {
    ThemeToggle
  },
  setup() {
    const isOpen = ref(false)
    const { favoritesCount } = useFavorites()

    const toggleMenu = () => {
      isOpen.value = !isOpen.value
      
      // Empêcher le scroll du body quand le menu est ouvert
      if (isOpen.value) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    const closeMenu = () => {
      isOpen.value = false
      document.body.style.overflow = ''
    }

    // Fermer le menu avec la touche Escape
    const handleKeydown = (event) => {
      if (event.key === 'Escape' && isOpen.value) {
        closeMenu()
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
      // S'assurer que le scroll est restauré
      document.body.style.overflow = ''
    })

    return {
      isOpen,
      favoritesCount,
      toggleMenu,
      closeMenu
    }
  }
}
</script>

<style scoped>
.mobile-menu {
  display: none;
}

/* Bouton hamburger */
.hamburger-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  gap: 4px;
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background: var(--color-text);
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger-active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.hamburger-active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  backdrop-filter: blur(2px);
}

/* Menu coulissant */
.mobile-nav {
  position: fixed;
  top: 0;
  right: -100%;
  width: 280px;
  height: 100vh;
  background: var(--color-background);
  border-left: 1px solid var(--color-border);
  z-index: 999;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
}

.mobile-nav-open {
  right: 0;
}

.mobile-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.mobile-nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text);
}

.logo-icon {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: var(--color-primary);
}

.mobile-nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.mobile-nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: var(--color-text);
  background: var(--color-background-secondary);
  border-left-color: var(--color-primary);
}

.favorites-count {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.mobile-nav-actions {
  margin-top: auto;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.theme-toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-label {
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

/* Afficher seulement sur mobile */
@media (max-width: 768px) {
  .mobile-menu {
    display: block;
  }
}

/* Animation d'entrée */
@keyframes slideIn {
  from {
    right: -100%;
  }
  to {
    right: 0;
  }
}

.mobile-nav-open {
  animation: slideIn 0.3s ease;
}
</style>

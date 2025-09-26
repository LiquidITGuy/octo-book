<template>
  <div class="search-bar" :class="{ 'search-bar-expanded': isExpanded }">
    <div class="search-input-container">
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un livre, auteur..."
        class="search-input"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @keydown.escape="clearSearch"
        @keydown.enter="performSearch"
      />
      <button 
        class="search-button"
        @click="toggleSearch"
        :aria-label="isExpanded ? 'Fermer la recherche' : 'Ouvrir la recherche'"
      >
        <svg v-if="!isExpanded" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <!-- Suggestions de recherche -->
    <div v-if="showSuggestions && suggestions.length > 0" class="search-suggestions">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="search-suggestion"
        @click="selectSuggestion(suggestion)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <span>{{ suggestion }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SearchBar',
  setup() {
    const router = useRouter()
    const searchInput = ref(null)
    const searchQuery = ref('')
    const isExpanded = ref(false)
    const showSuggestions = ref(false)
    
    // Suggestions de recherche (à terme, cela pourrait venir d'une API)
    const allSuggestions = [
      'Architecture logicielle',
      'DevOps',
      'Intelligence artificielle',
      'Sécurité',
      'Cloud computing',
      'Microservices',
      'Docker',
      'Kubernetes',
      'React',
      'Vue.js',
      'Node.js',
      'Python',
      'JavaScript',
      'TypeScript'
    ]
    
    const suggestions = computed(() => {
      if (!searchQuery.value || searchQuery.value.length < 2) return []
      
      return allSuggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
        .slice(0, 5)
    })
    
    const toggleSearch = async () => {
      isExpanded.value = !isExpanded.value
      
      if (isExpanded.value) {
        await nextTick()
        searchInput.value?.focus()
      } else {
        clearSearch()
      }
    }
    
    const handleFocus = () => {
      showSuggestions.value = true
    }
    
    const handleBlur = () => {
      // Délai pour permettre le clic sur les suggestions
      setTimeout(() => {
        showSuggestions.value = false
      }, 200)
    }
    
    const handleInput = () => {
      showSuggestions.value = searchQuery.value.length >= 2
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
      showSuggestions.value = false
      searchInput.value?.blur()
    }
    
    const selectSuggestion = (suggestion) => {
      searchQuery.value = suggestion
      performSearch()
    }
    
    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          path: '/books',
          query: { search: searchQuery.value.trim() }
        })
        showSuggestions.value = false
        searchInput.value?.blur()
      }
    }
    
    return {
      searchInput,
      searchQuery,
      isExpanded,
      showSuggestions,
      suggestions,
      toggleSearch,
      handleFocus,
      handleBlur,
      handleInput,
      clearSearch,
      selectSuggestion,
      performSearch
    }
  }
}
</script>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 0;
  padding: 0.75rem 0;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  opacity: 0;
  pointer-events: none;
}

.search-bar-expanded .search-input {
  width: 250px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  opacity: 1;
  pointer-events: all;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.search-button {
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

.search-button:hover {
  color: var(--color-primary);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-suggestion {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.search-suggestion:hover {
  background: var(--color-background-secondary);
  color: var(--color-text);
}

.search-suggestion svg {
  opacity: 0.5;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .search-bar-expanded .search-input {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .search-bar-expanded .search-input {
    width: 150px;
    font-size: 0.8rem;
  }
}
</style>

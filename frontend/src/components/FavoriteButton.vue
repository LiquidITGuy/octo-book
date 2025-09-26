<template>
  <button
    @click="handleToggle"
    class="favorite-button"
    :class="{ 'is-favorite': isFavorite(bookId) }"
    :aria-label="isFavorite(bookId) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
    :title="isFavorite(bookId) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
  >
    <span class="favorite-icon">
      {{ isFavorite(bookId) ? '❤️' : '🤍' }}
    </span>
    <span v-if="showText" class="favorite-text">
      {{ isFavorite(bookId) ? 'Favori' : 'Ajouter' }}
    </span>
  </button>
</template>

<script>
import { useFavorites } from '@/composables/useFavorites'

export default {
  name: 'FavoriteButton',
  props: {
    bookId: {
      type: [String, Number],
      required: true
    },
    showText: {
      type: Boolean,
      default: false
    }
  },
  emits: ['favoriteToggled'],
  setup(props, { emit }) {
    const { toggleFavorite, isFavorite } = useFavorites()

    const handleToggle = () => {
      toggleFavorite(props.bookId)
      emit('favoriteToggled', {
        bookId: props.bookId,
        isFavorite: isFavorite(props.bookId)
      })
    }

    return {
      toggleFavorite,
      isFavorite,
      handleToggle
    }
  }
}
</script>

<style scoped>
.favorite-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 2px solid transparent;
  background: transparent;
  color: var(--color-text);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  min-width: 44px;
  min-height: 44px;
  justify-content: center;
}

.favorite-button:hover {
  background: var(--color-background-secondary);
  border-color: var(--color-border);
}

.favorite-button.is-favorite {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.favorite-button.is-favorite:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.favorite-icon {
  font-size: 1.2rem;
  line-height: 1;
  transition: transform 0.2s ease;
}

.favorite-button:hover .favorite-icon {
  transform: scale(1.1);
}

.favorite-button.is-favorite .favorite-icon {
  animation: heartbeat 0.6s ease-in-out;
}

.favorite-text {
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
}

/* Animation pour le cœur */
@keyframes heartbeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1); }
  75% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Version avec texte */
.favorite-button:has(.favorite-text) {
  border-radius: 0;
  padding: 0.5rem 1rem;
  min-width: auto;
}

@media (max-width: 768px) {
  .favorite-button {
    min-width: 40px;
    min-height: 40px;
    padding: 0.4rem;
  }
  
  .favorite-text {
    display: none;
  }
}
</style>

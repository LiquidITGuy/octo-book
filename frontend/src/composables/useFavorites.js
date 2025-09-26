import { ref, computed } from 'vue'

const favorites = ref(new Set())

// Initialiser les favoris depuis localStorage
const initFavorites = () => {
  const savedFavorites = localStorage.getItem('octo-books-favorites')
  if (savedFavorites) {
    try {
      const favArray = JSON.parse(savedFavorites)
      favorites.value = new Set(favArray)
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error)
      favorites.value = new Set()
    }
  }
}

// Sauvegarder les favoris dans localStorage
const saveFavorites = () => {
  const favArray = Array.from(favorites.value)
  localStorage.setItem('octo-books-favorites', JSON.stringify(favArray))
}

// Ajouter un livre aux favoris
const addToFavorites = (bookId) => {
  favorites.value.add(bookId.toString())
  saveFavorites()
}

// Retirer un livre des favoris
const removeFromFavorites = (bookId) => {
  favorites.value.delete(bookId.toString())
  saveFavorites()
}

// Basculer le statut favori d'un livre
const toggleFavorite = (bookId) => {
  const id = bookId.toString()
  if (favorites.value.has(id)) {
    removeFromFavorites(id)
  } else {
    addToFavorites(id)
  }
}

// Vérifier si un livre est en favori
const isFavorite = (bookId) => {
  return favorites.value.has(bookId.toString())
}

// Obtenir la liste des favoris
const getFavorites = computed(() => {
  return Array.from(favorites.value)
})

// Obtenir le nombre de favoris
const favoritesCount = computed(() => {
  return favorites.value.size
})

// Vider tous les favoris
const clearFavorites = () => {
  favorites.value.clear()
  saveFavorites()
}

export function useFavorites() {
  return {
    favorites: getFavorites,
    favoritesCount,
    initFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites
  }
}

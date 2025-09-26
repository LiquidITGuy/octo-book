import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export const booksApi = {
  // Récupérer tous les livres avec pagination
  getBooks(page = 1, limit = 10) {
    return api.get(`/api/books?page=${page}&limit=${limit}`)
  },

  // Récupérer un livre par ID
  getBookById(id) {
    return api.get(`/api/books/${id}`)
  },

  // Rechercher des livres
  searchBooks(query) {
    return api.get(`/api/books/search/${encodeURIComponent(query)}`)
  },

  // Récupérer tous les tags
  getTags() {
    return api.get('/api/tags')
  },

  // Vérifier la santé de l'API
  healthCheck() {
    return api.get('/api/health')
  }
}

export default api

import axios from 'axios'

// En production, utiliser une URL relative pour que Nginx puisse faire le proxy
// En développement, utiliser l'URL complète
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3200'

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

  // Rechercher des livres avec pagination
  searchBooks(query, page = 1, limit = 10) {
    return api.get(`/api/books/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`)
  },

  // Récupérer tous les tags
  getTags() {
    return api.get('/api/tags')
  },

  // Récupérer les livres par tag avec pagination
  getBooksByTag(tag, page = 1, limit = 10) {
    return api.get(`/api/books/tag/${encodeURIComponent(tag)}?page=${page}&limit=${limit}`)
  },

  // Vérifier la santé de l'API
  healthCheck() {
    return api.get('/api/health')
  }
}

export default api

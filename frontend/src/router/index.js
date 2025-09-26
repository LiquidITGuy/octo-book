import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BooksView from '../views/BooksView.vue'
import BookDetailView from '../views/BookDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/books',
      name: 'books',
      component: BooksView
    },
    {
      path: '/books/:id',
      name: 'book-detail',
      component: BookDetailView
    },
    {
      path: '/tag/:tag',
      name: 'books-by-tag',
      component: () => import('../views/BooksByTagView.vue')
    }
  ]
})

export default router

// Service Worker pour Octo Books PWA
const CACHE_NAME = 'octo-books-v2';
const API_CACHE_NAME = 'octo-books-api-v2';
const IMAGE_CACHE_NAME = 'octo-books-images-v2';

// Assets à mettre en cache (network-first)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/App.vue',
  '/src/assets/main.css',
  '/manifest.json'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('Service Worker: Suppression ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Stratégies de cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Images - Cache First
  if (event.request.destination === 'image' || 
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i) ||
      url.hostname === 'octo.com' && url.pathname.includes('/assets/publications-categories-images/')) {
    console.log('Service Worker: Image - Cache First');
    event.respondWith(cacheFirstImage(event.request, IMAGE_CACHE_NAME));
    return;
  }
  
  // API calls - différentes stratégies selon l'endpoint
  if (url.origin === 'http://localhost:3200' || url.pathname.startsWith('/api/')) {
    
    // Liste des livres - Network First
    // Détecte /api/books avec ou sans paramètres de query, mais pas /api/books/ID
    if (url.pathname === '/api/books' || url.pathname.match(/^\/api\/books\/search\//) || url.pathname.match(/^\/api\/books\/tag\//)) {
      console.log('Service Worker: Liste des livres - Network First');
      event.respondWith(networkFirstAPI(event.request, API_CACHE_NAME));
      return;
    }
    
    // Détail d'un livre - Cache First
    if (url.pathname.match(/^\/api\/books\/\d+$/)) {
      console.log('Service Worker: Détail livre - Cache First');
      event.respondWith(cacheFirst(event.request, API_CACHE_NAME));
      return;
    }
    
    // Autres appels API - Stale While Revalidate par défaut
    event.respondWith(staleWhileRevalidate(event.request, API_CACHE_NAME));
    return;
  }
  
  // Assets statiques - Network First
  event.respondWith(networkFirst(event.request, CACHE_NAME));
});

// Stratégie Network First (pour les assets)
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network First: Échec réseau, tentative cache', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback pour les pages HTML
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Stratégie Cache First (pour le détail des livres)
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('Cache First: Réponse depuis le cache');
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Cache First: Échec réseau et pas de cache', error);
    throw error;
  }
}

// Stratégie Cache First (pour les images)
async function cacheFirstImage(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('Cache First Image: Image servie depuis le cache');
    return cachedResponse;
  }
  
  try {
    console.log('Cache First Image: Téléchargement de l\'image depuis le réseau');
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      console.log('Cache First Image: Mise en cache de l\'image');
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Cache First Image: Échec réseau et pas de cache pour l\'image', error);
    
    // Optionnel : retourner une image placeholder en cas d'échec
    // return new Response('', { status: 404, statusText: 'Image not found' });
    throw error;
  }
}

// Stratégie Network First (pour les API de listes de livres)
async function networkFirstAPI(request, cacheName) {
  const url = new URL(request.url);
  
  try {
    console.log('Network First API: Tentative réseau pour', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      console.log('Network First API: Mise en cache de la réponse');
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network First API: Échec réseau, tentative cache pour', request.url, error);
    
    // Si c'est une recherche et qu'on est hors ligne, faire une recherche locale
    if (url.pathname.match(/^\/api\/books\/search\//)) {
      console.log('Network First API: Recherche hors ligne activée');
      return await performOfflineSearch(request, cacheName);
    }
    
    // Pour les autres requêtes, essayer le cache normal
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('Network First API: Réponse depuis le cache');
      return cachedResponse;
    }
    
    console.log('Network First API: Aucune réponse disponible');
    throw error;
  }
}

// Fonction de recherche hors ligne dans le cache
async function performOfflineSearch(request, cacheName) {
  const url = new URL(request.url);
  const searchQuery = decodeURIComponent(url.pathname.split('/').pop()).toLowerCase();
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  
  console.log('Recherche hors ligne pour:', searchQuery, 'page:', page);
  
  try {
    // Récupérer tous les livres depuis le cache
    const allBooks = await getAllBooksFromCache(cacheName);
    
    if (!allBooks || allBooks.length === 0) {
      console.log('Aucun livre en cache pour la recherche hors ligne');
      throw new Error('Aucune donnée en cache');
    }
    
    // Filtrer les livres selon la requête de recherche
    const filteredBooks = allBooks.filter(book => 
      book.title.toLowerCase().includes(searchQuery) ||
      book.authors.some(author => author.toLowerCase().includes(searchQuery)) ||
      book.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
      book.summary.toLowerCase().includes(searchQuery) ||
      (book.longSummary && book.longSummary.toLowerCase().includes(searchQuery))
    );
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
    
    // Retourner sans longSummary pour la cohérence avec l'API
    const booksWithoutLongSummary = paginatedBooks.map(book => ({
      id: book.id,
      title: book.title,
      authors: book.authors,
      summary: book.summary,
      thumbnail: book.thumbnail,
      tags: book.tags,
      disponible: book.disponible
    }));
    
    // Créer une réponse similaire à l'API
    const responseData = {
      books: booksWithoutLongSummary,
      query: searchQuery,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredBooks.length / limit),
        totalBooks: filteredBooks.length,
        hasNext: endIndex < filteredBooks.length,
        hasPrev: page > 1
      },
      offline: true // Indicateur que c'est une recherche hors ligne
    };
    
    console.log(`Recherche hors ligne: ${filteredBooks.length} résultats trouvés pour "${searchQuery}"`);
    
    // Créer une réponse HTTP
    return new Response(JSON.stringify(responseData), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'X-Offline-Search': 'true'
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la recherche hors ligne:', error);
    throw error;
  }
}

// Fonction pour récupérer tous les livres depuis le cache
async function getAllBooksFromCache(cacheName) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  const allBooks = [];
  
  // Parcourir toutes les requêtes en cache pour trouver les listes de livres
  for (const request of requests) {
    const url = new URL(request.url);
    
    // Chercher les réponses de listes de livres (pas les détails individuels)
    if (url.pathname === '/api/books' || url.pathname.match(/^\/api\/books\/tag\//)) {
      try {
        const response = await cache.match(request);
        if (response) {
          const data = await response.json();
          if (data.books && Array.isArray(data.books)) {
            // Ajouter les livres à notre collection, en évitant les doublons
            data.books.forEach(book => {
              if (!allBooks.find(existingBook => existingBook.id === book.id)) {
                allBooks.push(book);
              }
            });
          }
        }
      } catch (error) {
        console.warn('Erreur lors de la lecture du cache pour:', request.url, error);
      }
    }
  }
  
  console.log(`Récupéré ${allBooks.length} livres depuis le cache pour la recherche hors ligne`);
  return allBooks;
}

// Stratégie Stale While Revalidate (pour autres API)
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch((error) => {
    console.log('Stale While Revalidate: Échec réseau', error);
    return cachedResponse;
  });
  
  // Retourner immédiatement la réponse en cache si disponible
  if (cachedResponse) {
    console.log('Stale While Revalidate: Réponse depuis le cache');
    return cachedResponse;
  }
  
  // Sinon attendre la réponse réseau
  return fetchPromise;
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

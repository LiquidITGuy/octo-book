// Service Worker pour Octo Books PWA
const CACHE_NAME = 'octo-books-v2';
const API_CACHE_NAME = 'octo-books-api-v2';

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
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
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

// Stratégie Network First (pour les API de listes de livres)
async function networkFirstAPI(request, cacheName) {
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
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('Network First API: Réponse depuis le cache');
      return cachedResponse;
    }
    
    console.log('Network First API: Aucune réponse disponible');
    throw error;
  }
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

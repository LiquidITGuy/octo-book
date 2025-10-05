// Service Worker pour Octo Books PWA avec notifications push
const CACHE_NAME = 'octo-books-v2'; // Version mise à jour pour les images
const BOOKS_CACHE_KEY = 'cached-books-data';

// Assets essentiels à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Fonction pour extraire et stocker les données de livres depuis les réponses
async function storeBooksData(request, response) {
  if (request.url.includes('/api/books')) {
    try {
      const responseClone = response.clone();
      const data = await responseClone.json();
      
      if (data && data.books && Array.isArray(data.books)) {
        // Récupérer les données existantes
        const cache = await caches.open(CACHE_NAME);
        let existingBooksData = [];
        
        try {
          const existingResponse = await cache.match(BOOKS_CACHE_KEY);
          if (existingResponse) {
            const existingData = await existingResponse.json();
            existingBooksData = existingData.books || [];
          }
        } catch (e) {
          console.log('Aucune donnée de livres existante trouvée');
        }
        
        // Fusionner les nouveaux livres avec les existants (éviter les doublons)
        const existingIds = new Set(existingBooksData.map(book => book.id));
        const newBooks = data.books.filter(book => !existingIds.has(book.id));
        const allBooks = [...existingBooksData, ...newBooks];
        
        // Stocker les données combinées
        const booksDataResponse = new Response(JSON.stringify({ books: allBooks }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
        await cache.put(BOOKS_CACHE_KEY, booksDataResponse);
        console.log(`Service Worker: ${newBooks.length} nouveaux livres ajoutés au cache (total: ${allBooks.length})`);
      }
    } catch (error) {
      console.error('Erreur lors du stockage des données de livres:', error);
    }
  }
}

// Fonction pour effectuer une recherche locale dans les données mises en cache
async function performOfflineSearch(searchQuery, page = 1, limit = 10) {
  console.log("perform offline search")
  try {
    const cache = await caches.open(CACHE_NAME);
    const booksResponse = await cache.match(BOOKS_CACHE_KEY);
    
    if (!booksResponse) {
      throw new Error('Aucune donnée de livres en cache');
    }
    
    const booksData = await booksResponse.json();
    const allBooks = booksData.books || [];
    
    if (allBooks.length === 0) {
      throw new Error('Aucun livre trouvé dans le cache');
    }
    
    // Effectuer la recherche dans les données locales
    const query = searchQuery.toLowerCase();
    const filteredBooks = allBooks.filter(book => {
      const searchableText = [
        book.title,
        book.description || '',
        book.summary || '',
        ...(book.authors || []),
        ...(book.tags || [])
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query);
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
    
    const totalBooks = filteredBooks.length;
    const totalPages = Math.ceil(totalBooks / limit);
    
    const result = {
      books: paginatedBooks,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalBooks: totalBooks,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      offline: true // Indicateur que c'est une recherche hors ligne
    };
    
    console.log(`Service Worker: Recherche hors ligne "${searchQuery}" - ${totalBooks} résultats trouvés`);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erreur lors de la recherche hors ligne:', error);
    throw error;
  }
}

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
          if (cacheName !== CACHE_NAME) {
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

// Fonction pour déterminer si une requête est une image
function isImageRequest(request) {
  const url = new URL(request.url);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  return imageExtensions.some(ext => url.pathname.toLowerCase().includes(ext)) ||
         request.destination === 'image';
}

// Stratégie de cache avec gestion spéciale des images et de la recherche hors ligne
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ne pas intercepter les requêtes avec des schémas non supportés
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ne pas intercepter les requêtes vers des extensions ou autres origines non supportées
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'safari-extension:') {
    return;
  }

  // Gestion spéciale pour les images (stratégie Cache First avec fallback)
  if (isImageRequest(event.request)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Service Worker: Image servie depuis le cache:', event.request.url);
            return cachedResponse;
          }

          // Image pas en cache, tenter de la récupérer
          return fetch(event.request)
            .then((response) => {
              // Vérifier si la réponse est valide
              if (!response || response.status !== 200 ) {
                console.dir(response.type)
                console.dir(response)
                console.log('Service Worker: Réponse image invalide:', event.request.url);
                return response;
              }

              // Cloner la réponse pour la mettre en cache
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log('Service Worker: Mise en cache de l\'image:', event.request.url);
                  cache.put(event.request, responseToCache);
                })
                .catch((error) => {
                  console.error('Service Worker: Erreur mise en cache image:', error);
                });

              return response;
            })
            .catch((error) => {
              console.error('Service Worker: Erreur réseau pour image:', event.request.url, error);
              // Retourner une image placeholder par défaut en cas d'erreur
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="#f0f0f0"/><text x="100" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">📚</text><text x="100" y="180" text-anchor="middle" font-family="Arial" font-size="12" fill="#999">Image non disponible</text></svg>',
                {
                  headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=86400'
                  }
                }
              );
            });
        })
    );
    return;
  }

  // Gestion spéciale pour les requêtes de recherche
  if (url.pathname.includes('/api/books/search/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Mettre en cache la réponse si elle est valide
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              })
              .catch((error) => {
                console.log('Erreur mise en cache de la recherche:', error);
              });
            
            // Stocker aussi les données des livres retournés
            storeBooksData(event.request, response);
          }
          return response;
        })
        .catch(async () => {
          console.log('Service Worker: Réseau indisponible, tentative de recherche hors ligne');
          
          // Extraire les paramètres de recherche de l'URL
          const pathParts = url.pathname.split('/');
          const searchQuery = decodeURIComponent(pathParts[pathParts.length - 1]);
          const urlParams = new URLSearchParams(url.search);
          const page = parseInt(urlParams.get('page')) || 1;
          const limit = parseInt(urlParams.get('limit')) || 10;
          
          try {
            return await performOfflineSearch(searchQuery, page, limit);
          } catch (error) {
            console.error('Service Worker: Échec de la recherche hors ligne:', error);
            return new Response(JSON.stringify({
              error: 'Recherche hors ligne indisponible',
              message: 'Aucune donnée de livres n\'est disponible en cache pour effectuer une recherche hors ligne.'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        })
    );
    return;
  }

  // Gestion générale des autres requêtes
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la réponse en cache si disponible
        if (response) {
          return response;
        }
        
        // Sinon, faire la requête réseau
        return fetch(event.request)
          .then((response) => {
            // Mettre en cache les réponses valides 
            if (response.ok && event.request.method === 'GET') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  // Vérifier à nouveau le schéma avant de mettre en cache
                  const requestUrl = new URL(event.request.url);
                  if (requestUrl.protocol.startsWith('http')) {
                    cache.put(event.request, responseClone);
                  }
                })
                .catch((error) => {
                  console.log('Erreur mise en cache:', error);
                });
                
              // Stocker les données des livres si c'est une requête d'API de livres
              storeBooksData(event.request, response);
            }
            return response;
          })
          .catch(() => {
            // Fallback pour les pages HTML
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notification push reçue');
  
  let notificationData = {
    title: 'Nouveau livre disponible !',
    body: 'Un nouveau livre vient d\'être ajouté à la bibliothèque.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'new-book',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Voir le livre',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Ignorer'
      }
    ],
    data: {
      url: '/books',
      bookId: null
    }
  };

  // Si des données sont envoyées avec la notification
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        data: {
          url: pushData.bookId ? `/books/${pushData.bookId}` : '/books',
          bookId: pushData.bookId || null
        }
      };
    } catch (error) {
      console.error('Erreur lors du parsing des données push:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clic sur notification');
  
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Action par défaut ou action 'view'
  const urlToOpen = notificationData.url || '/books';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Chercher si une fenêtre de l'app est déjà ouverte
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            // Naviguer vers la page du livre et focus sur la fenêtre
            client.postMessage({
              type: 'NAVIGATE_TO',
              url: urlToOpen
            });
            return client.focus();
          }
        }
        
        // Si aucune fenêtre n'est ouverte, en ouvrir une nouvelle
        return clients.openWindow(urlToOpen);
      })
  );
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification fermée');
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

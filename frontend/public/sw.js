// Service Worker pour Octo Books PWA avec notifications push
const CACHE_NAME = 'octo-books-v1';

// Assets essentiels à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
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

// Stratégie de cache simple
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

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

// Charger les variables d'environnement
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3200;

// Configuration Web Push avec variables d'environnement
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

// Vérifier que les clés VAPID sont configurées
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.error('❌ Erreur: Les clés VAPID ne sont pas configurées dans les variables d\'environnement');
  console.error('Veuillez définir VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY dans le fichier .env');
  process.exit(1);
}

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@octobooks.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

console.log('✅ Configuration VAPID chargée depuis les variables d\'environnement');

// Stockage en mémoire des abonnements (en production, utiliser une base de données)
let subscriptions = [];

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Charger les données des livres
const loadBooks = () => {
  try {
    const booksData = fs.readFileSync(path.join(__dirname, 'books.json'), 'utf8');
    return JSON.parse(booksData);
  } catch (error) {
    console.error('Erreur lors du chargement des livres:', error);
    return [];
  }
};

// Route pour obtenir tous les livres avec pagination
app.get('/api/books', (req, res) => {
  try {
    // En-têtes de cache pour Network First
    res.set({
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400', // 5 min fresh, 24h stale
      'ETag': `books-${Date.now()}`, // ETag simple basé sur le timestamp
      'Last-Modified': new Date().toUTCString()
    });

    const books = loadBooks();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedBooks = books.slice(startIndex, endIndex);
    
    // Retourner uniquement les informations de base (sans longSummary)
    const booksWithoutLongSummary = paginatedBooks.map(book => ({
      id: book.id,
      title: book.title,
      authors: book.authors,
      summary: book.summary,
      thumbnail: book.thumbnail,
      tags: book.tags,
      disponible: book.disponible
    }));

    res.json({
      books: booksWithoutLongSummary,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(books.length / limit),
        totalBooks: books.length,
        hasNext: endIndex < books.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir un livre spécifique par ID
app.get('/api/books/:id', (req, res) => {
  try {
    const books = loadBooks();
    const bookId = req.params.id;
    const book = books.find(b => b.id === bookId);

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    res.json(book);
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour rechercher des livres par titre, auteur, tags, résumé ou description
app.get('/api/books/search/:query', (req, res) => {
  try {
    // En-têtes de cache pour Network First
    res.set({
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400', // 5 min fresh, 24h stale
      'ETag': `search-${req.params.query}-${Date.now()}`,
      'Last-Modified': new Date().toUTCString()
    });

    const books = loadBooks();
    const query = req.params.query.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const filteredBooks = books.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.authors.some(author => author.toLowerCase().includes(query)) ||
      book.tags.some(tag => tag.toLowerCase().includes(query)) ||
      book.summary.toLowerCase().includes(query) ||
      book.longSummary.toLowerCase().includes(query)
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

    // Retourner sans longSummary pour la recherche
    const booksWithoutLongSummary = paginatedBooks.map(book => ({
      id: book.id,
      title: book.title,
      authors: book.authors,
      summary: book.summary,
      thumbnail: book.thumbnail,
      tags: book.tags,
      disponible: book.disponible
    }));

    res.json({
      books: booksWithoutLongSummary,
      query: query,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredBooks.length / limit),
        totalBooks: filteredBooks.length,
        hasNext: endIndex < filteredBooks.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir tous les tags disponibles
app.get('/api/tags', (req, res) => {
  try {
    const books = loadBooks();
    const allTags = books.reduce((tags, book) => {
      book.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
      return tags;
    }, []);

    res.json({ tags: allTags.sort() });
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir les livres par tag avec pagination
app.get('/api/books/tag/:tag', (req, res) => {
  try {
    // En-têtes de cache pour Network First
    res.set({
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400', // 5 min fresh, 24h stale
      'ETag': `tag-${req.params.tag}-${Date.now()}`,
      'Last-Modified': new Date().toUTCString()
    });

    const books = loadBooks();
    const tag = decodeURIComponent(req.params.tag);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Filtrer les livres par tag
    const filteredBooks = books.filter(book => 
      book.tags.some(bookTag => bookTag.toLowerCase() === tag.toLowerCase())
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
    
    // Retourner uniquement les informations de base (sans longSummary)
    const booksWithoutLongSummary = paginatedBooks.map(book => ({
      id: book.id,
      title: book.title,
      authors: book.authors,
      summary: book.summary,
      thumbnail: book.thumbnail,
      tags: book.tags,
      disponible: book.disponible
    }));

    res.json({
      books: booksWithoutLongSummary,
      tag: tag,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredBooks.length / limit),
        totalBooks: filteredBooks.length,
        hasNext: endIndex < filteredBooks.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des livres par tag:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les notifications push
app.post('/api/push/subscribe', (req, res) => {
  try {
    console.log('📱 Nouvelle demande d\'abonnement reçue');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { subscription, userAgent, timestamp } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      console.log('❌ Abonnement invalide - endpoint manquant');
      return res.status(400).json({ error: 'Abonnement invalide' });
    }

    // Vérifier si l'abonnement existe déjà
    const existingIndex = subscriptions.findIndex(sub => 
      sub.subscription.endpoint === subscription.endpoint
    );

    if (existingIndex !== -1) {
      // Mettre à jour l'abonnement existant
      subscriptions[existingIndex] = {
        subscription,
        userAgent,
        timestamp,
        subscribedAt: subscriptions[existingIndex].subscribedAt
      };
      console.log('✅ Abonnement push mis à jour:', subscription.endpoint.substring(0, 50) + '...');
    } else {
      // Ajouter un nouvel abonnement
      subscriptions.push({
        subscription,
        userAgent,
        timestamp,
        subscribedAt: new Date().toISOString()
      });
      console.log('✅ Nouvel abonnement push ajouté:', subscription.endpoint.substring(0, 50) + '...');
    }

    console.log(`📊 Total des abonnements: ${subscriptions.length}`);

    res.json({ 
      success: true, 
      message: 'Abonnement enregistré avec succès',
      totalSubscriptions: subscriptions.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de l\'abonnement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/push/unsubscribe', (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Abonnement invalide' });
    }

    // Supprimer l'abonnement
    const initialLength = subscriptions.length;
    subscriptions = subscriptions.filter(sub => 
      sub.subscription.endpoint !== subscription.endpoint
    );

    const removed = initialLength - subscriptions.length;
    console.log(`${removed} abonnement(s) push supprimé(s)`);

    res.json({ 
      success: true, 
      message: 'Désabonnement effectué avec succès',
      totalSubscriptions: subscriptions.length
    });
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour envoyer une notification à tous les abonnés
app.post('/api/push/notify', (req, res) => {
  try {
    const { title, body, bookId, url } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Titre et corps de la notification requis' });
    }

    const payload = JSON.stringify({
      title,
      body,
      bookId,
      url: url || (bookId ? `/books/${bookId}` : '/books'),
      timestamp: new Date().toISOString()
    });

    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, payload);
        return { success: true, endpoint: sub.subscription.endpoint };
      } catch (error) {
        console.error('Erreur envoi notification:', error);
        
        // Si l'abonnement n'est plus valide, le supprimer
        if (error.statusCode === 410 || error.statusCode === 404) {
          subscriptions = subscriptions.filter(s => 
            s.subscription.endpoint !== sub.subscription.endpoint
          );
          console.log('Abonnement invalide supprimé:', sub.subscription.endpoint);
        }
        
        return { success: false, endpoint: sub.subscription.endpoint, error: error.message };
      }
    });

    Promise.all(promises).then(results => {
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`Notifications envoyées: ${successful} succès, ${failed} échecs`);
      
      res.json({
        success: true,
        message: 'Notifications envoyées',
        results: {
          total: results.length,
          successful,
          failed
        }
      });
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir les statistiques des abonnements
app.get('/api/push/stats', (req, res) => {
  res.json({
    totalSubscriptions: subscriptions.length,
    subscriptions: subscriptions.map(sub => ({
      endpoint: sub.subscription.endpoint.substring(0, 50) + '...',
      userAgent: sub.userAgent,
      subscribedAt: sub.subscribedAt
    }))
  });
});

// Route pour obtenir la clé publique VAPID
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ 
    publicKey: vapidKeys.publicKey 
  });
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API des livres fonctionnelle' });
});

// Middleware catch-all pour servir l'application Vue.js (doit être en dernier)
app.use((req, res, next) => {
  // Si la requête ne commence pas par /api et n'est pas un fichier statique
  if (!req.path.startsWith('/api') && !req.path.includes('.')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  } else {
    next();
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
  console.log(`📚 API disponible sur http://localhost:${PORT}/api`);
});

server.on('error', (error) => {
  console.error('❌ Erreur du serveur:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Le port ${PORT} est déjà utilisé`);
  }
});

module.exports = app;

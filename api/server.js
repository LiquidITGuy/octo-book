const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');
const { bookService, subscriptionService, testConnection } = require('./database');

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

// Test de connexion à la base de données au démarrage
(async () => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Impossible de se connecter à PostgreSQL');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion PostgreSQL:', error);
    process.exit(1);
  }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Route pour obtenir tous les livres avec pagination
app.get('/api/books', async (req, res) => {
  try {
    // En-têtes de cache pour Network First
    res.set({
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400', // 5 min fresh, 24h stale
      'ETag': `books-${Date.now()}`, // ETag simple basé sur le timestamp
      'Last-Modified': new Date().toUTCString()
    });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await bookService.getAllBooks(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir un livre spécifique par ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await bookService.getBookById(bookId);

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
app.get('/api/books/search/:query', async (req, res) => {
  try {
    // En-têtes de cache pour Network First
    res.set({
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400', // 5 min fresh, 24h stale
      'ETag': `search-${req.params.query}-${Date.now()}`,
      'Last-Modified': new Date().toUTCString()
    });

    const query = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await bookService.searchBooks(query, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir tous les tags disponibles
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await bookService.getAllTags();
    res.json({ tags: tags.sort() });
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour obtenir les livres par tag avec pagination
app.get('/api/books/tag/:tag', async (req, res) => {
  try {
    // En-têtes de cache pour Network First
    res.set({
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400', // 5 min fresh, 24h stale
      'ETag': `tag-${req.params.tag}-${Date.now()}`,
      'Last-Modified': new Date().toUTCString()
    });

    const tag = decodeURIComponent(req.params.tag);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await bookService.getBooksByTag(tag, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres par tag:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour les notifications push
app.post('/api/push/subscribe', async (req, res) => {
  try {
    console.log('📱 Nouvelle demande d\'abonnement reçue');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { subscription, userAgent, timestamp } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      console.log('❌ Abonnement invalide - endpoint manquant');
      return res.status(400).json({ error: 'Abonnement invalide' });
    }

    // Enregistrer dans PostgreSQL
    await subscriptionService.upsertSubscription(subscription, userAgent);
    console.log('✅ Abonnement push enregistré:', subscription.endpoint.substring(0, 50) + '...');

    // Obtenir les statistiques mises à jour
    const stats = await subscriptionService.getStats();

    res.json({ 
      success: true, 
      message: 'Abonnement enregistré avec succès',
      totalSubscriptions: stats.totalSubscriptions
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de l\'abonnement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/push/unsubscribe', async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Abonnement invalide' });
    }

    // Supprimer de PostgreSQL
    const removed = await subscriptionService.removeSubscription(subscription.endpoint);
    console.log(`Abonnement push ${removed ? 'supprimé' : 'non trouvé'}`);

    // Obtenir les statistiques mises à jour
    const stats = await subscriptionService.getStats();

    res.json({ 
      success: true, 
      message: 'Désabonnement effectué avec succès',
      totalSubscriptions: stats.totalSubscriptions
    });
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour envoyer une notification à tous les abonnés (sécurisée)
app.post('/api/push/notify', async (req, res) => {
  try {
    // Vérification du mot de passe dans le header
    const providedPassword = req.headers['x-notification-password'] || req.headers['authorization'];
    const requiredPassword = process.env.NOTIFICATION_PASSWORD;
    
    if (!requiredPassword) {
      console.error('❌ NOTIFICATION_PASSWORD non configuré dans les variables d\'environnement');
      return res.status(500).json({ error: 'Configuration serveur incorrecte' });
    }
    
    if (!providedPassword) {
      console.log('❌ Tentative d\'accès non autorisée - mot de passe manquant');
      return res.status(401).json({ 
        error: 'Accès non autorisé', 
        message: 'Header X-Notification-Password requis' 
      });
    }
    
    // Nettoyage du mot de passe si format Bearer
    const cleanPassword = providedPassword.startsWith('Bearer ') 
      ? providedPassword.slice(7) 
      : providedPassword;
    
    if (cleanPassword !== requiredPassword) {
      console.log('❌ Tentative d\'accès non autorisée - mot de passe incorrect');
      return res.status(401).json({ 
        error: 'Accès non autorisé', 
        message: 'Mot de passe incorrect' 
      });
    }
    
    console.log('✅ Authentification réussie pour l\'envoi de notifications');
    
    const { title, body, bookId, url } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Titre et corps de la notification requis' });
    }

    // Récupérer les abonnements depuis PostgreSQL
    const subscriptionsFromDb = await subscriptionService.getAllSubscriptions();

    const payload = JSON.stringify({
      title,
      body,
      bookId,
      url: url || (bookId ? `/books/${bookId}` : '/books'),
      timestamp: new Date().toISOString()
    });

    const promises = subscriptionsFromDb.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, payload);
        return { success: true, endpoint: sub.subscription.endpoint };
      } catch (error) {
        console.error('Erreur envoi notification:', error);
        
        // Si l'abonnement n'est plus valide, le supprimer de la base
        if (error.statusCode === 410 || error.statusCode === 404) {
          await subscriptionService.removeSubscription(sub.subscription.endpoint);
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
app.get('/api/push/stats', async (req, res) => {
  try {
    const stats = await subscriptionService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
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

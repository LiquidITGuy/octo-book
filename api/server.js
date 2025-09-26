const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3200;

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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
  console.log(`📚 API disponible sur http://localhost:${PORT}/api`);
});

module.exports = app;

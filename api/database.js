const { Pool } = require('pg');

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'octobooks',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test de connexion au démarrage
pool.on('connect', () => {
  console.log('✅ Connexion PostgreSQL établie');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

// Fonctions pour les livres
const bookService = {
  // Récupérer tous les livres avec pagination
  async getAllBooks(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const client = await pool.connect();
    
    try {
      // Compter le total des livres
      const countResult = await client.query('SELECT COUNT(*) FROM books');
      const totalBooks = parseInt(countResult.rows[0].count);
      
      // Récupérer les livres paginés
      const result = await client.query(
        'SELECT id, title, authors, summary, thumbnail, tags, disponible FROM books ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      
      return {
        books: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalBooks / limit),
          totalBooks,
          hasNext: offset + limit < totalBooks,
          hasPrev: page > 1
        }
      };
    } finally {
      client.release();
    }
  },

  // Récupérer un livre par ID
  async getBookById(id) {
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM books WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // Rechercher des livres
  async searchBooks(query, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${query.toLowerCase()}%`;
    const client = await pool.connect();
    
    try {
      // Compter le total des résultats
      const countResult = await client.query(`
        SELECT COUNT(*) FROM books 
        WHERE LOWER(title) LIKE $1 
        OR EXISTS(SELECT 1 FROM unnest(authors) AS author WHERE LOWER(author) LIKE $1)
        OR EXISTS(SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE $1)
        OR LOWER(summary) LIKE $1 
        OR LOWER(long_summary) LIKE $1
      `, [searchPattern]);
      
      const totalBooks = parseInt(countResult.rows[0].count);
      
      // Récupérer les résultats paginés
      const result = await client.query(`
        SELECT id, title, authors, summary, thumbnail, tags, disponible 
        FROM books 
        WHERE LOWER(title) LIKE $1 
        OR EXISTS(SELECT 1 FROM unnest(authors) AS author WHERE LOWER(author) LIKE $1)
        OR EXISTS(SELECT 1 FROM unnest(tags) AS tag WHERE LOWER(tag) LIKE $1)
        OR LOWER(summary) LIKE $1 
        OR LOWER(long_summary) LIKE $1
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `, [searchPattern, limit, offset]);
      
      return {
        books: result.rows,
        query,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalBooks / limit),
          totalBooks,
          hasNext: offset + limit < totalBooks,
          hasPrev: page > 1
        }
      };
    } finally {
      client.release();
    }
  },

  // Récupérer tous les tags
  async getAllTags() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT DISTINCT unnest(tags) AS tag 
        FROM books 
        ORDER BY tag
      `);
      
      return result.rows.map(row => row.tag);
    } finally {
      client.release();
    }
  },

  // Récupérer les livres par tag
  async getBooksByTag(tag, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const client = await pool.connect();
    
    try {
      // Compter le total des livres avec ce tag
      const countResult = await client.query(`
        SELECT COUNT(*) FROM books 
        WHERE EXISTS(SELECT 1 FROM unnest(tags) AS book_tag WHERE LOWER(book_tag) = LOWER($1))
      `, [tag]);
      
      const totalBooks = parseInt(countResult.rows[0].count);
      
      // Récupérer les livres paginés
      const result = await client.query(`
        SELECT id, title, authors, summary, thumbnail, tags, disponible 
        FROM books 
        WHERE EXISTS(SELECT 1 FROM unnest(tags) AS book_tag WHERE LOWER(book_tag) = LOWER($1))
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `, [tag, limit, offset]);
      
      return {
        books: result.rows,
        tag,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalBooks / limit),
          totalBooks,
          hasNext: offset + limit < totalBooks,
          hasPrev: page > 1
        }
      };
    } finally {
      client.release();
    }
  }
};

// Fonctions pour les abonnements push
const subscriptionService = {
  // Ajouter ou mettre à jour un abonnement
  async upsertSubscription(subscription, userAgent) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO push_subscriptions (endpoint, p256dh_key, auth_key, user_agent)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (endpoint) 
        DO UPDATE SET 
          p256dh_key = EXCLUDED.p256dh_key,
          auth_key = EXCLUDED.auth_key,
          user_agent = EXCLUDED.user_agent,
          last_used = CURRENT_TIMESTAMP
        RETURNING id
      `, [
        subscription.endpoint,
        subscription.keys.p256dh,
        subscription.keys.auth,
        userAgent
      ]);
      
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Supprimer un abonnement
  async removeSubscription(endpoint) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM push_subscriptions WHERE endpoint = $1',
        [endpoint]
      );
      
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  },

  // Récupérer tous les abonnements
  async getAllSubscriptions() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT endpoint, p256dh_key, auth_key, user_agent, subscribed_at
        FROM push_subscriptions 
        ORDER BY subscribed_at DESC
      `);
      
      return result.rows.map(row => ({
        subscription: {
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh_key,
            auth: row.auth_key
          }
        },
        userAgent: row.user_agent,
        subscribedAt: row.subscribed_at
      }));
    } finally {
      client.release();
    }
  },

  // Obtenir les statistiques des abonnements
  async getStats() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT COUNT(*) as total,
               endpoint,
               user_agent,
               subscribed_at
        FROM push_subscriptions 
        GROUP BY endpoint, user_agent, subscribed_at
        ORDER BY subscribed_at DESC
      `);
      
      return {
        totalSubscriptions: result.rowCount,
        subscriptions: result.rows.map(row => ({
          endpoint: row.endpoint.substring(0, 50) + '...',
          userAgent: row.user_agent,
          subscribedAt: row.subscribed_at
        }))
      };
    } finally {
      client.release();
    }
  }
};

// Test de connexion
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Test de connexion PostgreSQL réussi');
    return true;
  } catch (error) {
    console.error('❌ Échec du test de connexion PostgreSQL:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  bookService,
  subscriptionService,
  testConnection
};

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  console.log('🚀 Initialisation de la base de données...');
  
  // Configuration de la connexion PostgreSQL
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'octobooks',
    user: process.env.DB_USER || undefined,
    password: process.env.DB_PASSWORD || undefined,
  });

  try {
    // Connexion à la base de données
    await client.connect();
    console.log('✅ Connexion à PostgreSQL établie');

    // Créer la structure de la base de données
    console.log('🏗️ Vérification/création de la structure...');
    
    // Lire et exécuter le script init.sql
    const initSqlPath = path.join(__dirname, 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    await client.query(initSql);
    console.log('✅ Structure de la base de données vérifiée');

    // Lire le fichier books.json
    const booksPath = path.join(__dirname, 'books.json');
    const booksData = JSON.parse(fs.readFileSync(booksPath, 'utf8'));
    console.log(`📚 ${booksData.length} livres trouvés dans books.json`);

    // Vérifier le nombre de livres existants
    const countResult = await client.query('SELECT COUNT(*) FROM books');
    const existingCount = parseInt(countResult.rows[0].count);
    console.log(`📖 ${existingCount} livre(s) déjà en base`);

    // Préparer la requête d'insertion
    const insertQuery = `
      INSERT INTO books (id, title, authors, summary, long_summary, download_link, thumbnail, tags, disponible, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        authors = EXCLUDED.authors,
        summary = EXCLUDED.summary,
        long_summary = EXCLUDED.long_summary,
        download_link = EXCLUDED.download_link,
        thumbnail = EXCLUDED.thumbnail,
        tags = EXCLUDED.tags,
        disponible = EXCLUDED.disponible,
        updated_at = CURRENT_TIMESTAMP
    `;

    let insertedCount = 0;
    let updatedCount = 0;

    // Insérer chaque livre
    for (const book of booksData) {
      try {
        // Vérifier si le livre existe déjà
        const existsResult = await client.query('SELECT id FROM books WHERE id = $1', [book.id]);
        const exists = existsResult.rows.length > 0;

        await client.query(insertQuery, [
          book.id,
          book.title,
          book.authors, // PostgreSQL gère automatiquement les arrays
          book.summary,
          book.longSummary,
          book.downloadLink,
          book.thumbnail,
          book.tags, // PostgreSQL gère automatiquement les arrays
          book.disponible
        ]);

        if (exists) {
          updatedCount++;
          console.log(`🔄 Livre mis à jour: ${book.title}`);
        } else {
          insertedCount++;
          console.log(`➕ Livre ajouté: ${book.title}`);
        }
      } catch (bookError) {
        console.error(`❌ Erreur lors de l'insertion du livre ${book.id} (${book.title}):`, bookError.message);
      }
    }

    // Vérification finale
    const finalCountResult = await client.query('SELECT COUNT(*) FROM books');
    const finalCount = parseInt(finalCountResult.rows[0].count);

    console.log('\n📊 Résumé de l\'importation:');
    console.log(`   • Livres ajoutés: ${insertedCount}`);
    console.log(`   • Livres mis à jour: ${updatedCount}`);
    console.log(`   • Total en base: ${finalCount}`);
    console.log('✅ Initialisation terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };

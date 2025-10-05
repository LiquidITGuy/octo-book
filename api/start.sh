#!/bin/sh

echo "🚀 Démarrage de l'application Octo Books..."

# Se placer dans le répertoire de l'API
cd /app/api

# Attendre que PostgreSQL soit disponible
echo "⏳ Vérification de la disponibilité de PostgreSQL..."
until node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'octobooks',
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASSWORD || undefined,
});
client.connect()
  .then(() => {
    console.log('PostgreSQL est disponible');
    client.end();
    process.exit(0);
  })
  .catch(err => {
    console.log('En attente de PostgreSQL...', err.message);
    process.exit(1);
  });
"; do
  echo "PostgreSQL n'est pas encore prêt - nouvelle tentative dans 2 secondes..."
  sleep 2
done

echo "✅ PostgreSQL est disponible"

# Initialiser complètement la base de données (structure + données)
echo "🏗️ Initialisation complète de la base de données..."
node init-database.js

# Vérifier si l'initialisation a réussi
if [ $? -eq 0 ]; then
    echo "✅ Base de données initialisée avec succès"
else
    echo "❌ Erreur lors de l'initialisation de la base de données"
    exit 1
fi

# Démarrer le serveur
echo "� Démarrage du serveur..."
exec node server.js

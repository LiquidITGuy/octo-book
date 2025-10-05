-- Script d'initialisation de la base de données PostgreSQL pour Octo Books
-- Ce script est exécuté automatiquement lors du démarrage du conteneur PostgreSQL

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des livres
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    authors TEXT[] NOT NULL,
    summary TEXT NOT NULL,
    long_summary TEXT,
    download_link VARCHAR(500),
    thumbnail VARCHAR(500),
    tags TEXT[] NOT NULL DEFAULT '{}',
    disponible BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des abonnements push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    endpoint VARCHAR(500) NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_books_disponible ON books(disponible);
CREATE INDEX IF NOT EXISTS idx_books_tags ON books USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Fonction pour mettre à jour la date de modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at (avec vérification d'existence)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_books_updated_at') THEN
        CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Structure de la base de données Octo Books créée avec succès!';
    RAISE NOTICE 'Utilisez "node init-database.js" pour importer les données depuis books.json';
END $$;

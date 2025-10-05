# Déploiement CapRover avec PostgreSQL

## Vue d'ensemble

Cette configuration permet de déployer l'application Octo Books avec une base de données PostgreSQL via CapRover.

## Prérequis

- CapRover installé et configuré
- Accès à votre instance CapRover

## Configuration des variables d'environnement

Dans CapRover, configurez les variables d'environnement suivantes pour votre application :

### Variables VAPID (notifications push)
```
VAPID_PUBLIC_KEY=votre_clé_publique_vapid
VAPID_PRIVATE_KEY=votre_clé_privée_vapid
VAPID_EMAIL=mailto:votre-email@example.com
```

### Sécurité
```
NOTIFICATION_PASSWORD=votre_mot_de_passe_sécurisé
```

### Base de données PostgreSQL
```
DB_HOST=srv-captain--votre-app-postgres
DB_PORT=5432
DB_NAME=octobooks
DB_USER=votre_utilisateur_db
DB_PASSWORD=votre_mot_de_passe_db
DATABASE_URL=postgresql://votre_utilisateur_db:votre_mot_de_passe_db@srv-captain--votre-app-postgres:5432/octobooks
```

### Environnement
```
NODE_ENV=production
PORT=3200
```

## Déploiement étape par étape

### 1. Créer l'application PostgreSQL

1. Dans CapRover, allez dans "Apps" > "One-Click Apps/Databases"
2. Recherchez et sélectionnez "PostgreSQL"
3. Configurez :
   - **App Name**: `votre-app-postgres` (par exemple: `octobooks-postgres`)
   - **PostgreSQL Username**: `votre_utilisateur_db`
   - **PostgreSQL Password**: `votre_mot_de_passe_db`
   - **PostgreSQL Database**: `octobooks`
4. Déployez l'application PostgreSQL

### 2. Créer l'application principale

1. Dans CapRover, créez une nouvelle application : `votre-app` (par exemple: `octobooks`)
2. Configurez les variables d'environnement (voir section ci-dessus)
3. Assurez-vous que `DB_HOST` correspond au nom de service PostgreSQL : `srv-captain--votre-app-postgres`

### 3. Déployer via Docker

#### Option A: Docker Compose (recommandé pour le développement local)

```bash
# Cloner le projet
git clone https://github.com/votre-repo/octo-book.git
cd octo-book

# Configurer les variables d'environnement
cp api/.env.example .env
# Éditer .env avec vos valeurs

# Démarrer les services
docker-compose up -d
```

#### Option B: Déploiement CapRover

1. Connectez votre dépôt Git à CapRover
2. Ou utilisez l'upload tar/zip du code source
3. CapRover construira automatiquement l'image avec le Dockerfile

### 4. Vérification

Une fois déployé, vérifiez :

1. **Santé de l'API** : `https://votre-app.votre-domaine.com/api/health`
2. **Connexion base de données** : Vérifiez les logs de l'application
3. **Interface web** : `https://votre-app.votre-domaine.com`

## Structure des services

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Node.js   │
│   (Vue.js)      │◄───┤   (Express)     │
│   Port: 80/443  │    │   Port: 3200    │
└─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Port: 5432    │
                       └─────────────────┘
```

## Initialisation de la base de données

La base de données est automatiquement initialisée avec :
- Tables nécessaires (`books`, `push_subscriptions`)
- Index pour les performances
- Données de test (RefCard PWA, etc.)

Le script `api/init.sql` est exécuté au premier démarrage du conteneur PostgreSQL.

## Monitoring et maintenance

### Logs
Consultez les logs dans CapRover :
- Application principale : logs de l'API et du serveur web
- PostgreSQL : logs de la base de données

### Backup de la base de données
```bash
# Connexion au conteneur PostgreSQL
docker exec -it srv-captain--votre-app-postgres pg_dump -U votre_utilisateur_db octobooks > backup.sql

# Restauration
docker exec -i srv-captain--votre-app-postgres psql -U votre_utilisateur_db octobooks < backup.sql
```

### Mise à jour
1. Poussez vos modifications vers le dépôt Git
2. CapRover redéploiera automatiquement (si configuré)
3. Ou déclenchez manuellement le redéploiement

## Résolution de problèmes

### L'application ne se connecte pas à PostgreSQL
- Vérifiez que `DB_HOST` correspond au nom du service PostgreSQL
- Vérifiez les credentials dans les variables d'environnement
- Consultez les logs de l'application et de PostgreSQL

### Erreurs de migration/initialisation
- Vérifiez que le script `api/init.sql` est correctement monté
- Vérifiez les permissions PostgreSQL
- Redémarrez le conteneur PostgreSQL si nécessaire

### Performance
- Surveillez l'utilisation des ressources
- Ajustez les paramètres de pool de connexions si nécessaire
- Considérez l'ajout d'index supplémentaires selon l'usage

## Sécurité

- Les mots de passe sont gérés via les variables d'environnement
- Les connexions PostgreSQL peuvent être chiffrées (SSL)
- Les notifications push sont sécurisées par mot de passe
- L'application utilise des requêtes préparées (protection SQL injection)

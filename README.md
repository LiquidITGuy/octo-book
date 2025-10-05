# 📚 Octo Books - Bibliothèque Numérique

Une application web moderne pour explorer et découvrir des livres, publications et ressources d'OCTO Technology avec support PostgreSQL et notifications push sécurisées.

## 🌟 Fonctionnalités

- **Interface moderne** : Application Vue.js 3 avec design responsive
- **PWA** : Installation possible sur mobile et desktop
- **Recherche avancée** : Recherche par titre, auteur, tags, contenu
- **Notifications push** : Système de notifications sécurisé par mot de passe
- **Base de données** : PostgreSQL pour la persistance des données
- **Cache intelligent** : Stratégie Network First pour une expérience optimale
- **Pagination** : Navigation efficace dans le catalogue
- **Filtrage par tags** : Organisation thématique des ressources

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Node.js   │    │   PostgreSQL    │
│   (Vue.js 3)    │◄───┤   (Express)     │◄───┤   Database      │
│   PWA Support   │    │   Notifications │    │   Books & Subs  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Stack Technique

- **Frontend** : Vue.js 3, Vite, PWA
- **Backend** : Node.js, Express.js
- **Base de données** : PostgreSQL 15
- **Notifications** : Web Push API avec VAPID
- **Conteneurisation** : Docker & Docker Compose
- **Déploiement** : CapRover compatible

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (si installation locale)

### Installation avec Docker (Recommandé)

1. **Cloner le projet**
```bash
git clone https://github.com/your-repo/octo-book.git
cd octo-book
```

2. **Configurer les variables d'environnement**
```bash
cp api/.env.example api/.env.local
# Éditer api/.env.local avec vos valeurs
```

3. **Démarrer les services**
```bash
docker-compose up -d
```

4. **Accéder à l'application**
- Interface web : http://localhost:3200
- API : http://localhost:3200/api

### Installation locale

1. **Installer les dépendances**
```bash
# Backend
cd api
npm install

# Frontend
cd ../frontend
npm install
```

2. **Configurer PostgreSQL**
```bash
# Créer la base de données
createdb octobooks
psql octobooks < api/init.sql
```

3. **Configurer les variables d'environnement**
```bash
cp api/.env.example api/.env
# Éditer api/.env avec vos valeurs PostgreSQL
```

4. **Démarrer les services**
```bash
# Terminal 1 - API
cd api
npm start

# Terminal 2 - Frontend (développement)
cd frontend
npm run dev
```

## 🐳 Déploiement avec CapRover

Consultez le guide détaillé : [CAPROVER_DEPLOYMENT.md](./CAPROVER_DEPLOYMENT.md)

### Résumé des étapes

1. **Créer l'application PostgreSQL dans CapRover**
2. **Configurer les variables d'environnement**
3. **Déployer l'application principale**
4. **Vérifier la connectivité**

### Variables d'environnement requises

```bash
# VAPID (Notifications Push)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:your-email@example.com

# Sécurité
NOTIFICATION_PASSWORD=your_secure_password

# Base de données PostgreSQL
DB_HOST=srv-captain--your-postgres-app
DB_PORT=5432
DB_NAME=octobooks
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DATABASE_URL=postgresql://user:pass@host:5432/octobooks
```

## 🔧 Configuration

### Génération des clés VAPID

```bash
cd api
node generate-vapid-keys.js
```

### Base de données

La base de données est automatiquement initialisée avec :
- Tables : `books`, `push_subscriptions`
- Index optimisés pour les performances
- Données d'exemple (RefCard PWA, etc.)

### Notifications Push

Les notifications sont sécurisées par un mot de passe dans le header :

```bash
curl -X POST https://your-app.com/api/push/notify \
  -H "Content-Type: application/json" \
  -H "X-Notification-Password: your_password" \
  -d '{"title": "Nouveau livre", "body": "Description"}'
```

## 🧪 Tests

### Tests des notifications

```bash
cd api
node test-notification.js
```

### Tests du frontend

```bash
cd frontend
npm test
```

### Tests d'intégration

```bash
# Vérifier l'API
curl http://localhost:3200/api/health

# Vérifier PostgreSQL
curl http://localhost:3200/api/books?limit=5
```

## 📊 Monitoring

### Logs

```bash
# Docker Compose
docker-compose logs -f app
docker-compose logs -f postgres

# CapRover
# Consultez les logs dans l'interface CapRover
```

### Métriques

- **Santé de l'API** : `/api/health`
- **Statistiques push** : `/api/push/stats`
- **Nombre de livres** : `/api/books?limit=1`

## 🔒 Sécurité

- **Notifications push** : Authentification par mot de passe
- **Base de données** : Requêtes préparées (protection SQL injection)
- **Variables d'environnement** : Secrets externalisés
- **HTTPS** : Support SSL en production
- **CORS** : Configuration adaptée

## 🛠️ Développement

### Structure du projet

```
octo-book/
├── api/                    # Backend Node.js
│   ├── server.js          # Serveur Express
│   ├── database.js        # Services PostgreSQL
│   ├── init.sql          # Initialisation DB
│   └── package.json
├── frontend/              # Frontend Vue.js
│   ├── src/
│   │   ├── components/    # Composants Vue
│   │   ├── views/         # Pages
│   │   └── services/      # Services API
│   └── package.json
├── docker-compose.yml     # Configuration Docker
└── CAPROVER_DEPLOYMENT.md # Guide déploiement
```

### Scripts utiles

```bash
# Développement frontend
npm run dev

# Build production
npm run build

# Tests
npm test

# Linting
npm run lint

# Génération des clés VAPID
node api/generate-vapid-keys.js
```

## 📝 API Documentation

### Endpoints principaux

- `GET /api/books` - Liste des livres (paginée)
- `GET /api/books/:id` - Détail d'un livre
- `GET /api/books/search/:query` - Recherche
- `GET /api/tags` - Liste des tags
- `GET /api/books/tag/:tag` - Livres par tag
- `POST /api/push/subscribe` - Abonnement notifications
- `POST /api/push/notify` - Envoi notifications (sécurisé)
- `GET /api/push/stats` - Statistiques abonnements

### Formats de réponse

```json
{
  "books": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalBooks": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔗 Liens utiles

- [Documentation Vue.js 3](https://vuejs.org/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Web Push Protocol](https://web.dev/push-notifications/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [CapRover Documentation](https://caprover.com/docs/)

---

**Développé avec ❤️ pour OCTO Technology**

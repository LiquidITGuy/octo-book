# Octo Books - Bibliothèque Numérique

Une application complète avec une API Node.js et un front-end Astro pour gérer une bibliothèque de livres numériques, inspirée de la charte graphique d'Octo Technology.

## 🚀 Fonctionnalités

- **API REST** complète avec Node.js et Express
- **Front-end moderne** avec Astro et rendu côté serveur
- **Pagination** intelligente (10 livres par page)
- **Pages détaillées** pour chaque livre
- **Design responsive** inspiré d'Octo
- **Interface élégante** avec effets visuels modernes

## 📁 Structure du projet

```
octo-book/
├── api/                    # API Node.js
│   ├── server.js          # Serveur Express
│   ├── books.json         # Base de données JSON
│   └── package.json       # Dépendances API
├── frontend/              # Front-end Astro
│   ├── src/
│   │   ├── layouts/       # Layouts Astro
│   │   └── pages/         # Pages de l'application
│   ├── astro.config.mjs   # Configuration Astro
│   └── package.json       # Dépendances front-end
└── README.md              # Ce fichier
```

## 🛠️ Installation et démarrage

### Prérequis
- Node.js (version 18 ou supérieure)
- npm

### 1. Démarrer l'API

```bash
cd api
npm install
npm start
```

L'API sera disponible sur `http://localhost:3200`

### 2. Démarrer le front-end

Dans un nouveau terminal :

```bash
cd frontend
npm install
npm run dev
```

Le site sera disponible sur `http://localhost:3000`

## 📚 API Endpoints

### Livres
- `GET /api/books` - Liste des livres avec pagination
  - Paramètres : `page` (défaut: 1), `limit` (défaut: 10)
- `GET /api/books/:id` - Détail d'un livre
- `GET /api/books/search/:query` - Recherche de livres
- `GET /api/tags` - Liste de tous les tags
- `GET /api/health` - Statut de l'API

### Exemples d'utilisation

```bash
# Récupérer les 10 premiers livres
curl http://localhost:3200/api/books

# Récupérer la page 2
curl http://localhost:3200/api/books?page=2

# Détail du livre avec l'ID 1
curl http://localhost:3200/api/books/1

# Rechercher des livres
curl http://localhost:3200/api/books/search/devops
```

## 🎨 Design et charte graphique

L'application respecte la charte graphique d'Octo Technology avec :

- **Couleurs principales** : Dégradés bleu-violet (#667eea, #764ba2)
- **Typographie** : Segoe UI, moderne et lisible
- **Effets visuels** : Glassmorphism, ombres douces, transitions fluides
- **Layout responsive** : Optimisé pour mobile, tablette et desktop
- **Navigation intuitive** : Breadcrumbs, pagination claire

## 📱 Pages disponibles

### Page d'accueil (`/`)
- Hero section avec présentation
- Aperçu des livres à la une
- Section "À propos" avec les fonctionnalités

### Liste des livres (`/books`)
- Affichage de tous les livres
- Pagination (10 livres par page)
- Navigation entre les pages
- Informations de pagination

### Détail d'un livre (`/books/:id`)
- Informations complètes du livre
- Résumé court et description détaillée
- Tags et métadonnées
- Lien de téléchargement
- Navigation breadcrumb

## 🔧 Personnalisation

### Modifier les livres
Éditez le fichier `api/books.json` pour ajouter, modifier ou supprimer des livres.

### Changer les couleurs
Modifiez les variables CSS dans `frontend/src/layouts/Layout.astro`.

### Ajuster la pagination
Changez la valeur `limit` dans `frontend/src/pages/books/index.astro`.

## 🚀 Déploiement

### API
L'API peut être déployée sur n'importe quelle plateforme supportant Node.js :
- Heroku
- Vercel
- Railway
- DigitalOcean

### Front-end
Le front-end Astro peut être déployé sur :
- Vercel
- Netlify
- GitHub Pages (avec build statique)

## 📝 Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **CORS** - Gestion des requêtes cross-origin

### Frontend
- **Astro** - Framework web moderne
- **CSS3** - Styles avancés avec glassmorphism
- **JavaScript** - Interactivité côté client

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🎯 Prochaines fonctionnalités

- [ ] Recherche avancée avec filtres
- [ ] Système de favoris
- [ ] Commentaires et notes
- [ ] Interface d'administration
- [ ] API d'authentification
- [ ] Base de données PostgreSQL/MongoDB

---

Développé avec ❤️ pour Octo Technology

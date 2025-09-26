# Guide de déploiement Octo Books sur CapRover

Ce guide vous explique comment déployer l'application Octo Books sur CapRover.

## Prérequis

- Un serveur CapRover configuré et accessible
- Git installé localement
- Accès à votre instance CapRover

## Architecture du déploiement

L'application utilise un Dockerfile multi-stage qui :
1. **Build le frontend** Vue.js en mode production
2. **Configure l'API** Node.js avec les dépendances
3. **Configure Nginx** pour servir le frontend et proxy l'API
4. **Démarre les services** avec un script de démarrage

## Étapes de déploiement

### 1. Préparer le repository

Assurez-vous que tous les fichiers suivants sont présents :
- `captain-definition` - Configuration CapRover
- `Dockerfile` - Instructions de build
- `.dockerignore` - Fichiers à ignorer lors du build

### 2. Créer l'application dans CapRover

1. Connectez-vous à votre interface CapRover
2. Allez dans **Apps** > **One-Click Apps/Databases**
3. Cliquez sur **Create New App**
4. Nommez votre application (ex: `octo-books`)
5. Cochez **Has Persistent Data** si vous voulez persister les données

### 3. Configurer l'application

Dans les paramètres de l'application :

#### Variables d'environnement (optionnel)
```
NODE_ENV=production
PORT=3200
```

#### Configuration des ports
- **Container HTTP Port**: `80`
- **Enable HTTPS**: Recommandé pour la PWA

### 4. Déployer depuis Git

#### Option A: Déploiement direct depuis le repository
1. Dans l'onglet **Deployment** de votre app
2. Sélectionnez **Deploy from Github/Bitbucket/Gitlab**
3. Entrez l'URL de votre repository
4. Sélectionnez la branche (généralement `main` ou `master`)
5. Cliquez sur **Deploy Now**

#### Option B: Déploiement depuis votre machine locale
```bash
# Cloner le repository (si pas déjà fait)
git clone <votre-repo-url>
cd octo-book

# Ajouter CapRover comme remote
git remote add caprover https://captain.your-domain.com/api/v2/user/apps/appname
# Déployer
git push caprover main
```

### 5. Configuration post-déploiement

#### Activer HTTPS (recommandé)
1. Dans **HTTP Settings** de votre app
2. Activez **HTTPS**
3. Activez **Force HTTPS**
4. Activez **Websocket Support** (pour les futures fonctionnalités)

#### Configurer le domaine personnalisé (optionnel)
1. Dans **HTTP Settings**
2. Ajoutez votre domaine personnalisé
3. Configurez les enregistrements DNS

## Vérification du déploiement

### 1. Vérifier les logs
```bash
# Dans l'interface CapRover, onglet "App Logs"
# Vous devriez voir :
# - "Démarrage d'Octo Books..."
# - "Démarrage de l'API..."
# - "🚀 Serveur API démarré sur le port 3200"
# - "Démarrage de Nginx..."
```

### 2. Tester l'application
1. Accédez à votre URL d'application
2. Vérifiez que la page d'accueil se charge
3. Testez la recherche de livres
4. Vérifiez que l'API répond sur `/api/health`

### 3. Tester les fonctionnalités hors ligne
1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet **Network**
3. Activez **Offline**
4. Rechargez la page - elle devrait fonctionner
5. Testez la recherche hors ligne

## Fonctionnalités de production

### PWA (Progressive Web App)
- ✅ Service Worker configuré
- ✅ Manifest.json présent
- ✅ Cache intelligent (Network First)
- ✅ Fonctionnement hors ligne

### Performance
- ✅ Build optimisé avec Vite
- ✅ Compression des assets
- ✅ Cache des ressources statiques (1 an)
- ✅ Headers de cache appropriés

### Sécurité
- ✅ HTTPS recommandé
- ✅ Headers de sécurité Nginx
- ✅ Proxy sécurisé pour l'API

## Dépannage

### L'application ne démarre pas
1. Vérifiez les logs dans CapRover
2. Assurez-vous que le port 80 est exposé
3. Vérifiez que les dépendances sont correctement installées

### L'API ne répond pas
1. Vérifiez que l'API démarre sur le port 3200
2. Testez l'endpoint `/api/health`
3. Vérifiez la configuration Nginx

### Le frontend ne se charge pas
1. Vérifiez que le build Vite s'est bien passé
2. Vérifiez que les fichiers sont dans `/app/frontend/dist`
3. Vérifiez la configuration Nginx

### Problèmes de cache/PWA
1. Videz le cache du navigateur
2. Vérifiez que le Service Worker est enregistré
3. Testez en navigation privée

## Mise à jour de l'application

Pour mettre à jour l'application :

```bash
# Faire vos modifications
git add .
git commit -m "Mise à jour de l'application"

# Déployer sur CapRover
git push caprover main
```

CapRover va automatiquement :
1. Rebuilder l'image Docker
2. Redémarrer l'application
3. Effectuer un déploiement sans interruption

## Support

En cas de problème :
1. Consultez les logs CapRover
2. Vérifiez la configuration Docker
3. Testez localement avec `docker build` et `docker run`

## Ressources utiles

- [Documentation CapRover](https://caprover.com/docs/)
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Nginx](https://nginx.org/en/docs/)

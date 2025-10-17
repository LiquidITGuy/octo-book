# Préchargement Intelligent des Livres

## Vue d'ensemble

Le système de préchargement intelligent permet de mettre en cache les détails des livres de manière proactive, améliorant considérablement l'expérience utilisateur en réduisant les temps de chargement et en permettant une navigation fluide même hors ligne.

## 🎯 Objectif

Lorsqu'un utilisateur arrive sur la page d'accueil et voit les livres à la une, le système précharge automatiquement les détails complets de ces livres en arrière-plan. Ainsi, quand l'utilisateur clique pour voir un livre, les informations sont déjà disponibles instantanément depuis le cache.

## 🚀 Fonctionnement

### Flux de Préchargement

1. **Chargement de la page d'accueil**
   ```
   HomeView monte → Récupère liste des livres à la une (2 livres)
   ```

2. **Démarrage du préchargement**
   ```
   Liste chargée → Délai 500ms → Préchargement intelligent démarre
   ```

3. **Préchargement des ressources**
   ```
   Images préchargées → Détails API préchargés → Tout mis en cache
   ```

4. **Navigation instantanée**
   ```
   Clic sur un livre → Données déjà en cache → Affichage immédiat
   ```

## 📦 Architecture

### Composable `usePrefetch`

Le composable fournit plusieurs méthodes pour gérer le préchargement :

```javascript
const {
  smartPrefetch,      // Préchargement intelligent (recommandé)
  prefetchBook,       // Précharger un livre
  prefetchBooks,      // Précharger plusieurs livres
  prefetchBooksFromList, // Précharger depuis une liste
  prefetchImages,     // Précharger seulement les images
  isPrefetching,      // État du préchargement
  getStats,           // Statistiques
  reset               // Réinitialiser
} = usePrefetch()
```

### Fonctionnalités Clés

#### 1. `smartPrefetch(books, options)`

La méthode recommandée qui combine préchargement d'images et de détails :

```javascript
smartPrefetch(books, {
  priority: 0,        // 0 = haute priorité
  includeImages: true, // Précharger aussi les images
  delay: 500          // Attendre 500ms avant de commencer
})
```

**Pourquoi un délai ?**
- Laisse le temps à la page de se charger complètement
- N'impacte pas les performances perçues
- Évite de surcharger le réseau au démarrage

#### 2. `prefetchBooks(bookIds, priority)`

Précharge les détails de plusieurs livres :

```javascript
prefetchBooks(['livre-1', 'livre-2', 'livre-3'], 5)
```

**Système de priorité :**
- `0` = Haute priorité (livres à la une)
- `5` = Priorité normale (défaut)
- `10` = Basse priorité (préchargement opportuniste)

#### 3. `prefetchImages(books)`

Précharge uniquement les images :

```javascript
prefetchImages(books)
```

Crée des objets `Image` en mémoire pour forcer le chargement et la mise en cache des images.

### Gestion de la File d'Attente

Le système utilise une file d'attente intelligente :

```javascript
prefetchQueue: [
  { bookId: 'livre-1', priority: 0 },
  { bookId: 'livre-2', priority: 0 },
  { bookId: 'livre-3', priority: 5 }
]
```

**Caractéristiques :**
- Tri automatique par priorité
- Évite les doublons
- Traitement séquentiel avec délai (50ms entre chaque)
- Continue même en cas d'erreur sur un livre

## 🔧 Intégration

### Dans la Page d'Accueil (HomeView.vue)

```javascript
import { usePrefetch } from '@/composables/usePrefetch'

export default {
  setup() {
    const { smartPrefetch } = usePrefetch()
    return { smartPrefetch }
  },
  methods: {
    async loadFeaturedBooks() {
      const response = await booksApi.getBooks(1, 2)
      this.featuredBooks = response.data.books
      
      // Démarrer le préchargement
      if (this.featuredBooks.length > 0) {
        this.smartPrefetch(this.featuredBooks, {
          priority: 0,
          includeImages: true,
          delay: 500
        })
      }
    }
  }
}
```

### Dans d'Autres Vues

Le composable peut être utilisé partout où vous avez une liste de livres :

```javascript
// Page de recherche
searchResults.forEach(book => {
  prefetchBook(book.id, 3) // Priorité moyenne
})

// Page par tag
prefetchBooksFromList(tagBooks, 5)

// Hover sur un livre
@mouseenter="prefetchBook(book.id, 1)" // Haute priorité
```

## 📊 Performance

### Métriques

Le système fournit des statistiques en temps réel :

```javascript
const stats = getPrefetchStats()
// {
//   prefetchedCount: 5,        // Nombre de livres en cache
//   queueLength: 2,            // Livres en attente
//   isPrefetching: true,       // Préchargement en cours
//   prefetchedIds: [1, 2, 3, 4, 5] // IDs des livres préchargés
// }
```

### Optimisations

1. **Délai entre requêtes** : 50ms
   - Évite de surcharger le serveur
   - Permet au réseau de respirer
   - N'impacte pas l'UX (invisible pour l'utilisateur)

2. **Délai initial** : 500ms
   - La page se charge normalement
   - Le préchargement démarre en arrière-plan
   - Priorité à l'affichage initial

3. **Gestion d'erreurs robuste**
   - Continue même si un livre échoue
   - Log les erreurs sans bloquer
   - Marque seulement les réussites

### Impact Réseau

**Page d'accueil avec 2 livres à la une :**

| Étape | Requêtes | Données |
|-------|----------|---------|
| Initial | 1 (liste) | ~5 KB |
| Préchargement | 2 (détails) | ~10 KB |
| Images | 2 (thumbnails) | ~200 KB |
| **Total** | **5** | **~215 KB** |

**Après préchargement :**
- Navigation instantanée vers les détails
- 0 requête supplémentaire
- 0 temps de chargement perçu

## 🎨 Logs de Débogage

Le système produit des logs détaillés pour le suivi :

```javascript
// Démarrage
"[HomeView] 2 livres à la une chargés, démarrage du préchargement..."
"[Prefetch] Préchargement intelligent de 2 livres"

// Images
"[Prefetch] Image /images/livre-1.jpg en cours de chargement"
"[Prefetch] Image /images/livre-2.jpg en cours de chargement"

// Détails
"[Prefetch] Ajout de 2 livres à la file de préchargement"
"[Prefetch] Traitement de 2 livres en attente"
"[Prefetch] Préchargement du livre livre-1..."
"[Prefetch] ✓ Livre livre-1 mis en cache"
"[Prefetch] Préchargement du livre livre-2..."
"[Prefetch] ✓ Livre livre-2 mis en cache"

// Fin
"[Prefetch] Préchargement terminé. 2 livres en cache"
```

## 🧪 Tests

### Test Manuel

1. **Ouvrir la console du navigateur**
2. **Naviguer vers la page d'accueil**
3. **Observer les logs** :
   - Chargement initial des 2 livres
   - Démarrage du préchargement après 500ms
   - Progression du préchargement

4. **Vérifier le cache** :
   - DevTools → Application → Cache Storage
   - Voir les requêtes API mises en cache

5. **Tester la navigation** :
   - Cliquer sur un livre à la une
   - Page devrait s'afficher instantanément
   - Vérifier dans Network tab : requête servie depuis le cache

### Test Hors Ligne

1. **Charger la page d'accueil en ligne**
2. **Attendre la fin du préchargement** (logs)
3. **Passer en mode hors ligne** (DevTools → Network → Offline)
4. **Cliquer sur un livre à la une**
5. **Vérifier** : La page de détail s'affiche normalement

### Vérification du Service Worker

```javascript
// Dans la console
caches.open('octo-books-v3').then(cache => {
  cache.keys().then(requests => {
    console.log('Requêtes en cache:', requests.map(r => r.url))
  })
})
```

## 🔍 Cas d'Usage

### 1. Page d'Accueil (Implémenté)

```javascript
// Précharger les livres à la une immédiatement
smartPrefetch(featuredBooks, { 
  priority: 0, 
  delay: 500 
})
```

### 2. Page de Recherche

```javascript
// Précharger les résultats de recherche
smartPrefetch(searchResults, { 
  priority: 3, 
  delay: 1000 
})
```

### 3. Page par Tag

```javascript
// Précharger les livres d'un tag
smartPrefetch(tagBooks, { 
  priority: 5, 
  delay: 800 
})
```

### 4. Hover Intelligent

```javascript
// Précharger au survol (desktop uniquement)
@mouseenter="prefetchBook(book.id, 1)"
```

### 5. Scroll Infini

```javascript
// Précharger la page suivante avant d'y arriver
if (scrollPosition > threshold) {
  prefetchBooks(nextPageBookIds, 7)
}
```

## ⚙️ Configuration

### Paramètres par Défaut

```javascript
// Dans usePrefetch.js
const config = {
  queueDelay: 50,        // Délai entre chaque livre (ms)
  defaultPriority: 5,    // Priorité par défaut
  maxRetries: 0,         // Pas de retry (continuer)
  includeImages: true,   // Précharger les images
  initialDelay: 500      // Délai avant démarrage (ms)
}
```

### Personnalisation

Vous pouvez ajuster ces paramètres selon vos besoins :

```javascript
// Préchargement plus agressif
smartPrefetch(books, {
  delay: 0,              // Démarrage immédiat
  priority: 0            // Haute priorité
})

// Préchargement plus conservateur
smartPrefetch(books, {
  delay: 2000,           // Attendre 2 secondes
  priority: 10,          // Basse priorité
  includeImages: false   // Pas d'images
})
```

## 🚦 Stratégies de Préchargement

### 1. Préchargement Agressif

**Quand :** Contenu critique, connexion rapide
```javascript
smartPrefetch(books, { priority: 0, delay: 0 })
```

### 2. Préchargement Modéré (Recommandé)

**Quand :** Usage normal, page d'accueil
```javascript
smartPrefetch(books, { priority: 5, delay: 500 })
```

### 3. Préchargement Conservateur

**Quand :** Connexion lente, économie de données
```javascript
smartPrefetch(books, { 
  priority: 10, 
  delay: 2000,
  includeImages: false 
})
```

### 4. Préchargement Opportuniste

**Quand :** Ressources supplémentaires disponibles
```javascript
if (navigator.connection.effectiveType === '4g') {
  prefetchBooks(allBookIds, 8)
}
```

## 📈 Bénéfices

### Pour l'Utilisateur

✅ **Navigation instantanée** : Pas d'attente lors du clic sur un livre  
✅ **Expérience fluide** : Transitions sans à-coups  
✅ **Fonctionnement hors ligne** : Contenu disponible sans connexion  
✅ **Économie de données** : Requêtes évitées lors des visites répétées  

### Pour l'Application

✅ **Performance perçue** : Application ressentie comme plus rapide  
✅ **Résilience** : Fonctionne même avec connexion instable  
✅ **SEO** : Meilleurs temps de chargement  
✅ **Engagement** : Utilisateurs restent plus longtemps  

## 🛠️ Maintenance

### Réinitialisation

En cas de problème, réinitialiser le système :

```javascript
const { reset } = usePrefetch()
reset()
```

### Monitoring

Surveiller les statistiques régulièrement :

```javascript
setInterval(() => {
  const stats = getStats()
  console.log('Préchargement:', stats)
}, 10000)
```

### Debug

Activer les logs détaillés :
```javascript
// Déjà actifs par défaut
// Voir la console pour tous les événements
```

## 🔮 Évolutions Futures

1. **Préchargement prédictif**
   - Analyser les habitudes de navigation
   - Précharger les livres susceptibles d'intéresser l'utilisateur

2. **Adaptation au réseau**
   - Détecter la vitesse de connexion
   - Ajuster la stratégie automatiquement

3. **Priorité dynamique**
   - Ajuster selon le comportement utilisateur
   - Précharger ce qui est le plus probable

4. **Cache intelligent**
   - Expiration basée sur la popularité
   - Mise à jour automatique du contenu périmé

5. **Analytics**
   - Tracker l'efficacité du préchargement
   - Mesurer l'amélioration de performance

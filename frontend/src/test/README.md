# Tests Unitaires - Octo Books

Ce dossier contient tous les tests unitaires pour l'application Octo Books, utilisant **Vitest** et **Vue Test Utils**.

## 🚀 Configuration

### Outils utilisés
- **Vitest** : Framework de test rapide et moderne
- **Vue Test Utils** : Utilitaires officiels pour tester les composants Vue
- **jsdom** : Environnement DOM pour les tests
- **@vitest/ui** : Interface graphique pour les tests

### Scripts disponibles
```bash
# Lancer les tests en mode watch
npm test

# Lancer les tests une seule fois
npm run test:run

# Interface graphique des tests
npm run test:ui

# Tests avec couverture de code
npm run test:coverage

# Tests avec couverture + ouverture du rapport HTML
npm run test:coverage:open

# Tests en mode watch
npm run test:watch

# Tests en mode watch avec couverture
npm run test:watch:coverage
```

## 📁 Structure des tests

```
src/test/
├── setup.js                    # Configuration globale des tests
├── components/                 # Tests des composants
│   ├── SearchBar.test.js      # Tests de la barre de recherche
│   ├── MobileMenu.test.js     # Tests du menu mobile
│   └── BackToTop.test.js      # Tests du bouton retour en haut
└── README.md                  # Cette documentation
```

## 🧪 Tests des composants

### SearchBar.test.js
Tests complets de la barre de recherche :
- ✅ Rendu initial et états
- ✅ Interaction avec le bouton de recherche
- ✅ Saisie de texte et suggestions
- ✅ Navigation et recherche
- ✅ Sélection de suggestions
- ✅ Accessibilité (ARIA)

**Couverture** : 95%+ des fonctionnalités

### MobileMenu.test.js
Tests complets du menu hamburger mobile :
- ✅ Rendu initial et structure
- ✅ Ouverture/fermeture du menu
- ✅ Navigation et liens
- ✅ Gestion du scroll du body
- ✅ Gestion du clavier (Escape)
- ✅ Accessibilité (ARIA)
- ✅ Nettoyage des ressources

**Couverture** : 90%+ des fonctionnalités

### BackToTop.test.js
Tests complets du bouton retour en haut :
- ✅ Rendu initial et visibilité
- ✅ Logique de scroll (seuil 300px)
- ✅ Fonctionnalité de scroll vers le haut
- ✅ Debounce des événements
- ✅ Gestion des event listeners
- ✅ Transitions Vue
- ✅ Nettoyage des timeouts

**Couverture** : 95%+ des fonctionnalités

## 🔧 Mocks et utilitaires

### setup.js
Configuration globale incluant :
- Mock de `matchMedia` pour les tests responsive
- Mock de `scrollTo` et `scrollY`
- Mock de `localStorage`
- Mock de `console` pour éviter les logs pendant les tests

### Mocks spécifiques
- **Vue Router** : Mock des fonctions de navigation
- **Composables** : Mock des composables personnalisés
- **APIs du navigateur** : Mock des APIs non disponibles en jsdom

## 📊 Bonnes pratiques

### Structure des tests
```javascript
describe('Composant', () => {
  describe('Fonctionnalité', () => {
    it('devrait faire quelque chose de spécifique', () => {
      // Test spécifique
    })
  })
})
```

### Nettoyage
- Utilisation de `beforeEach` et `afterEach`
- Nettoyage des mocks et event listeners
- Reset des états globaux

### Accessibilité
- Tests des attributs ARIA
- Tests de la navigation au clavier
- Tests des labels et descriptions

### Performance
- Tests du debounce
- Tests de la gestion mémoire
- Tests du nettoyage des ressources

## 🎯 Objectifs de couverture

- **Composants** : 90%+ de couverture
- **Fonctions critiques** : 100% de couverture
- **Cas d'erreur** : Tests des edge cases
- **Accessibilité** : Tests complets ARIA

## 🚨 Tests à ajouter

### Prochaines étapes
1. Tests d'intégration entre composants
2. Tests des composables (`useFavorites`, `useTheme`, etc.)
3. Tests des vues principales
4. Tests de performance
5. Tests E2E avec Playwright (déjà en place)

### Tests manquants
- Tests des composants existants (ThemeToggle, FavoriteButton, etc.)
- Tests des services (API)
- Tests des utilitaires
- Tests de régression

## 🔍 Debugging

### Lancer un test spécifique
```bash
npx vitest SearchBar.test.js
```

### Mode debug
```bash
npx vitest --inspect-brk
```

### Interface graphique
```bash
npm run test:ui
```

## 📊 Coverage (Couverture de code)

### Configuration
- **Provider** : V8 (rapide et précis)
- **Reporters** : Text, JSON, HTML
- **Seuils minimums** : 80% pour toutes les métriques
- **Exclusions** : Tests, config, node_modules

### Rapports disponibles
```bash
# Rapport dans le terminal
npm run test:coverage

# Rapport HTML interactif
npm run test:coverage:open
```

### Métriques de couverture
- **Branches** : 80% minimum
- **Functions** : 80% minimum  
- **Lines** : 80% minimum
- **Statements** : 80% minimum

### Fichiers couverts
- ✅ `src/components/SearchBar.vue` : 95%+
- ✅ `src/components/MobileMenu.vue` : 90%+
- ✅ `src/components/BackToTop.vue` : 95%+

### Rapport HTML
Le rapport HTML (`coverage/index.html`) offre :
- **Vue d'ensemble** des métriques globales
- **Détail par fichier** avec lignes non couvertes
- **Navigation interactive** dans le code
- **Historique** des couvertures

## 📈 Métriques

Les tests actuels couvrent :
- **3 composants** nouvellement créés
- **50+ assertions** au total
- **Tous les cas d'usage** principaux
- **Accessibilité** complète
- **Gestion d'erreurs** robuste

## 🤝 Contribution

Pour ajouter de nouveaux tests :
1. Créer le fichier dans le bon dossier
2. Suivre la structure existante
3. Inclure les tests d'accessibilité
4. Ajouter le nettoyage approprié
5. Documenter les cas complexes

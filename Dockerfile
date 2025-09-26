# Dockerfile multi-stage pour Octo Books
# Stage 1: Build du frontend
FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de dépendances du frontend
COPY frontend/package*.json ./
# Installer TOUTES les dépendances (dev incluses) pour le build
RUN npm ci

# Copier le code source du frontend
COPY frontend/ ./

# Build du frontend pour la production
RUN npm run build

# Stage 2: Setup de l'API et serveur final
FROM node:18-alpine AS production

WORKDIR /app

# Copier les fichiers de dépendances de l'API
COPY api/package*.json ./api/
WORKDIR /app/api
RUN npm ci --only=production

# Copier le code source de l'API
COPY api/ ./

# Retourner au répertoire racine
WORKDIR /app

# Copier les fichiers buildés du frontend depuis le stage précédent
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Exposer le port 3200 (port de l'API Node.js)
EXPOSE 3200

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3200

# Commande de démarrage directe
CMD ["node", "api/server.js"]

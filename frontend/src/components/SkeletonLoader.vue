<template>
  <div class="skeleton-loader">
    <!-- Skeleton pour une carte de livre -->
    <div v-if="type === 'book-card'" class="skeleton-book-card">
      <div class="skeleton-thumbnail"></div>
      <div class="skeleton-content">
        <div class="skeleton-header">
          <div class="skeleton-title"></div>
          <div class="skeleton-badge"></div>
        </div>
        <div class="skeleton-author"></div>
        <div class="skeleton-summary">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
        <div class="skeleton-tags">
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
        </div>
        <div class="skeleton-button"></div>
      </div>
    </div>

    <!-- Skeleton pour le détail d'un livre -->
    <div v-else-if="type === 'book-detail'" class="skeleton-book-detail">
      <div class="skeleton-breadcrumb"></div>
      <div class="skeleton-detail-content">
        <div class="skeleton-detail-image"></div>
        <div class="skeleton-detail-info">
          <div class="skeleton-detail-title"></div>
          <div class="skeleton-detail-author"></div>
          <div class="skeleton-detail-tags">
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
          </div>
          <div class="skeleton-detail-summary">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
          <div class="skeleton-detail-long-summary">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-button"></div>
            <div class="skeleton-button secondary"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton générique pour les listes -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in count" :key="i" class="skeleton-list-item">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>

    <!-- Skeleton pour la grille de livres -->
    <div v-else-if="type === 'books-grid'" class="skeleton-books-grid">
      <div v-for="i in count" :key="i" class="skeleton-book-card">
        <div class="skeleton-thumbnail"></div>
        <div class="skeleton-content">
          <div class="skeleton-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-badge"></div>
          </div>
          <div class="skeleton-author"></div>
          <div class="skeleton-summary">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
          <div class="skeleton-tags">
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
          </div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonLoader',
  props: {
    type: {
      type: String,
      default: 'book-card',
      validator: (value) => ['book-card', 'book-detail', 'list', 'books-grid'].includes(value)
    },
    count: {
      type: Number,
      default: 6
    }
  }
}
</script>

<style scoped>
.skeleton-loader {
  --skeleton-color: #e2e8f0;
  --skeleton-highlight: #f7fafc;
}

/* Animation de pulsation */
@keyframes skeleton-pulse {
  0% {
    background-color: var(--skeleton-color);
  }
  50% {
    background-color: var(--skeleton-highlight);
  }
  100% {
    background-color: var(--skeleton-color);
  }
}

.skeleton-loader * {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}

/* Skeleton pour carte de livre */
.skeleton-book-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--color-border);
  padding: 2rem;
  background: var(--color-card-background);
}

.skeleton-thumbnail {
  width: 100%;
  height: 250px;
  margin-bottom: 2rem;
  border-radius: 8px;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.skeleton-title {
  flex: 1;
  height: 2rem;
  border-radius: 6px;
}

.skeleton-badge {
  width: 80px;
  height: 1.5rem;
  border-radius: 12px;
}

.skeleton-author {
  height: 1rem;
  width: 60%;
  margin-bottom: 1.5rem;
}

.skeleton-summary {
  margin-bottom: 2rem;
}

.skeleton-line {
  height: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.skeleton-line.short {
  width: 70%;
}

.skeleton-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.skeleton-tag {
  width: 60px;
  height: 1.5rem;
  border-radius: 12px;
}

.skeleton-button {
  height: 2.5rem;
  width: 120px;
  border-radius: 4px;
  margin-top: auto;
}

.skeleton-button.secondary {
  width: 100px;
  margin-left: 1rem;
}

/* Skeleton pour grille de livres */
.skeleton-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 4rem;
  margin-bottom: 6rem;
}

/* Skeleton pour détail de livre */
.skeleton-breadcrumb {
  height: 1.5rem;
  width: 300px;
  margin-bottom: 3rem;
  border: 1px solid var(--color-border);
  padding: 1.5rem;
}

.skeleton-detail-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.skeleton-detail-image {
  width: 100%;
  height: 400px;
  border-radius: 15px;
}

.skeleton-detail-info {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  padding: 3rem;
}

.skeleton-detail-title {
  height: 3rem;
  width: 80%;
  margin-bottom: 1rem;
}

.skeleton-detail-author {
  height: 1.5rem;
  width: 60%;
  margin-bottom: 1.5rem;
}

.skeleton-detail-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.skeleton-detail-summary,
.skeleton-detail-long-summary {
  margin-bottom: 2rem;
}

.skeleton-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

/* Skeleton pour liste */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-list-item {
  padding: 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-card-background);
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-books-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .skeleton-detail-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .skeleton-detail-image {
    max-width: 250px;
    margin: 0 auto;
  }

  .skeleton-detail-info {
    padding: 1.5rem;
  }

  .skeleton-actions {
    flex-direction: column;
  }

  .skeleton-button.secondary {
    margin-left: 0;
    margin-top: 1rem;
  }
}

@media (max-width: 480px) {
  .skeleton-book-card {
    padding: 1rem;
  }

  .skeleton-thumbnail {
    height: 200px;
  }

  .skeleton-detail-info {
    padding: 1rem;
  }
}

/* Désactiver l'animation pour les utilisateurs qui préfèrent un mouvement réduit */
@media (prefers-reduced-motion: reduce) {
  .skeleton-loader * {
    animation: none !important;
    background-color: var(--skeleton-color) !important;
  }
}
</style>

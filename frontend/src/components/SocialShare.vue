<template>
  <div class="social-share">
    <div v-if="showLabel" class="share-label">
      <span>{{ label }}</span>
    </div>
    
    <div class="share-buttons" :class="{ 'vertical': layout === 'vertical' }">
      <!-- Twitter -->
      <button 
        @click="shareOnTwitter" 
        class="share-btn twitter"
        :aria-label="`Partager ${bookTitle} sur Twitter`"
        title="Partager sur Twitter"
      >
        <svg viewBox="0 0 24 24" class="share-icon">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
        <span v-if="showText">Twitter</span>
      </button>

      <!-- LinkedIn -->
      <button 
        @click="shareOnLinkedIn" 
        class="share-btn linkedin"
        :aria-label="`Partager ${bookTitle} sur LinkedIn`"
        title="Partager sur LinkedIn"
      >
        <svg viewBox="0 0 24 24" class="share-icon">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        <span v-if="showText">LinkedIn</span>
      </button>

      <!-- Facebook -->
      <button 
        @click="shareOnFacebook" 
        class="share-btn facebook"
        :aria-label="`Partager ${bookTitle} sur Facebook`"
        title="Partager sur Facebook"
      >
        <svg viewBox="0 0 24 24" class="share-icon">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <span v-if="showText">Facebook</span>
      </button>

      <!-- WhatsApp -->
      <button 
        @click="shareOnWhatsApp" 
        class="share-btn whatsapp"
        :aria-label="`Partager ${bookTitle} sur WhatsApp`"
        title="Partager sur WhatsApp"
      >
        <svg viewBox="0 0 24 24" class="share-icon">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
        </svg>
        <span v-if="showText">WhatsApp</span>
      </button>

      <!-- Email -->
      <button 
        @click="shareByEmail" 
        class="share-btn email"
        :aria-label="`Partager ${bookTitle} par email`"
        title="Partager par email"
      >
        <svg viewBox="0 0 24 24" class="share-icon">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819l6.545 4.91 6.545-4.91h3.819A1.636 1.636 0 0 1 24 5.457z"/>
        </svg>
        <span v-if="showText">Email</span>
      </button>

      <!-- Copier le lien -->
      <button 
        @click="copyLink" 
        class="share-btn copy"
        :class="{ 'copied': linkCopied }"
        :aria-label="`Copier le lien de ${bookTitle}`"
        :title="linkCopied ? 'Lien copié !' : 'Copier le lien'"
      >
        <svg v-if="!linkCopied" viewBox="0 0 24 24" class="share-icon">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" class="share-icon">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <span v-if="showText">{{ linkCopied ? 'Copié !' : 'Copier' }}</span>
      </button>

      <!-- Web Share API (natif) -->
      <button 
        v-if="canUseWebShare"
        @click="shareNative" 
        class="share-btn native"
        :aria-label="`Partager ${bookTitle}`"
        title="Partager"
      >
        <svg viewBox="0 0 24 24" class="share-icon">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>
        <span v-if="showText">Partager</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'SocialShare',
  props: {
    bookTitle: {
      type: String,
      required: true
    },
    bookSummary: {
      type: String,
      default: ''
    },
    bookUrl: {
      type: String,
      default: ''
    },
    bookImage: {
      type: String,
      default: ''
    },
    authors: {
      type: Array,
      default: () => []
    },
    tags: {
      type: Array,
      default: () => []
    },
    showText: {
      type: Boolean,
      default: true
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: 'Partager ce livre'
    },
    layout: {
      type: String,
      default: 'horizontal',
      validator: (value) => ['horizontal', 'vertical'].includes(value)
    }
  },
  emits: ['share'],
  setup(props, { emit }) {
    const linkCopied = ref(false)
    const canUseWebShare = ref(false)

    // Construire l'URL complète du livre
    const fullBookUrl = computed(() => {
      if (props.bookUrl) return props.bookUrl
      return `${window.location.origin}${window.location.pathname}`
    })

    // Texte de partage personnalisé
    const shareText = computed(() => {
      const authorsText = props.authors.length > 0 ? ` par ${props.authors.join(', ')}` : ''
      const tagsText = props.tags.length > 0 ? ` #${props.tags.slice(0, 3).join(' #')}` : ''
      return `📚 "${props.bookTitle}"${authorsText} - Découvert sur Octo Books${tagsText}`
    })

    // Vérifier le support de Web Share API
    onMounted(() => {
      canUseWebShare.value = 'share' in navigator
    })

    const shareOnTwitter = () => {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(fullBookUrl.value)}`
      openShareWindow(url, 'Twitter')
      trackShare('twitter')
    }

    const shareOnLinkedIn = () => {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullBookUrl.value)}`
      openShareWindow(url, 'LinkedIn')
      trackShare('linkedin')
    }

    const shareOnFacebook = () => {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullBookUrl.value)}&quote=${encodeURIComponent(shareText.value)}`
      openShareWindow(url, 'Facebook')
      trackShare('facebook')
    }

    const shareOnWhatsApp = () => {
      const url = `https://wa.me/?text=${encodeURIComponent(`${shareText.value} ${fullBookUrl.value}`)}`
      if (window.innerWidth <= 768) {
        // Mobile : ouvrir directement WhatsApp
        window.location.href = url
      } else {
        // Desktop : ouvrir WhatsApp Web
        openShareWindow(`https://web.whatsapp.com/send?text=${encodeURIComponent(`${shareText.value} ${fullBookUrl.value}`)}`, 'WhatsApp')
      }
      trackShare('whatsapp')
    }

    const shareByEmail = () => {
      const subject = `📚 ${props.bookTitle} - Recommandation de livre`
      const body = `Salut !

Je viens de découvrir ce livre intéressant sur Octo Books et je pense qu'il pourrait t'intéresser :

📖 Titre : ${props.bookTitle}
${props.authors.length > 0 ? `✍️ Auteur(s) : ${props.authors.join(', ')}` : ''}
${props.bookSummary ? `📝 Résumé : ${props.bookSummary}` : ''}
${props.tags.length > 0 ? `🏷️ Tags : ${props.tags.join(', ')}` : ''}

🔗 Voir le livre : ${fullBookUrl.value}

Découvre plus de livres sur Octo Books !

Bonne lecture ! 📚`

      const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.location.href = url
      trackShare('email')
    }

    const copyLink = async () => {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(fullBookUrl.value)
        } else {
          // Fallback pour les navigateurs plus anciens
          const textArea = document.createElement('textarea')
          textArea.value = fullBookUrl.value
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
        }
        
        linkCopied.value = true
        setTimeout(() => {
          linkCopied.value = false
        }, 2000)
        
        trackShare('copy')
      } catch (error) {
        console.error('Erreur lors de la copie:', error)
      }
    }

    const shareNative = async () => {
      if (!navigator.share) return

      try {
        await navigator.share({
          title: props.bookTitle,
          text: shareText.value,
          url: fullBookUrl.value
        })
        trackShare('native')
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur lors du partage natif:', error)
        }
      }
    }

    const openShareWindow = (url, platform) => {
      const width = 600
      const height = 400
      const left = (window.innerWidth - width) / 2
      const top = (window.innerHeight - height) / 2
      
      window.open(
        url,
        `share-${platform}`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      )
    }

    const trackShare = (platform) => {
      emit('share', {
        platform,
        bookTitle: props.bookTitle,
        url: fullBookUrl.value,
        timestamp: new Date().toISOString()
      })
      
      // Analytics (si disponible)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
          method: platform,
          content_type: 'book',
          item_id: props.bookTitle
        })
      }
    }

    return {
      linkCopied,
      canUseWebShare,
      shareOnTwitter,
      shareOnLinkedIn,
      shareOnFacebook,
      shareOnWhatsApp,
      shareByEmail,
      copyLink,
      shareNative
    }
  }
}
</script>

<style scoped>
.social-share {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.share-label {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.share-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.share-buttons.vertical {
  flex-direction: column;
  align-items: flex-start;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-card-background);
  color: var(--color-text);
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 44px;
  justify-content: center;
}

.share-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.share-btn:active {
  transform: translateY(0);
}

.share-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  flex-shrink: 0;
}

/* Couleurs spécifiques par plateforme */
.share-btn.twitter:hover {
  background: #1da1f2;
  color: white;
  border-color: #1da1f2;
}

.share-btn.linkedin:hover {
  background: #0077b5;
  color: white;
  border-color: #0077b5;
}

.share-btn.facebook:hover {
  background: #1877f2;
  color: white;
  border-color: #1877f2;
}

.share-btn.whatsapp:hover {
  background: #25d366;
  color: white;
  border-color: #25d366;
}

.share-btn.email:hover {
  background: #ea4335;
  color: white;
  border-color: #ea4335;
}

.share-btn.copy:hover {
  background: var(--color-primary);
  color: var(--color-background);
  border-color: var(--color-primary);
}

.share-btn.copy.copied {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.share-btn.native:hover {
  background: var(--color-secondary);
  color: var(--color-background);
  border-color: var(--color-secondary);
}


/* Responsive */
@media (max-width: 768px) {
  .share-buttons {
    gap: 0.5rem;
  }
  
  .share-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    min-width: 40px;
  }
  
  .share-icon {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .share-buttons:not(.vertical) {
    justify-content: center;
  }
  
  .share-btn span {
    display: none;
  }
  
  .share-btn {
    padding: 0.75rem;
    min-width: 44px;
  }
}

/* Désactiver les animations pour les utilisateurs qui préfèrent un mouvement réduit */
@media (prefers-reduced-motion: reduce) {
  .share-btn {
    transition: none !important;
  }
  
  .share-btn:hover,
  .share-btn:active {
    transform: none !important;
  }
}
</style>

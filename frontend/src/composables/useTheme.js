import { ref, watch } from 'vue'

const isDark = ref(false)

// Initialiser le thème depuis localStorage ou préférence système
const initTheme = () => {
  const savedTheme = localStorage.getItem('octo-books-theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // Utiliser la préférence système
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

// Appliquer le thème au document
const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  }
}

// Basculer le thème
const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('octo-books-theme', isDark.value ? 'dark' : 'light')
  applyTheme()
}

// Watcher pour appliquer le thème quand il change
watch(isDark, applyTheme)

export function useTheme() {
  return {
    isDark,
    toggleTheme,
    initTheme
  }
}

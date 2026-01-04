import { computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Language, Theme } from '../types'
import { STORAGE_KEYS } from '../composables/useStorage'

// Reactive localStorage for language
const lang = useLocalStorage<Language>(STORAGE_KEYS.LANG, 'zh')

// Reactive localStorage for theme
const theme = useLocalStorage<Theme>(STORAGE_KEYS.THEME, 'light')

// Apply theme to document
function applyTheme(next: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', next)
}

// Initialize theme on load
applyTheme(theme.value)

// Watch theme changes
watch(theme, (v) => {
  applyTheme(v)
})

const isDark = computed(() => theme.value === 'dark')

function toggleTheme(): void {
  const next: Theme = theme.value === 'dark' ? 'light' : 'dark'

  if (typeof document === 'undefined') {
    theme.value = next
    return
  }

  try {
    const startViewTransition = (
      document as unknown as { startViewTransition?: (cb: () => void) => unknown }
    ).startViewTransition

    if (!startViewTransition) {
      theme.value = next
      return
    }

    startViewTransition(() => {
      theme.value = next
    })
  } catch {
    theme.value = next
  }
}

export function useUiStore() {
  return { lang, theme, isDark, toggleTheme }
}

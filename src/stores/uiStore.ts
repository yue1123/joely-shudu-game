import { computed, ref, watch } from 'vue'

import { loadLang, loadTheme, saveLang, saveTheme, type Language, type Theme } from '../uiState'

const lang = ref<Language>(loadLang())
const theme = ref<Theme>(loadTheme())

function applyTheme(next: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', next)
}

applyTheme(theme.value)

watch(lang, (v) => saveLang(v))
watch(theme, (v) => {
  saveTheme(v)
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
      applyTheme(next)
      return
    }

    startViewTransition(() => {
      theme.value = next
      applyTheme(next)
    })
  } catch {
    theme.value = next
    applyTheme(next)
  }
}

export function useUiStore() {
  return { lang, theme, isDark, toggleTheme }
}

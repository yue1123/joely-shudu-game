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
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

export function useUiStore() {
  return { lang, theme, isDark, toggleTheme }
}

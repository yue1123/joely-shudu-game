export type Language = 'zh' | 'en'
export type Theme = 'light' | 'dark'

const LANG_KEY = 'joely-shudu-game:lang:v2'
const THEME_KEY = 'joely-shudu-game:theme:v1'

export function loadLang(): Language {
  const raw = localStorage.getItem(LANG_KEY)
  if (raw === 'zh' || raw === 'en') return raw
  return 'zh'
}

export function saveLang(lang: Language): void {
  localStorage.setItem(LANG_KEY, lang)
}

export function loadTheme(): Theme {
  const raw = localStorage.getItem(THEME_KEY)
  if (raw === 'light' || raw === 'dark') return raw
  return 'light'
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme)
}

import { useLocalStorage, type RemovableRef } from '@vueuse/core'

// Centralized storage keys
export const STORAGE_KEYS = {
  LANG: 'joely-shudu-game:lang:v2',
  THEME: 'joely-shudu-game:theme:v1',
  SAVE: 'joely-shudu-game:save:v1',
  LEADERBOARD: 'joely-shudu-game:leaderboard:v1',
} as const

/**
 * VueUse-based reactive localStorage wrapper
 * Returns a ref that auto-syncs with localStorage
 */
export function useReactiveStorage<T>(key: string, defaultValue: T): RemovableRef<T> {
  return useLocalStorage<T>(key, defaultValue, {
    mergeDefaults: true,
  })
}

/**
 * Type-safe localStorage wrapper (non-reactive, for one-time reads)
 */
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage might be full or disabled
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore errors
  }
}

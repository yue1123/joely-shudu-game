import { computed, ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Difficulty } from '../sudoku'
import type { LeaderboardEntry, LeaderboardState } from '../types'
import { STORAGE_KEYS } from '../composables/useStorage'

// ============ State ============

const currentTab = ref<Difficulty>('easy')

function createEmptyState(): LeaderboardState {
  return { version: 1, easy: [], medium: [], hard: [] }
}

// Reactive localStorage for leaderboard data
const leaderboardData = useLocalStorage<LeaderboardState>(
  STORAGE_KEYS.LEADERBOARD,
  createEmptyState(),
  { mergeDefaults: true }
)

// ============ Computed ============

const currentEntries = computed(() => {
  return leaderboardData.value[currentTab.value]
})

// ============ Actions ============

function setTab(tab: Difficulty): void {
  currentTab.value = tab
}

function addEntry(difficulty: Difficulty, seconds: number, hintsUsed: number): void {
  const entry: LeaderboardEntry = {
    seconds,
    at: Date.now(),
    hintsUsed,
  }

  const list = [...leaderboardData.value[difficulty], entry]
  list.sort((a, b) => a.seconds - b.seconds)

  leaderboardData.value = {
    ...leaderboardData.value,
    [difficulty]: list.slice(0, 10), // Keep top 10
  }
}

function getEntries(difficulty: Difficulty): LeaderboardEntry[] {
  return leaderboardData.value[difficulty]
}

function getBestForDifficulty(difficulty: Difficulty): LeaderboardEntry | null {
  const entries = leaderboardData.value[difficulty]
  if (entries.length === 0) return null
  // Already sorted by seconds, so first is best
  return entries[0] ?? null
}

function clearAll(): void {
  leaderboardData.value = createEmptyState()
}

// ============ Export ============

export function useLeaderboardStore() {
  return {
    // State
    currentTab,

    // Computed
    leaderboardData,
    currentEntries,

    // Actions
    setTab,
    addEntry,
    getEntries,
    getBestForDifficulty,
    clearAll,
  }
}

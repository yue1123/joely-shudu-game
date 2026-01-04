<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import TopNav from '../components/TopNav.vue'
import { SudokuBoard, NumberPad, ActionBar, GameStats } from '../components/game'
import { useGameStore, useLeaderboardStore } from '../stores'
import type { Difficulty, Digit } from '../sudoku'

const route = useRoute()
const game = useGameStore()
const leaderboard = useLeaderboardStore()

// Timer management
let timerId: number | null = null
let saveDebounceId: number | null = null

function startTimer(): void {
  stopTimer()
  timerId = window.setInterval(() => {
    game.incrementTime()
    if (game.elapsedSeconds.value % 5 === 0) {
      persistSaveSoon()
    }
  }, 1000)
}

function stopTimer(): void {
  if (timerId !== null) {
    window.clearInterval(timerId)
    timerId = null
  }
}

// Save debouncing
function persistSaveSoon(): void {
  if (!game.isReady.value) return
  if (saveDebounceId !== null) window.clearTimeout(saveDebounceId)
  saveDebounceId = window.setTimeout(() => {
    saveDebounceId = null
    game.persistSave()
  }, 400)
}

// Computed
const canUndo = computed(() => game.history.value.length > 0)
const canHint = computed(() => game.selected.value !== null)
const canClear = computed(() => game.selected.value !== null)
const showSaved = computed(() => game.lastSavedAt.value !== null)

// Actions
function handleDigitPress(digit: Exclude<Digit, 0>): void {
  game.inputDigit(digit)
  persistSaveSoon()
  checkCompletion()
}

function handleUndo(): void {
  game.undo()
  persistSaveSoon()
}

function handleHint(): void {
  game.hint()
  persistSaveSoon()
  checkCompletion()
}

function handleClear(): void {
  game.clearCell()
  persistSaveSoon()
}

function checkCompletion(): void {
  if (game.isCompleted.value) {
    stopTimer()
    leaderboard.addEntry(
      game.difficulty.value,
      game.elapsedSeconds.value,
      game.hintsUsed.value
    )
    game.clearSave()
  }
}

function onKeyDown(e: KeyboardEvent): void {
  if (!game.isReady.value) return
  if (e.key >= '1' && e.key <= '9') {
    handleDigitPress(Number(e.key) as Exclude<Digit, 0>)
  } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    handleClear()
  }
}

// Route parsing helpers
function parseDifficulty(value: unknown): Difficulty {
  if (value === 'easy' || value === 'medium' || value === 'hard') return value
  return 'easy'
}

function parseMaxErrors(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value
  const n = typeof raw === 'string' ? Number(raw) : typeof raw === 'number' ? raw : NaN
  if (!Number.isFinite(n)) return 3
  const int = Math.floor(n)
  return Math.min(99, Math.max(1, int))
}

function initFromRoute(): void {
  game.setMaxErrors(parseMaxErrors(route.query.maxErrors))

  const mode = route.query.mode
  if (mode === 'continue') {
    const success = game.continueSavedGame()
    if (success && !game.isLocked.value) {
      startTimer()
      return
    }
    game.newGame('easy')
    startTimer()
    persistSaveSoon()
    return
  }

  const nextDifficulty = parseDifficulty(route.query.difficulty)
  game.newGame(nextDifficulty)
  startTimer()
  persistSaveSoon()
}

// Lifecycle
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  initFromRoute()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  stopTimer()
  if (saveDebounceId !== null) window.clearTimeout(saveDebounceId)
})
</script>

<template>
  <div class="min-h-screen w-full">
    <TopNav />

    <main
      class="group mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col items-center justify-center gap-4 px-4 py-6 bg-base-100 text-base-content"
    >
      <div class="w-full max-w-xl">
        <!-- Stats Bar -->
        <GameStats
          :elapsed-seconds="game.elapsedSeconds.value"
          :hints-used="game.hintsUsed.value"
          :errors-count="game.errorsCount.value"
          :max-errors="game.maxErrors.value"
          :difficulty="game.difficulty.value"
          :show-saved="showSaved"
        />

        <!-- Game Board -->
        <div v-if="game.isReady.value" class="mt-4">
          <SudokuBoard />

          <!-- Number Pad -->
          <div class="mt-4">
            <NumberPad :disabled="game.isLocked.value" @press="handleDigitPress" />
          </div>

          <!-- Action Buttons -->
          <div class="mt-3">
            <ActionBar
              :can-undo="canUndo"
              :can-hint="canHint"
              :can-clear="canClear"
              :disabled="game.isLocked.value"
              @undo="handleUndo"
              @hint="handleHint"
              @clear="handleClear"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

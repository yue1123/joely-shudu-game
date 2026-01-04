<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import TopNav from '../components/TopNav.vue'
import { t } from '../i18n'
import { useUiStore } from '../stores/uiStore'

import type { Board, Difficulty, Digit } from '../sudoku'
import { cloneBoard, findConflicts, generatePuzzle, isSolved, setCell } from '../sudoku'

import { Icon } from '@iconify/vue'

type SaveState = {
  version: 1
  difficulty: Difficulty
  puzzle: Board
  solution: Board
  given: boolean[][]
  board: Board
  elapsedSeconds: number
  hintsUsed: number
  errorsCount?: number
  maxErrors?: number
}

type LeaderboardEntry = {
  seconds: number
  at: number
  hintsUsed: number
}

type LeaderboardState = {
  version: 1
  easy: LeaderboardEntry[]
  medium: LeaderboardEntry[]
  hard: LeaderboardEntry[]
}

const SAVE_KEY = 'joely-shudu-game:save:v1'
const LEADERBOARD_KEY = 'joely-shudu-game:leaderboard:v1'

const route = useRoute()
const ui = useUiStore()

const difficulty = ref<Difficulty>('easy')

const puzzle = ref<Board | null>(null)
const solution = ref<Board | null>(null)
const given = ref<boolean[][] | null>(null)
const board = ref<Board | null>(null)

const selected = ref<{ row: number; col: number } | null>(null)
const elapsedSeconds = ref(0)
const hintsUsed = ref(0)
const errorsCount = ref(0)
const maxErrors = ref(3)
const selectedDigit = ref<Exclude<Digit, 0> | null>(null)
const lastSavedAt = ref<number | null>(null)

const history = ref<Board[]>([])

let timerId: number | null = null
let saveDebounceId: number | null = null

const isReady = computed(() => Boolean(puzzle.value && solution.value && given.value && board.value))
const isLocked = computed(() => errorsCount.value >= maxErrors.value)

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const timeText = computed(() => formatTime(elapsedSeconds.value))

const conflicts = computed(() => {
  if (!board.value) return []
  return findConflicts(board.value)
})

const conflictSet = computed(() => {
  const set = new Set<string>()
  for (const c of conflicts.value) set.add(`${c.row},${c.col}`)
  return set
})

const wrongSet = computed(() => {
  const set = new Set<string>()
  if (!board.value || !solution.value || !given.value) return set
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (given.value[row]![col]!) continue
      const v = board.value[row]![col]!
      if (v === 0) continue
      const correct = solution.value[row]![col]!
      if (v !== correct) set.add(`${row},${col}`)
    }
  }
  return set
})

const savedText = computed(() => (lastSavedAt.value ? t(ui.lang.value, 'saved') : ''))

const frameClass = 'bg-base-100 text-base-content border-base-content'
const cellBorder = 'border-base-content/40'
const cellBorderStrong = 'border-base-content'

function isSelectedCell(row: number, col: number): boolean {
  return selected.value?.row === row && selected.value?.col === col
}

function isSameRowOrCol(row: number, col: number): boolean {
  if (!selected.value) return false
  return selected.value.row === row || selected.value.col === col
}

function isSameBox(row: number, col: number): boolean {
  if (!selected.value) return false
  const boxRow = Math.floor(row / 3)
  const boxCol = Math.floor(col / 3)
  const selectedBoxRow = Math.floor(selected.value.row / 3)
  const selectedBoxCol = Math.floor(selected.value.col / 3)
  return boxRow === selectedBoxRow && boxCol === selectedBoxCol
}

function isRelatedToSelected(row: number, col: number): boolean {
  if (!selected.value) return false
  if (isSelectedCell(row, col)) return false
  return isSameRowOrCol(row, col) || isSameBox(row, col)
}

function startTimer(): void {
  stopTimer()
  timerId = window.setInterval(() => {
    elapsedSeconds.value += 1
    if (elapsedSeconds.value % 5 === 0) persistSaveSoon()
  }, 1000)
}

function stopTimer(): void {
  if (timerId !== null) {
    window.clearInterval(timerId)
    timerId = null
  }
}

function newGame(nextDifficulty: Difficulty): void {
  const g = generatePuzzle(nextDifficulty)
  difficulty.value = nextDifficulty
  puzzle.value = g.puzzle
  solution.value = g.solution
  given.value = g.given
  board.value = g.puzzle.map((r) => r.slice() as Digit[])
  selected.value = null
  elapsedSeconds.value = 0
  hintsUsed.value = 0
  errorsCount.value = 0
  history.value = []
  lastSavedAt.value = null
  startTimer()
  persistSaveSoon()
}

function selectCell(row: number, col: number): void {
  if (!board.value || !given.value) return
  selected.value = { row, col }

  const v = board.value[row]?.[col] ?? 0
  if (v !== 0) selectedDigit.value = v as Exclude<Digit, 0>
}

function isSameDigitCell(row: number, col: number): boolean {
  if (!selectedDigit.value || !board.value) return false
  return board.value[row]?.[col] === selectedDigit.value
}

function pressDigit(n: number): void {
  if (n >= 1 && n <= 9) selectedDigit.value = n as Exclude<Digit, 0>
  inputDigit(n)
}

function inputDigit(value: number): void {
  if (isLocked.value) return
  if (!board.value || !given.value || !selected.value) return
  const { row, col } = selected.value
  if (given.value[row]![col]!) return

  if (value >= 1 && value <= 9) selectedDigit.value = value as Exclude<Digit, 0>

  const prev = board.value[row]![col]!
  if (prev === value) return

  // Once a digit is filled, it can't be replaced by another digit directly.
  // Users must erase (set to 0) or undo first.
  if (prev !== 0 && value !== 0) return

  history.value.push(cloneBoard(board.value))

  board.value = setCell(board.value, row, col, value)
  const correct = solution.value?.[row]?.[col]
  if (typeof correct === 'number' && value !== 0 && value !== correct) {
    errorsCount.value += 1
    if (errorsCount.value >= maxErrors.value) {
      stopTimer()
    }
  }
  persistSaveSoon()
  checkCompletion()
}

function clearCell(): void {
  inputDigit(0)
}

function hint(): void {
  if (isLocked.value) return
  if (!board.value || !solution.value || !given.value || !selected.value) return
  const { row, col } = selected.value
  if (given.value[row]![col]!) return

  // Hint only fills empty editable cells.
  if (board.value[row]![col]! !== 0) return
  const correct = solution.value[row]![col]!

  history.value.push(cloneBoard(board.value))

  board.value = setCell(board.value, row, col, correct)
  selectedDigit.value = correct as Exclude<Digit, 0>
  hintsUsed.value += 1
  persistSaveSoon()
  checkCompletion()
}

function undo(): void {
  if (isLocked.value) return
  if (!board.value) return
  if (history.value.length === 0) return
  board.value = history.value.pop() ?? board.value
  persistSaveSoon()

  if (selected.value) {
    const v = board.value[selected.value.row]?.[selected.value.col] ?? 0
    if (v !== 0) selectedDigit.value = v as Exclude<Digit, 0>
  }
}

function checkCompletion(): void {
  if (!board.value) return
  if (isSolved(board.value)) {
    stopTimer()
    updateLeaderboard()
    clearSave()
  }
}

function loadLeaderboard(): LeaderboardState {
  const raw = localStorage.getItem(LEADERBOARD_KEY)
  if (!raw) return { version: 1, easy: [], medium: [], hard: [] }
  try {
    const parsed = JSON.parse(raw) as LeaderboardState
    if (parsed && parsed.version === 1) return parsed
  } catch {
    // ignore
  }
  return { version: 1, easy: [], medium: [], hard: [] }
}

function updateLeaderboard(): void {
  const entry: LeaderboardEntry = { seconds: elapsedSeconds.value, at: Date.now(), hintsUsed: hintsUsed.value }
  const state = loadLeaderboard()
  const key = difficulty.value
  const list = state[key].slice()
  list.push(entry)
  list.sort((a, b) => a.seconds - b.seconds)
  const next: LeaderboardState = { ...state, [key]: list.slice(0, 10) }
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next))
}

function persistSaveSoon(): void {
  if (!isReady.value) return
  if (saveDebounceId !== null) window.clearTimeout(saveDebounceId)
  saveDebounceId = window.setTimeout(() => {
    saveDebounceId = null
    persistSave()
  }, 400)
}

function persistSave(): void {
  if (!puzzle.value || !solution.value || !given.value || !board.value) return
  const state: SaveState = {
    version: 1,
    difficulty: difficulty.value,
    puzzle: puzzle.value,
    solution: solution.value,
    given: given.value,
    board: board.value,
    elapsedSeconds: elapsedSeconds.value,
    hintsUsed: hintsUsed.value,
    errorsCount: errorsCount.value,
    maxErrors: maxErrors.value,
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  lastSavedAt.value = Date.now()
}

function loadSave(): SaveState | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as SaveState
    if (parsed && parsed.version === 1) return parsed
  } catch {
    // ignore
  }
  return null
}

function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}

function continueSavedGame(): void {
  const saved = loadSave()
  if (!saved) return
  difficulty.value = saved.difficulty
  puzzle.value = saved.puzzle
  solution.value = saved.solution
  given.value = saved.given
  board.value = saved.board
  elapsedSeconds.value = saved.elapsedSeconds
  hintsUsed.value = saved.hintsUsed
  errorsCount.value = saved.errorsCount ?? 0
  if (typeof saved.maxErrors === 'number') maxErrors.value = saved.maxErrors
  lastSavedAt.value = Date.now()
  selected.value = null
  history.value = []
  if (!isLocked.value) startTimer()
}

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
  maxErrors.value = parseMaxErrors(route.query.maxErrors)

  const mode = route.query.mode
  if (mode === 'continue') {
    continueSavedGame()
    if (board.value) return
    newGame('easy')
    return
  }

  const nextDifficulty = parseDifficulty(route.query.difficulty)
  newGame(nextDifficulty)
}

function onKeyDown(e: KeyboardEvent): void {
  if (!isReady.value) return
  if (e.key >= '1' && e.key <= '9') {
    inputDigit(Number(e.key))
  } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    clearCell()
  }
}

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

    <main class="group mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col items-center justify-center gap-4 px-4 py-6 bg-base-100 text-base-content">
      <div class="w-full max-w-xl">
        <div class="mx-auto flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span class="border border-base-content px-3 py-1">
            {{ t(ui.lang, 'timer') }}: <span class="font-mono tabular-nums">{{ timeText }}</span>
          </span>
          <span class="border border-base-content px-3 py-1">
            {{ t(ui.lang, 'hintsUsed') }}: <span class="font-mono tabular-nums">{{ hintsUsed }}</span>
          </span>
          <span class="border border-base-content px-3 py-1">
            {{ t(ui.lang, 'mistakes') }}:
            <span class="font-mono tabular-nums">{{ errorsCount }}/{{ maxErrors }}</span>
          </span>
          <span class="border border-base-content px-3 py-1">
            {{ t(ui.lang, 'difficulty') }}: <span class="font-mono">{{ difficulty }}</span>
          </span>
          <span v-if="savedText" class="border border-base-content px-3 py-1">
            {{ savedText }}
          </span>
        </div>

        <div v-if="isReady" class="mt-4">
          <div
            class="mx-auto grid aspect-square w-full max-w-xl grid-rows-9 overflow-hidden border-2"
            :class="frameClass"
          >
            <div v-for="r in 9" :key="r" class="grid grid-cols-9">
              <button
                v-for="c in 9"
                :key="c"
                type="button"
                class="grid place-items-center font-mono text-lg font-extrabold outline-none transition-none group-hover:transition-[background-color] group-hover:duration-200"
                :class="[
                  'text-base-content',
                  (r === 9) ? '' : ['border-b', cellBorder],
                  (c === 9) ? '' : ['border-r', cellBorder],
                  (c === 3 || c === 6) ? ['border-r-[2px]', cellBorderStrong] : '',
                  (r === 3 || r === 6) ? ['border-b-[2px]', cellBorderStrong] : '',
                  isRelatedToSelected(r - 1, c - 1) ? 'bg-[color:var(--sudoku-related)]' : '',
                  (isSameDigitCell(r - 1, c - 1) && !isSelectedCell(r - 1, c - 1)) ? 'bg-[color:var(--sudoku-selected)]' : '',
                  isSelectedCell(r - 1, c - 1) ? 'bg-[color:var(--sudoku-selected)]' : '',
                  isSelectedCell(r - 1, c - 1)
                    ? 'hover:bg-[color:var(--sudoku-selected)]'
                    : isSameDigitCell(r - 1, c - 1)
                      ? 'hover:bg-[color:var(--sudoku-selected)]'
                    : isRelatedToSelected(r - 1, c - 1)
                      ? 'hover:bg-[color:var(--sudoku-selected)]'
                      : 'hover:bg-[color:var(--sudoku-related)]',
                  conflictSet.has(`${r - 1},${c - 1}`) ? 'underline decoration-2 decoration-base-content' : '',
                  wrongSet.has(`${r - 1},${c - 1}`) ? 'text-red-600' : '',
                ]"
                @click="selectCell(r - 1, c - 1)"
              >
                {{ board?.[r - 1]?.[c - 1] === 0 ? '' : board?.[r - 1]?.[c - 1] }}
              </button>
            </div>
          </div>

          <div class="mt-4 grid w-full grid-cols-9 gap-2">
            <button
              v-for="n in 9"
              :key="n"
              type="button"
              class="btn btn-ghost aspect-square w-full border border-base-content font-mono text-lg font-extrabold shadow-none"
              @click="pressDigit(n)"
              :disabled="isLocked"
            >
              {{ n }}
            </button>
          </div>

          <div class="mt-3 grid w-full grid-cols-3 gap-2">
            <button
              type="button"
              class="btn btn-ghost h-12 border border-base-content px-4 text-sm font-extrabold shadow-none"
              @click="undo"
              :disabled="isLocked || history.length === 0"
            >
              <Icon icon="tabler:arrow-back-up" class="h-4 w-4" />
              {{ t(ui.lang, 'undo') }}
            </button>

            <button
              type="button"
              class="btn btn-ghost h-12 border border-base-content px-4 text-sm font-extrabold shadow-none"
              @click="hint"
              :disabled="!selected || isLocked"
            >
              <Icon icon="tabler:bulb" class="h-4 w-4" />
              {{ t(ui.lang, 'hint') }}
            </button>

            <button
              type="button"
              class="btn btn-ghost h-12 border border-base-content px-4 text-sm font-extrabold shadow-none"
              @click="clearCell"
              :disabled="!selected || isLocked"
            >
              <Icon icon="tabler:eraser" class="h-4 w-4" />
              {{ t(ui.lang, 'clear') }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

import { computed, ref, shallowRef } from 'vue'
import type { Board, Difficulty, Digit } from '../sudoku'
import type { CellPosition, SaveState } from '../types'
import {
  cloneBoard,
  findConflicts,
  generatePuzzle,
  isSolved,
  setCell,
} from '../sudoku'
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from '../composables/useStorage'

// ============ State ============

const difficulty = ref<Difficulty>('easy')
const puzzle = shallowRef<Board | null>(null)
const solution = shallowRef<Board | null>(null)
const given = shallowRef<boolean[][] | null>(null)
const board = shallowRef<Board | null>(null)

const selected = ref<CellPosition | null>(null)
const selectedDigit = ref<Exclude<Digit, 0> | null>(null)
const elapsedSeconds = ref(0)
const hintsUsed = ref(0)
const errorsCount = ref(0)
const maxErrors = ref(3)
const lastSavedAt = ref<number | null>(null)

const history = shallowRef<Board[]>([])

// ============ Computed ============

const isReady = computed(() =>
  Boolean(puzzle.value && solution.value && given.value && board.value)
)

const isLocked = computed(() => errorsCount.value >= maxErrors.value)

const isCompleted = computed(() => {
  if (!board.value) return false
  return isSolved(board.value)
})

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

// ============ Actions ============

function newGame(nextDifficulty: Difficulty): void {
  const g = generatePuzzle(nextDifficulty)
  difficulty.value = nextDifficulty
  puzzle.value = g.puzzle
  solution.value = g.solution
  given.value = g.given
  board.value = g.puzzle.map((r) => r.slice() as Digit[])
  selected.value = null
  selectedDigit.value = null
  elapsedSeconds.value = 0
  hintsUsed.value = 0
  errorsCount.value = 0
  history.value = []
  lastSavedAt.value = null
}

function selectCell(row: number, col: number): void {
  if (!board.value || !given.value) return
  selected.value = { row, col }

  const v = board.value[row]?.[col] ?? 0
  if (v !== 0) selectedDigit.value = v as Exclude<Digit, 0>
}

function inputDigit(value: number): boolean {
  if (isLocked.value) return false
  if (!board.value || !given.value || !selected.value || !solution.value) return false

  const { row, col } = selected.value
  if (given.value[row]![col]!) return false

  if (value >= 1 && value <= 9) {
    selectedDigit.value = value as Exclude<Digit, 0>
  }

  const prev = board.value[row]![col]!
  if (prev === value) return false

  // Once a digit is filled, it can't be replaced directly
  if (prev !== 0 && value !== 0) return false

  history.value = [...history.value, cloneBoard(board.value)]
  board.value = setCell(board.value, row, col, value)

  const correct = solution.value[row]?.[col]
  if (typeof correct === 'number' && value !== 0 && value !== correct) {
    errorsCount.value += 1
  }

  return true
}

function clearCell(): boolean {
  return inputDigit(0)
}

function hint(): boolean {
  if (isLocked.value) return false
  if (!board.value || !solution.value || !given.value || !selected.value) return false

  const { row, col } = selected.value
  if (given.value[row]![col]!) return false
  if (board.value[row]![col]! !== 0) return false

  const correct = solution.value[row]![col]!
  history.value = [...history.value, cloneBoard(board.value)]
  board.value = setCell(board.value, row, col, correct)
  selectedDigit.value = correct as Exclude<Digit, 0>
  hintsUsed.value += 1

  return true
}

function undo(): boolean {
  if (isLocked.value) return false
  if (!board.value || history.value.length === 0) return false

  const newHistory = [...history.value]
  const prevBoard = newHistory.pop()
  if (!prevBoard) return false

  history.value = newHistory
  board.value = prevBoard

  if (selected.value) {
    const v = board.value[selected.value.row]?.[selected.value.col] ?? 0
    if (v !== 0) selectedDigit.value = v as Exclude<Digit, 0>
  }

  return true
}

function setMaxErrors(value: number): void {
  const int = Math.floor(value)
  maxErrors.value = Math.min(99, Math.max(1, int))
}

function setElapsedSeconds(seconds: number): void {
  elapsedSeconds.value = seconds
}

function incrementTime(): void {
  elapsedSeconds.value += 1
}

// ============ Persistence ============

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

  setStorageItem(STORAGE_KEYS.SAVE, state)
  lastSavedAt.value = Date.now()
}

function loadSave(): SaveState | null {
  const saved = getStorageItem<SaveState | null>(STORAGE_KEYS.SAVE, null)
  if (saved && saved.version === 1) return saved
  return null
}

function continueSavedGame(): boolean {
  const saved = loadSave()
  if (!saved) return false

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
  selectedDigit.value = null
  history.value = []

  return true
}

function clearSave(): void {
  removeStorageItem(STORAGE_KEYS.SAVE)
}

function hasSave(): boolean {
  return loadSave() !== null
}

// ============ Helpers ============

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

function isSameDigitCell(row: number, col: number): boolean {
  if (!selectedDigit.value || !board.value) return false
  return board.value[row]?.[col] === selectedDigit.value
}

function getCellValue(row: number, col: number): Digit {
  return board.value?.[row]?.[col] ?? 0
}

function isGivenCell(row: number, col: number): boolean {
  return given.value?.[row]?.[col] ?? false
}

// ============ Export ============

export function useGameStore() {
  return {
    // State
    difficulty,
    puzzle,
    solution,
    given,
    board,
    selected,
    selectedDigit,
    elapsedSeconds,
    hintsUsed,
    errorsCount,
    maxErrors,
    lastSavedAt,
    history,

    // Computed
    isReady,
    isLocked,
    isCompleted,
    conflicts,
    conflictSet,
    wrongSet,

    // Actions
    newGame,
    selectCell,
    inputDigit,
    clearCell,
    hint,
    undo,
    setMaxErrors,
    setElapsedSeconds,
    incrementTime,

    // Persistence
    persistSave,
    loadSave,
    continueSavedGame,
    clearSave,
    hasSave,

    // Helpers
    isSelectedCell,
    isSameRowOrCol,
    isSameBox,
    isRelatedToSelected,
    isSameDigitCell,
    getCellValue,
    isGivenCell,
  }
}

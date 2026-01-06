import { computed, ref, shallowRef } from 'vue'
import type { Board, Difficulty, Digit } from '../sudoku'
import type { CellPosition, SaveState, NotesGrid, SerializedNotes } from '../types'
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

// Notes/Marks state
const notes = shallowRef<NotesGrid | null>(null)
const isNotesMode = ref(false)

// Animation tracking
const lastFilledCell = ref<CellPosition | null>(null)
const lastErrorCell = ref<CellPosition | null>(null)

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

/** Count how many times each digit (1-9) appears on the board */
const digitCounts = computed(() => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
  if (!board.value) return counts
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const v = board.value[row]![col]!
      if (v >= 1 && v <= 9) {
        const count = counts[v]
        if (typeof count === 'number') {
          counts[v] = count + 1
        }
      }
    }
  }
  return counts
})

/** Get remaining count for a digit (9 - current count) */
const digitRemaining = computed(() => {
  const remaining: Record<number, number> = {}
  for (let d = 1; d <= 9; d++) {
    remaining[d] = 9 - (digitCounts.value[d] ?? 0)
  }
  return remaining
})

/** Count total empty cells remaining */
const emptyCellsCount = computed(() => {
  if (!board.value) return 81
  let count = 0
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board.value[row]![col]! === 0) {
        count++
      }
    }
  }
  return count
})

/** Progress percentage (0-100) */
const progressPercent = computed(() => {
  if (!puzzle.value) return 0
  // Count initial empty cells from puzzle
  let initialEmpty = 0
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle.value[row]![col]! === 0) {
        initialEmpty++
      }
    }
  }
  if (initialEmpty === 0) return 100
  const filled = initialEmpty - emptyCellsCount.value
  return Math.round((filled / initialEmpty) * 100)
})

// ============ Actions ============

/** Create empty notes grid */
function createEmptyNotes(): NotesGrid {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set<Exclude<Digit, 0>>())
  )
}

/** Clone notes grid */
function cloneNotes(n: NotesGrid): NotesGrid {
  return n.map(row => row.map(cell => new Set(cell)))
}

/** Serialize notes for storage */
function serializeNotes(n: NotesGrid): SerializedNotes {
  return n.map(row => row.map(cell => Array.from(cell)))
}

/** Deserialize notes from storage */
function deserializeNotes(s: SerializedNotes): NotesGrid {
  return s.map(row => row.map(cell => new Set(cell as Exclude<Digit, 0>[])))
}

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
  notes.value = createEmptyNotes()
  isNotesMode.value = false
}

function selectCell(row: number, col: number): void {
  if (!board.value || !given.value) return
  selected.value = { row, col }

  const v = board.value[row]?.[col] ?? 0
  if (v !== 0) selectedDigit.value = v as Exclude<Digit, 0>
}

/** Move selection in a direction */
function moveSelection(direction: 'up' | 'down' | 'left' | 'right'): void {
  if (!board.value) return

  // If no cell selected, start from center
  if (!selected.value) {
    selectCell(4, 4)
    return
  }

  let { row, col } = selected.value

  switch (direction) {
    case 'up':
      row = row > 0 ? row - 1 : 8
      break
    case 'down':
      row = row < 8 ? row + 1 : 0
      break
    case 'left':
      col = col > 0 ? col - 1 : 8
      break
    case 'right':
      col = col < 8 ? col + 1 : 0
      break
  }

  selectCell(row, col)
}

function inputDigit(value: number): boolean {
  if (isLocked.value) return false
  if (!board.value || !given.value || !selected.value || !solution.value) return false

  const { row, col } = selected.value
  if (given.value[row]![col]!) return false

  // Notes mode: toggle note instead of filling digit
  if (isNotesMode.value && value >= 1 && value <= 9) {
    return toggleNote(row, col, value as Exclude<Digit, 0>)
  }

  if (value >= 1 && value <= 9) {
    selectedDigit.value = value as Exclude<Digit, 0>
  }

  const prev = board.value[row]![col]!
  if (prev === value) return false

  // Once a digit is filled, it can't be replaced directly
  if (prev !== 0 && value !== 0) return false

  history.value = [...history.value, cloneBoard(board.value)]
  board.value = setCell(board.value, row, col, value)

  // Clear notes for this cell and remove this digit from related cells' notes
  if (value !== 0 && notes.value) {
    const newNotes = cloneNotes(notes.value)
    // Clear this cell's notes
    newNotes[row]![col]!.clear()
    
    // If the digit is correct, remove it from notes of related cells (same row, col, box)
    const digit = value as Exclude<Digit, 0>
    const isCorrect = solution.value?.[row]?.[col] === value
    if (isCorrect) {
      // Remove from same row
      for (let c = 0; c < 9; c++) {
        if (c !== col) newNotes[row]![c]!.delete(digit)
      }
      // Remove from same column
      for (let r = 0; r < 9; r++) {
        if (r !== row) newNotes[r]![col]!.delete(digit)
      }
      // Remove from same 3x3 box
      const boxRowStart = Math.floor(row / 3) * 3
      const boxColStart = Math.floor(col / 3) * 3
      for (let r = boxRowStart; r < boxRowStart + 3; r++) {
        for (let c = boxColStart; c < boxColStart + 3; c++) {
          if (r !== row || c !== col) {
            newNotes[r]![c]!.delete(digit)
          }
        }
      }
    }
    
    notes.value = newNotes
  }

  const correct = solution.value[row]?.[col]
  if (typeof correct === 'number' && value !== 0 && value !== correct) {
    errorsCount.value += 1
    // Trigger error animation
    lastErrorCell.value = { row, col }
    setTimeout(() => {
      if (lastErrorCell.value?.row === row && lastErrorCell.value?.col === col) {
        lastErrorCell.value = null
      }
    }, 300)
  } else if (value !== 0) {
    // Trigger fill animation for correct digits
    lastFilledCell.value = { row, col }
    setTimeout(() => {
      if (lastFilledCell.value?.row === row && lastFilledCell.value?.col === col) {
        lastFilledCell.value = null
      }
    }, 200)
  }

  return true
}

function clearCell(): boolean {
  if (!selected.value || !board.value || !given.value) return false
  const { row, col } = selected.value
  if (given.value[row]![col]!) return false

  // Clear notes for this cell
  if (notes.value && notes.value[row]![col]!.size > 0) {
    const newNotes = cloneNotes(notes.value)
    newNotes[row]![col]!.clear()
    notes.value = newNotes
  }

  // Clear digit
  if (board.value[row]![col]! !== 0) {
    return inputDigit(0)
  }

  return true
}

/** Toggle a note (candidate mark) for a cell */
function toggleNote(row: number, col: number, digit: Exclude<Digit, 0>): boolean {
  if (!notes.value || !board.value || !given.value) return false
  if (given.value[row]![col]!) return false
  if (board.value[row]![col]! !== 0) return false // Can't add notes to filled cells

  const newNotes = cloneNotes(notes.value)
  const cellNotes = newNotes[row]![col]!

  if (cellNotes.has(digit)) {
    cellNotes.delete(digit)
  } else {
    cellNotes.add(digit)
  }

  notes.value = newNotes
  return true
}

/** Toggle notes mode on/off */
function toggleNotesMode(): void {
  isNotesMode.value = !isNotesMode.value
}

/** Get notes for a cell */
function getCellNotes(row: number, col: number): Set<Exclude<Digit, 0>> {
  return notes.value?.[row]?.[col] ?? new Set()
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
    notes: notes.value ? serializeNotes(notes.value) : undefined,
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
  notes.value = saved.notes ? deserializeNotes(saved.notes) : createEmptyNotes()
  isNotesMode.value = false

  return true
}

function clearSave(): void {
  removeStorageItem(STORAGE_KEYS.SAVE)
}

function hasSave(): boolean {
  return loadSave() !== null
}

function getSaveInfo(): { difficulty: Difficulty; elapsedSeconds: number } | null {
  const saved = loadSave()
  if (!saved) return null
  return {
    difficulty: saved.difficulty,
    elapsedSeconds: saved.elapsedSeconds,
  }
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
    notes,
    isNotesMode,
    lastFilledCell,
    lastErrorCell,

    // Computed
    isReady,
    isLocked,
    isCompleted,
    conflicts,
    conflictSet,
    wrongSet,
    digitCounts,
    digitRemaining,
    emptyCellsCount,
    progressPercent,

    // Actions
    newGame,
    selectCell,
    moveSelection,
    inputDigit,
    clearCell,
    hint,
    undo,
    setMaxErrors,
    setElapsedSeconds,
    incrementTime,
    toggleNote,
    toggleNotesMode,

    // Persistence
    persistSave,
    loadSave,
    continueSavedGame,
    clearSave,
    hasSave,
    getSaveInfo,

    // Helpers
    isSelectedCell,
    isSameRowOrCol,
    isSameBox,
    isRelatedToSelected,
    isSameDigitCell,
    getCellValue,
    isGivenCell,
    getCellNotes,
  }
}

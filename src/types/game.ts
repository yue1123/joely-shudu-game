import type { Board, Difficulty, Digit } from '../sudoku'

/** Cell notes/marks - which digits are marked as candidates */
export type CellNotes = Set<Exclude<Digit, 0>>

/** Notes grid - 9x9 array of CellNotes */
export type NotesGrid = CellNotes[][]

/** Serializable notes format for storage */
export type SerializedNotes = number[][][]

/** Persisted game save state */
export type SaveState = {
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
  notes?: SerializedNotes
}

/** Single leaderboard entry */
export type LeaderboardEntry = {
  seconds: number
  at: number
  hintsUsed: number
}

/** Full leaderboard state */
export type LeaderboardState = {
  version: 1
  easy: LeaderboardEntry[]
  medium: LeaderboardEntry[]
  hard: LeaderboardEntry[]
}

/** Cell position in the sudoku board */
export type CellPosition = {
  row: number
  col: number
}

import type { Board, Difficulty } from '../sudoku'

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

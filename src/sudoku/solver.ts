import type { Board, Digit } from './types'
import { BOX_SIZE, BOARD_SIZE, cloneBoard, isValidDigit } from './utils'

export type Conflict = {
  row: number
  col: number
  value: Exclude<Digit, 0>
}

function isSafe(board: Board, row: number, col: number, value: Exclude<Digit, 0>): boolean {
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (i !== col && board[row]![i]! === value) return false
    if (i !== row && board[i]![col]! === value) return false
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if ((r !== row || c !== col) && board[r]![c]! === value) return false
    }
  }
  return true
}

export function findConflicts(board: Board): Conflict[] {
  const conflicts: Conflict[] = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const v = board[row]![col]!
      if (v === 0) continue
      const value = v as Exclude<Digit, 0>
      if (!isSafe(board, row, col, value)) {
        conflicts.push({ row, col, value })
      }
    }
  }
  return conflicts
}

export function isSolved(board: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const v = board[row]![col]!
      if (v === 0) return false
      if (!isSafe(board, row, col, v as Exclude<Digit, 0>)) return false
    }
  }
  return true
}

function candidates(board: Board, row: number, col: number): Exclude<Digit, 0>[] {
  const result: Exclude<Digit, 0>[] = []
  for (let v = 1; v <= 9; v++) {
    if (isSafe(board, row, col, v as Exclude<Digit, 0>)) result.push(v as Exclude<Digit, 0>)
  }
  return result
}

function pickBestCell(board: Board): { row: number; col: number; options: Exclude<Digit, 0>[] } | null {
  let best: { row: number; col: number; options: Exclude<Digit, 0>[] } | null = null
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row]![col]! !== 0) continue
      const opts = candidates(board, row, col)
      if (opts.length === 0) return { row, col, options: [] }
      if (best === null || opts.length < best.options.length) {
        best = { row, col, options: opts }
        if (opts.length === 1) return best
      }
    }
  }
  return best
}

export function solve(board: Board, rng?: () => number): Board | null {
  const working = cloneBoard(board)

  const step = (): boolean => {
    const best = pickBestCell(working)
    if (best === null) return true
    const { row, col } = best
    if (best.options.length === 0) return false

    const opts = best.options.slice()
    if (rng) {
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        const tmp = opts[i]!
        opts[i] = opts[j]!
        opts[j] = tmp
      }
    }

    for (const v of opts) {
      working[row]![col]! = v
      if (step()) return true
      working[row]![col]! = 0
    }
    return false
  }

  return step() ? working : null
}

export function countSolutions(board: Board, limit = 2): number {
  const working = cloneBoard(board)
  let count = 0

  const step = (): void => {
    if (count >= limit) return
    const best = pickBestCell(working)
    if (best === null) {
      count++
      return
    }
    const { row, col, options } = best
    if (options.length === 0) return

    for (const v of options) {
      working[row]![col]! = v
      step()
      working[row]![col]! = 0
      if (count >= limit) return
    }
  }

  step()
  return count
}

export function setCell(board: Board, row: number, col: number, value: number): Board {
  const next = cloneBoard(board)
  if (value === 0) {
    next[row]![col]! = 0
    return next
  }
  if (!isValidDigit(value)) return next
  next[row]![col]! = value as Exclude<Digit, 0>
  return next
}

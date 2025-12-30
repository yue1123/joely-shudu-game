import type { Board, Digit } from './types'

export const BOARD_SIZE = 9
export const BOX_SIZE = 3

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => 0 as Digit))
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice() as Digit[])
}

export function isValidDigit(value: number): value is Exclude<Digit, 0> {
  return Number.isInteger(value) && value >= 1 && value <= 9
}

export function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
}

export function boardToString(board: Board): string {
  return board.map((r) => r.join('')).join('\n')
}

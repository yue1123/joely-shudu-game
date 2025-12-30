import type { Board, Difficulty, GeneratedPuzzle, Digit } from './types'
import { cloneBoard, createEmptyBoard, shuffleInPlace } from './utils'
import { countSolutions, solve } from './solver'

type DifficultyConfig = {
  clues: { min: number; max: number }
}

const DIFFICULTY: Record<Difficulty, DifficultyConfig> = {
  easy: { clues: { min: 40, max: 46 } },
  medium: { clues: { min: 32, max: 38 } },
  hard: { clues: { min: 26, max: 31 } },
}

function makeRng(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function randomSeed(): number {
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0
}

function fillDiagonalBoxes(board: Board, rng: () => number): void {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
  for (let box = 0; box < 3; box++) {
    const values = digits.slice() as unknown as number[]
    shuffleInPlace(values, rng)
    const start = box * 3
    let i = 0
    for (let r = start; r < start + 3; r++) {
      for (let c = start; c < start + 3; c++) {
        board[r]![c]! = values[i]! as Digit
        i++
      }
    }
  }
}

function allCellPositions(): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = []
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      cells.push({ row, col })
    }
  }
  return cells
}

export function generatePuzzle(difficulty: Difficulty): GeneratedPuzzle {
  const seed = randomSeed()
  const rng = makeRng(seed)

  const base = createEmptyBoard()
  fillDiagonalBoxes(base, rng)
  const solved = solve(base, rng)
  if (!solved) {
    const fallback = solve(createEmptyBoard(), rng)
    if (!fallback) throw new Error('Failed to generate a solved sudoku grid')
    return generateFromSolution(fallback, difficulty, rng)
  }

  return generateFromSolution(solved, difficulty, rng)
}

function generateFromSolution(solution: Board, difficulty: Difficulty, rng: () => number): GeneratedPuzzle {
  const { clues } = DIFFICULTY[difficulty]
  const targetClues = Math.floor(clues.min + rng() * (clues.max - clues.min + 1))

  let puzzle = cloneBoard(solution)
  const positions = allCellPositions()
  shuffleInPlace(positions, rng)

  let removed = 0
  const maxToRemove = 81 - targetClues

  for (const { row, col } of positions) {
    if (removed >= maxToRemove) break
    const backup = puzzle[row]![col]!
    if (backup === 0) continue

    puzzle[row]![col]! = 0
    const solutions = countSolutions(puzzle, 2)
    if (solutions !== 1) {
      puzzle[row]![col]! = backup
      continue
    }
    removed++
  }

  const given = puzzle.map((r) => r.map((v) => v !== 0))
  return { puzzle, solution, given }
}

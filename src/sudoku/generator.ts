import type { Board, Difficulty, GeneratedPuzzle, Digit } from './types'
import { cloneBoard, createEmptyBoard, shuffleInPlace } from './utils'
import { countSolutions, solve } from './solver'

type DifficultyConfig = {
  clues: { min: number; max: number }
  /** Minimum empty cells per 3x3 box to ensure balanced distribution */
  minEmptyPerBox: number
}

const DIFFICULTY: Record<Difficulty, DifficultyConfig> = {
  easy: { clues: { min: 40, max: 46 }, minEmptyPerBox: 2 },
  medium: { clues: { min: 32, max: 38 }, minEmptyPerBox: 4 },
  hard: { clues: { min: 26, max: 31 }, minEmptyPerBox: 5 },
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

/** Get box index (0-8) for a cell */
function getBoxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3)
}

/** Get all cell positions grouped by box */
function getCellsByBox(): Array<Array<{ row: number; col: number }>> {
  const boxes: Array<Array<{ row: number; col: number }>> = Array.from({ length: 9 }, () => [])
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      boxes[getBoxIndex(row, col)]!.push({ row, col })
    }
  }
  return boxes
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
  const { clues, minEmptyPerBox } = DIFFICULTY[difficulty]
  const targetClues = Math.floor(clues.min + rng() * (clues.max - clues.min + 1))
  const maxToRemove = 81 - targetClues

  const puzzle = cloneBoard(solution)
  const cellsByBox = getCellsByBox()
  
  // Shuffle cells within each box
  for (const box of cellsByBox) {
    shuffleInPlace(box, rng)
  }

  // Track empty count per box
  const emptyPerBox = new Array(9).fill(0)
  let totalRemoved = 0

  // Phase 1: Ensure minimum empty cells per box for balanced distribution
  for (let boxIdx = 0; boxIdx < 9; boxIdx++) {
    const boxCells = cellsByBox[boxIdx]!
    let boxRemoved = 0
    
    for (const { row, col } of boxCells) {
      if (boxRemoved >= minEmptyPerBox) break
      if (totalRemoved >= maxToRemove) break
      
      const backup = puzzle[row]![col]!
      if (backup === 0) continue

      puzzle[row]![col]! = 0
      const solutions = countSolutions(puzzle, 2)
      if (solutions !== 1) {
        puzzle[row]![col]! = backup
        continue
      }
      
      boxRemoved++
      totalRemoved++
      emptyPerBox[boxIdx] = boxRemoved
    }
  }

  // Phase 2: Remove remaining cells randomly while maintaining unique solution
  if (totalRemoved < maxToRemove) {
    // Collect all remaining filled cells
    const remainingCells: Array<{ row: number; col: number }> = []
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (puzzle[row]![col]! !== 0) {
          remainingCells.push({ row, col })
        }
      }
    }
    shuffleInPlace(remainingCells, rng)

    for (const { row, col } of remainingCells) {
      if (totalRemoved >= maxToRemove) break
      
      const backup = puzzle[row]![col]!
      if (backup === 0) continue

      puzzle[row]![col]! = 0
      const solutions = countSolutions(puzzle, 2)
      if (solutions !== 1) {
        puzzle[row]![col]! = backup
        continue
      }
      
      totalRemoved++
    }
  }

  // Final verification: ensure puzzle has exactly one solution
  const finalCheck = countSolutions(puzzle, 2)
  if (finalCheck !== 1) {
    console.warn('Generated puzzle verification failed, regenerating...')
    // This should never happen, but fallback to regenerate
    return generateFromSolution(solution, difficulty, rng)
  }

  const given = puzzle.map((r) => r.map((v) => v !== 0))
  return { puzzle, solution, given }
}

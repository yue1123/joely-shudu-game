<script setup lang="ts">
import { useGameStore } from '../../stores'

const game = useGameStore()

const frameClass = 'bg-base-100 text-base-content border-base-content'
const cellBorder = 'border-base-content/40'
const cellBorderStrong = 'border-base-content'

function getCellClasses(row: number, col: number): string[] {
  const classes: string[] = ['text-base-content']

  // Border classes
  if (row < 8) classes.push('border-b', cellBorder)
  if (col < 8) classes.push('border-r', cellBorder)
  if (col === 2 || col === 5) classes.push('border-r-[2px]', cellBorderStrong)
  if (row === 2 || row === 5) classes.push('border-b-[2px]', cellBorderStrong)

  // Highlight classes
  if (game.isRelatedToSelected(row, col)) {
    classes.push('bg-[color:var(--sudoku-related)]')
  }
  if (game.isSameDigitCell(row, col) && !game.isSelectedCell(row, col)) {
    classes.push('bg-[color:var(--sudoku-selected)]')
  }
  if (game.isSelectedCell(row, col)) {
    classes.push('bg-[color:var(--sudoku-selected)]')
  }

  // Hover classes
  if (game.isSelectedCell(row, col) || game.isSameDigitCell(row, col)) {
    classes.push('hover:bg-[color:var(--sudoku-selected)]')
  } else if (game.isRelatedToSelected(row, col)) {
    classes.push('hover:bg-[color:var(--sudoku-selected)]')
  } else {
    classes.push('hover:bg-[color:var(--sudoku-related)]')
  }

  // Conflict / Wrong classes
  if (game.conflictSet.value.has(`${row},${col}`)) {
    classes.push('underline decoration-2 decoration-base-content')
  }
  if (game.wrongSet.value.has(`${row},${col}`)) {
    classes.push('text-red-600')
  }

  return classes
}

function handleCellClick(row: number, col: number): void {
  game.selectCell(row, col)
}
</script>

<template>
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
        :class="getCellClasses(r - 1, c - 1)"
        @click="handleCellClick(r - 1, c - 1)"
      >
        {{ game.getCellValue(r - 1, c - 1) === 0 ? '' : game.getCellValue(r - 1, c - 1) }}
      </button>
    </div>
  </div>
</template>

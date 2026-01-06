<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useGameStore } from '../../stores'

defineProps<{
  isPaused?: boolean
}>()

const emit = defineEmits<{
  resume: []
}>()

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

/** Check if a cell has notes to display */
function hasNotes(row: number, col: number): boolean {
  const cellValue = game.getCellValue(row, col)
  if (cellValue !== 0) return false
  return game.getCellNotes(row, col).size > 0
}

/** Get notes array for display (sorted 1-9) */
function getNotesArray(row: number, col: number): number[] {
  return Array.from(game.getCellNotes(row, col)).sort((a, b) => a - b)
}
</script>

<template>
  <div
    class="relative mx-auto grid aspect-square w-full max-w-xl grid-rows-9 overflow-hidden border-2"
    :class="frameClass"
  >
    <!-- Game grid -->
    <div v-for="r in 9" :key="r" class="grid grid-cols-9">
      <button
        v-for="c in 9"
        :key="c"
        type="button"
        class="relative grid place-items-center font-mono text-lg font-extrabold outline-none transition-none group-hover:transition-[background-color] group-hover:duration-200"
        :class="getCellClasses(r - 1, c - 1)"
        :disabled="isPaused"
        @click="handleCellClick(r - 1, c - 1)"
      >
        <!-- Content hidden when paused -->
        <template v-if="!isPaused">
          <!-- Main digit -->
          <span v-if="game.getCellValue(r - 1, c - 1) !== 0">
            {{ game.getCellValue(r - 1, c - 1) }}
          </span>
          <!-- Notes grid (3x3 mini grid) -->
          <div
            v-else-if="hasNotes(r - 1, c - 1)"
            class="grid h-full w-full grid-cols-3 grid-rows-3 p-0.5"
          >
            <span
              v-for="n in 9"
              :key="n"
              class="flex items-center justify-center text-[0.5rem] leading-none opacity-60 sm:text-[0.6rem]"
            >
              {{ getNotesArray(r - 1, c - 1).includes(n) ? n : '' }}
            </span>
          </div>
        </template>
      </button>
    </div>

    <!-- Pause overlay (transparent, only for click to resume) -->
    <div
      v-if="isPaused"
      class="absolute inset-0 flex cursor-pointer items-center justify-center"
      @click="emit('resume')"
    >
      <Icon icon="tabler:player-play" class="h-24 w-24 opacity-60 hover:opacity-100" />
    </div>
  </div>
</template>

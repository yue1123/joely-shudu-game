<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from '../../composables'
import type { Difficulty } from '../../sudoku'
import { useGameStore } from '../../stores'

const props = defineProps<{
  elapsedSeconds: number
  hintsUsed: number
  errorsCount: number
  maxErrors: number
  difficulty: Difficulty
  showSaved?: boolean
  isPaused?: boolean
}>()

const emit = defineEmits<{
  togglePause: []
}>()

const { translations } = useI18n()
const game = useGameStore()

const timeText = computed(() => {
  const m = Math.floor(props.elapsedSeconds / 60)
  const s = props.elapsedSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const savedText = computed(() => (props.showSaved ? translations.value.saved : ''))
</script>

<template>
  <div class="mx-auto flex flex-col items-center gap-2">
    <!-- Progress bar -->
    <div class="flex w-full max-w-md items-center gap-2">
      <div class="h-1.5 flex-1 overflow-hidden bg-base-300">
        <div
          class="h-full bg-base-content transition-all duration-300"
          :style="{ width: `${game.progressPercent.value}%` }"
        />
      </div>
      <span class="min-w-[3rem] text-right text-xs font-mono tabular-nums opacity-70">
        {{ game.emptyCellsCount.value }}
      </span>
    </div>

    <!-- Stats -->
    <div class="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
      <span class="flex items-center gap-1 border border-base-content px-3 py-1">
        {{ translations.timer }}: <span class="font-mono tabular-nums">{{ timeText }}</span>
        <button
          type="button"
          class="ml-1 inline-flex items-center justify-center opacity-70 hover:opacity-100"
          @click="emit('togglePause')"
          :aria-label="isPaused ? 'Resume' : 'Pause'"
        >
          <Icon
            :icon="isPaused ? 'tabler:player-play' : 'tabler:player-pause'"
            class="h-4 w-4"
          />
        </button>
      </span>
      <span class="border border-base-content px-3 py-1">
        {{ translations.hintsUsed }}: <span class="font-mono tabular-nums">{{ hintsUsed }}</span>
      </span>
      <span class="border border-base-content px-3 py-1">
        {{ translations.mistakes }}:
        <span class="font-mono tabular-nums">{{ errorsCount }}/{{ maxErrors }}</span>
      </span>
      <span class="border border-base-content px-3 py-1">
        {{ translations.difficulty }}: <span class="font-mono">{{ difficulty }}</span>
      </span>
      <span v-if="savedText" class="border border-base-content px-3 py-1">
        {{ savedText }}
      </span>
    </div>
  </div>
</template>

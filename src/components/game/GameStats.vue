<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../composables'
import type { Difficulty } from '../../sudoku'

const props = defineProps<{
  elapsedSeconds: number
  hintsUsed: number
  errorsCount: number
  maxErrors: number
  difficulty: Difficulty
  showSaved?: boolean
}>()

const { translations } = useI18n()

const timeText = computed(() => {
  const m = Math.floor(props.elapsedSeconds / 60)
  const s = props.elapsedSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const savedText = computed(() => (props.showSaved ? translations.value.saved : ''))
</script>

<template>
  <div class="mx-auto flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
    <span class="border border-base-content px-3 py-1">
      {{ translations.timer }}: <span class="font-mono tabular-nums">{{ timeText }}</span>
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
</template>

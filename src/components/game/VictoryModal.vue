<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from '../../composables'
import type { Difficulty } from '../../sudoku'

const props = defineProps<{
  show: boolean
  difficulty: Difficulty
  elapsedSeconds: number
  hintsUsed: number
  errorsCount: number
  bestTime: number | null
}>()

const emit = defineEmits<{
  playAgain: []
  goHome: []
  close: []
}>()

const { translations } = useI18n()

const isNewRecord = computed(() => {
  if (!props.bestTime) return true
  return props.elapsedSeconds <= props.bestTime
})

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box border border-base-content bg-base-100 text-base-content max-w-sm text-center">
      <!-- Close button -->
      <button
        type="button"
        class="btn btn-ghost btn-sm btn-circle absolute right-2 top-2"
        @click="emit('close')"
      >
        <Icon icon="tabler:x" class="h-4 w-4" />
      </button>

      <!-- Victory icon -->
      <div class="mb-4 flex justify-center">
        <Icon icon="tabler:trophy" class="h-16 w-16 text-warning" />
      </div>

      <!-- Title -->
      <h3 class="text-2xl font-bold mb-2">{{ translations.victory }}</h3>

      <!-- New record badge -->
      <div v-if="isNewRecord" class="badge badge-warning mb-4">
        {{ translations.newRecord }}
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 my-6">
        <div class="border border-base-content p-3">
          <div class="text-xs opacity-60 uppercase">{{ translations.yourTime }}</div>
          <div class="text-2xl font-mono font-bold">{{ formatTime(elapsedSeconds) }}</div>
        </div>
        <div class="border border-base-content p-3">
          <div class="text-xs opacity-60 uppercase">{{ translations.bestTime }}</div>
          <div class="text-2xl font-mono font-bold">
            {{ bestTime ? formatTime(bestTime) : '--:--' }}
          </div>
        </div>
        <div class="border border-base-content p-3">
          <div class="text-xs opacity-60 uppercase">{{ translations.hintsUsed }}</div>
          <div class="text-2xl font-mono font-bold">{{ hintsUsed }}</div>
        </div>
        <div class="border border-base-content p-3">
          <div class="text-xs opacity-60 uppercase">{{ translations.mistakes }}</div>
          <div class="text-2xl font-mono font-bold">{{ errorsCount }}</div>
        </div>
      </div>

      <!-- Difficulty -->
      <div class="text-sm opacity-60 mb-4">
        {{ translations.difficulty }}: {{ translations[difficulty] }}
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-center">
        <button
          type="button"
          class="btn btn-ghost border border-base-content"
          @click="emit('goHome')"
        >
          {{ translations.backToHome }}
        </button>
        <button
          type="button"
          class="btn btn-ghost border border-base-content bg-base-content text-base-100"
          @click="emit('playAgain')"
        >
          {{ translations.playAgain }}
        </button>
      </div>
    </div>

    <!-- Backdrop -->
    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="emit('close')">close</button>
    </form>
  </dialog>
</template>

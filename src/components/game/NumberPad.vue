<script setup lang="ts">
import type { Digit } from '../../sudoku'
import { useGameStore } from '../../stores'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  press: [digit: Exclude<Digit, 0>]
}>()

const game = useGameStore()

function handlePress(n: number): void {
  emit('press', n as Exclude<Digit, 0>)
}

function isDigitComplete(n: number): boolean {
  return game.digitRemaining.value[n] === 0
}

function getRemainingCount(n: number): number {
  return game.digitRemaining.value[n] ?? 0
}
</script>

<template>
  <div class="grid w-full grid-cols-9 gap-2">
    <button
      v-for="n in 9"
      :key="n"
      type="button"
      class="btn btn-ghost flex aspect-square w-full flex-col items-center justify-center border border-base-content p-0 font-mono shadow-none"
      :class="{ 'opacity-30': isDigitComplete(n) }"
      :disabled="disabled || isDigitComplete(n)"
      @click="handlePress(n)"
    >
      <span class="text-lg font-extrabold leading-none">{{ n }}</span>
      <span class="text-[0.6rem] leading-none opacity-50">{{ getRemainingCount(n) }}</span>
    </button>
  </div>
</template>

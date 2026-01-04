<script setup lang="ts">
import type { Digit } from '../../sudoku'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  press: [digit: Exclude<Digit, 0>]
}>()

function handlePress(n: number): void {
  emit('press', n as Exclude<Digit, 0>)
}
</script>

<template>
  <div class="grid w-full grid-cols-9 gap-2">
    <button
      v-for="n in 9"
      :key="n"
      type="button"
      class="btn btn-ghost aspect-square w-full border border-base-content font-mono text-lg font-extrabold shadow-none"
      :disabled="disabled"
      @click="handlePress(n)"
    >
      {{ n }}
    </button>
  </div>
</template>

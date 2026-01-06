<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from '../../composables'

defineProps<{
  canUndo: boolean
  canHint: boolean
  canClear: boolean
  isNotesMode: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  undo: []
  hint: []
  clear: []
  toggleNotes: []
}>()

const { translations } = useI18n()
</script>

<template>
  <div class="grid w-full grid-cols-4 gap-2">
    <button
      type="button"
      class="btn btn-ghost h-12 border border-base-content px-2 text-sm font-extrabold shadow-none"
      :disabled="disabled || !canUndo"
      @click="emit('undo')"
    >
      <Icon icon="tabler:arrow-back-up" class="h-4 w-4" />
      {{ translations.undo }}
    </button>

    <button
      type="button"
      class="btn btn-ghost h-12 border border-base-content px-2 text-sm font-extrabold shadow-none"
      :class="{ 'btn-active bg-base-300': isNotesMode }"
      :disabled="disabled"
      @click="emit('toggleNotes')"
    >
      <Icon icon="tabler:pencil" class="h-4 w-4" />
      {{ translations.notes }}
    </button>

    <button
      type="button"
      class="btn btn-ghost h-12 border border-base-content px-2 text-sm font-extrabold shadow-none"
      :disabled="disabled || !canHint"
      @click="emit('hint')"
    >
      <Icon icon="tabler:bulb" class="h-4 w-4" />
      {{ translations.hint }}
    </button>

    <button
      type="button"
      class="btn btn-ghost h-12 border border-base-content px-2 text-sm font-extrabold shadow-none"
      :disabled="disabled || !canClear"
      @click="emit('clear')"
    >
      <Icon icon="tabler:eraser" class="h-4 w-4" />
      {{ translations.clear }}
    </button>
  </div>
</template>

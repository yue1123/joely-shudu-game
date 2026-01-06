<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from '../composables'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { translations } = useI18n()

const shortcuts = [
  { keys: ['1', '-', '9'], action: 'inputDigit' },
  { keys: ['↑', '↓', '←', '→'], alt: ['W', 'A', 'S', 'D'], action: 'moveSelection' },
  { keys: ['Delete', 'Backspace', '0'], action: 'eraseCell' },
  { keys: ['N'], action: 'toggleNotes' },
  { keys: ['Z'], action: 'undoAction' },
  { keys: ['H'], action: 'hintAction' },
  { keys: ['Space'], action: 'pauseResume' },
] as const
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box border border-base-content bg-base-100 text-base-content max-w-sm">
      <button
        type="button"
        class="btn btn-ghost btn-sm btn-circle absolute right-2 top-2"
        @click="emit('close')"
      >
        <Icon icon="tabler:x" class="h-4 w-4" />
      </button>

      <h3 class="text-lg font-bold mb-4">{{ translations.shortcutsTitle }}</h3>

      <div class="space-y-3">
        <div
          v-for="(shortcut, idx) in shortcuts"
          :key="idx"
          class="flex items-center justify-between gap-2"
        >
          <span class="text-sm">{{ translations[shortcut.action] }}</span>
          <div class="flex items-center gap-1">
            <kbd
              v-for="key in shortcut.keys"
              :key="key"
              class="kbd kbd-sm"
            >{{ key }}</kbd>
            <template v-if="'alt' in shortcut && shortcut.alt">
              <span class="text-xs opacity-50">/</span>
              <kbd
                v-for="key in shortcut.alt"
                :key="key"
                class="kbd kbd-sm"
              >{{ key }}</kbd>
            </template>
          </div>
        </div>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button type="button" @click="emit('close')">close</button>
    </form>
  </dialog>
</template>

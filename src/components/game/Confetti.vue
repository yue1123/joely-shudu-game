<script setup lang="ts">
import { onMounted, ref } from 'vue'

const pieces = ref<Array<{ id: number; left: string; color: string; delay: string }>>([])

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
  '#ffeaa7', '#dfe6e9', '#fd79a8', '#6c5ce7'
]

onMounted(() => {
  const count = 50
  pieces.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: colors[Math.floor(Math.random() * colors.length)]!,
    delay: `${Math.random() * 2}s`,
  }))
})
</script>

<template>
  <div class="confetti-container">
    <div
      v-for="piece in pieces"
      :key="piece.id"
      class="confetti-piece"
      :style="{
        left: piece.left,
        backgroundColor: piece.color,
        animationDelay: piece.delay,
      }"
    />
  </div>
</template>

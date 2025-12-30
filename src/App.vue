<script setup lang="ts">
import { useUiStore } from './stores/uiStore'

useUiStore()
</script>

<template>
  <div class="min-h-screen w-full bg-base-100 text-base-content">
    <RouterView />
  </div>
</template>

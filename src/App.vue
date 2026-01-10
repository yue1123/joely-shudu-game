<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useUiStore } from './stores/uiStore'
import { useSound } from './composables'

useUiStore()
const sound = useSound()

// Global button click sound
function handleGlobalClick(event: MouseEvent): void {
	const target = event.target as HTMLElement
	// Check if clicked element is a button or inside a button
	const button = target.closest('button')
	if (button && !button.disabled) {
		sound.playClick()
	}
}

onMounted(() => {
	document.addEventListener('click', handleGlobalClick, { capture: true })
})

onUnmounted(() => {
	document.removeEventListener('click', handleGlobalClick, { capture: true })
})
</script>

<template>
	<div class="min-h-screen w-full bg-base-100 text-base-content">
		<RouterView />
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'

let animationId: number | null = null

onMounted(() => {
	const totalCount = 100
	const totalFrames = totalCount * 2
	const colors = [
		'#ff6b6b',
		'#4ecdc4',
		'#45b7d1',
		'#96ceb4',
		'#ffeaa7',
		'#dfe6e9',
		'#fd79a8',
		'#6c5ce7'
	] as const

	function randomInRange(min: number, max: number) {
		return Math.random() * (max - min) + min
	}

	let frames = 0
	;(function frame() {
		frames += 1
		if (frames % 2 === 0 && frames < totalFrames) {
			requestAnimationFrame(frame)
			return
		}
		var ticks = Math.max(400, 700 * (frames / totalFrames))

		const index = Math.floor(randomInRange(0, colors.length))

		confetti({
			zIndex: 1000,
			particleCount: 1,
			startVelocity: 0,
			ticks: ticks,
			origin: {
				x: Math.random(),
				y: randomInRange(0, 0.2)
			},
			colors: [colors[index] || colors[0]],
			shapes: ['circle', 'square'],
			gravity: randomInRange(1.2, 1.5),
			scalar: randomInRange(0.7, 1.3),
			drift: randomInRange(-0.6, 0.6)
		})

		if (frames < totalFrames) {
			requestAnimationFrame(frame)
		}
	})()
})

onUnmounted(() => {
	if (animationId !== null) {
		cancelAnimationFrame(animationId)
	}
})
</script>

<template>
	<!-- canvas-confetti creates its own canvas element -->
</template>

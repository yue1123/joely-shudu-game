<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentVisibility, useWindowFocus } from '@vueuse/core'

import TopNav from '../components/TopNav.vue'
import {
	SudokuBoard,
	NumberPad,
	ActionBar,
	GameStats,
	Confetti,
	VictoryModal
} from '../components/game'
import { useGameStore, useLeaderboardStore } from '../stores'
import { useSound } from '../composables'
import type { Difficulty, Digit } from '../sudoku'

const route = useRoute()
const router = useRouter()
const game = useGameStore()
const leaderboard = useLeaderboardStore()
const sound = useSound()

// Pause state
const isPaused = ref(false)
const showConfetti = ref(false)
const showVictoryModal = ref(false)
const victoryStats = ref<{
	difficulty: Difficulty
	elapsedSeconds: number
	hintsUsed: number
	errorsCount: number
	bestTime: number | null
} | null>(null)

// VueUse hooks for visibility detection
const documentVisibility = useDocumentVisibility()
const windowFocus = useWindowFocus()

if (import.meta.env.PROD) {
	// Watch for visibility/focus changes to auto-pause
	watch(documentVisibility, (visibility) => {
		if (
			visibility === 'hidden' &&
			game.isReady.value &&
			!game.isCompleted.value &&
			!game.isLocked.value
		) {
			pauseGame()
		}
	})

	watch(windowFocus, (focused) => {
		if (!focused && game.isReady.value && !game.isCompleted.value && !game.isLocked.value) {
			pauseGame()
		}
	})
}

// Timer management
let timerId: number | null = null
let saveDebounceId: number | null = null

function startTimer(): void {
	stopTimer()
	timerId = window.setInterval(() => {
		if (!isPaused.value) {
			game.incrementTime()
			if (game.elapsedSeconds.value % 5 === 0) {
				persistSaveSoon()
			}
		}
	}, 1000)
}

function stopTimer(): void {
	if (timerId !== null) {
		window.clearInterval(timerId)
		timerId = null
	}
}

// Pause/Resume functions
function pauseGame(): void {
	if (game.isCompleted.value || game.isLocked.value) return
	isPaused.value = true
}

function resumeGame(): void {
	isPaused.value = false
}

function togglePause(): void {
	if (isPaused.value) {
		resumeGame()
	} else {
		pauseGame()
	}
}

// Save debouncing
function persistSaveSoon(): void {
	if (!game.isReady.value) return
	if (saveDebounceId !== null) window.clearTimeout(saveDebounceId)
	saveDebounceId = window.setTimeout(() => {
		saveDebounceId = null
		// Don't save if game is already completed
		if (game.isCompleted.value) return
		game.persistSave()
	}, 400)
}

// Computed
const canUndo = computed(() => game.history.value.length > 0)
const canHint = computed(() => game.selected.value !== null)
const canClear = computed(() => game.selected.value !== null)
const showSaved = computed(() => game.lastSavedAt.value !== null)
const isDisabled = computed(() => game.isLocked.value || isPaused.value)

// Actions
function handleDigitPress(digit: Exclude<Digit, 0>): void {
	// Always set selectedDigit for highlighting
	game.setSelectedDigit(digit)

	// Only try to fill if a cell is selected and it's empty
	if (game.selected.value) {
		const { row, col } = game.selected.value
		const cellValue = game.getCellValue(row, col)
		const isGiven = game.isGivenCell(row, col)

		// Only fill if it's an empty, non-given cell
		if (!isGiven && cellValue === 0) {
			const prevErrors = game.errorsCount.value
			const success = game.inputDigit(digit)

			if (success) {
				if (game.errorsCount.value > prevErrors) {
					sound.playError()
				} else {
					sound.playFill()
				}
				persistSaveSoon()
				checkCompletion()
			}
			return
		}
	}
}

function handleUndo(): void {
	game.undo()
	persistSaveSoon()
}

function handleHint(): void {
	game.hint()
	persistSaveSoon()
	checkCompletion()
}

function handleClear(): void {
	game.clearCell()
	persistSaveSoon()
}

function handleToggleNotes(): void {
	game.toggleNotesMode()
}

function checkCompletion(): void {
	if (game.isCompleted.value) {
		stopTimer()
		showConfetti.value = true
		sound.playSuccess()

		// Get best time before adding new entry
		const bestEntry = leaderboard.getBestForDifficulty(game.difficulty.value)
		const bestTime = bestEntry?.seconds ?? null

		// Save victory stats for modal
		victoryStats.value = {
			difficulty: game.difficulty.value,
			elapsedSeconds: game.elapsedSeconds.value,
			hintsUsed: game.hintsUsed.value,
			errorsCount: game.errorsCount.value,
			bestTime
		}

		leaderboard.addEntry(game.difficulty.value, game.elapsedSeconds.value, game.hintsUsed.value)
		game.clearSave()

		// Show victory modal after a short delay
		setTimeout(() => {
			showVictoryModal.value = true
		}, 300)

		// Hide confetti after animation
		setTimeout(() => {
			showConfetti.value = false
		}, 3500)
	}
}

function handlePlayAgain(): void {
	showVictoryModal.value = false
	victoryStats.value = null
	game.newGame(game.difficulty.value)
	startTimer()
	persistSaveSoon()
}

function handleGoHome(): void {
	showVictoryModal.value = false
	victoryStats.value = null
	router.push({ name: 'home' })
}

function handleCloseVictory(): void {
	showVictoryModal.value = false
}

function onKeyDown(e: KeyboardEvent): void {
	if (!game.isReady.value) return

	// Space to toggle pause
	if (e.key === ' ' || e.code === 'Space') {
		e.preventDefault()
		togglePause()
		return
	}

	// Don't process other keys when paused or locked
	if (isPaused.value || game.isLocked.value) return

	// Number keys 1-9
	if (e.key >= '1' && e.key <= '9') {
		handleDigitPress(Number(e.key) as Exclude<Digit, 0>)
		return
	}

	// Clear cell
	if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
		handleClear()
		return
	}

	// Arrow keys / WASD for navigation
	if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
		e.preventDefault()
		game.moveSelection('up')
		return
	}
	if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
		e.preventDefault()
		game.moveSelection('down')
		return
	}
	if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
		e.preventDefault()
		game.moveSelection('left')
		return
	}
	if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
		e.preventDefault()
		game.moveSelection('right')
		return
	}

	// N to toggle notes mode
	if (e.key === 'n' || e.key === 'N') {
		handleToggleNotes()
		return
	}

	// Z/Ctrl+Z to undo
	if (e.key === 'z' || e.key === 'Z') {
		handleUndo()
		return
	}

	// H for hint
	if (e.key === 'h' || e.key === 'H') {
		handleHint()
		return
	}
}

// Route parsing helpers
function parseDifficulty(value: unknown): Difficulty {
	if (value === 'easy' || value === 'medium' || value === 'hard') return value
	return 'easy'
}

function parseMaxErrors(value: unknown): number {
	const raw = Array.isArray(value) ? value[0] : value
	const n = typeof raw === 'string' ? Number(raw) : typeof raw === 'number' ? raw : NaN
	if (!Number.isFinite(n)) return 3
	const int = Math.floor(n)
	return Math.min(99, Math.max(1, int))
}

function initFromRoute(): void {
	game.setMaxErrors(parseMaxErrors(route.query.maxErrors))

	const mode = route.query.mode
	if (mode === 'continue') {
		const success = game.continueSavedGame()
		if (success && !game.isLocked.value) {
			startTimer()
			return
		}
		game.newGame('easy')
		startTimer()
		persistSaveSoon()
		return
	}

	const nextDifficulty = parseDifficulty(route.query.difficulty)
	game.newGame(nextDifficulty)
	startTimer()
	persistSaveSoon()
}

// Lifecycle
onMounted(() => {
	window.addEventListener('keydown', onKeyDown)
	initFromRoute()
})

onBeforeUnmount(() => {
	window.removeEventListener('keydown', onKeyDown)
	stopTimer()
	if (saveDebounceId !== null) window.clearTimeout(saveDebounceId)
})
</script>

<template>
	<div class="min-h-screen w-full">
		<TopNav />

		<main
			class="group mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col items-center justify-center gap-4 px-4 py-6 bg-base-100 text-base-content"
		>
			<div class="w-full max-w-xl">
				<!-- Stats Bar -->
				<GameStats
					:elapsed-seconds="game.elapsedSeconds.value"
					:hints-used="game.hintsUsed.value"
					:errors-count="game.errorsCount.value"
					:max-errors="game.maxErrors.value"
					:difficulty="game.difficulty.value"
					:show-saved="showSaved"
					:is-paused="isPaused"
					@toggle-pause="togglePause"
				/>

				<!-- Game Board -->
				<div v-if="game.isReady.value" class="mt-4">
					<SudokuBoard :is-paused="isPaused" @resume="resumeGame" />

					<!-- Action Buttons -->
					<div class="mt-3">
						<ActionBar
							:can-undo="canUndo"
							:can-hint="canHint"
							:can-clear="canClear"
							:is-notes-mode="game.isNotesMode.value"
							:disabled="isDisabled"
							@undo="handleUndo"
							@hint="handleHint"
							@clear="handleClear"
							@toggle-notes="handleToggleNotes"
						/>
					</div>

					<!-- Number Pad -->
					<div class="mt-4">
						<NumberPad :disabled="isDisabled" @press="handleDigitPress" />
					</div>
				</div>
			</div>
		</main>

		<!-- Confetti celebration -->
		<Confetti v-if="showConfetti" />

		<!-- Victory Modal -->
		<VictoryModal
			v-if="victoryStats"
			:show="showVictoryModal"
			:difficulty="victoryStats.difficulty"
			:elapsed-seconds="victoryStats.elapsedSeconds"
			:hints-used="victoryStats.hintsUsed"
			:errors-count="victoryStats.errorsCount"
			:best-time="victoryStats.bestTime"
			@play-again="handlePlayAgain"
			@go-home="handleGoHome"
			@close="handleCloseVictory"
		/>
	</div>
</template>

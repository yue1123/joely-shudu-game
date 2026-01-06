import { useLocalStorage } from '@vueuse/core'

// Sound enabled state (persisted)
const soundEnabled = useLocalStorage('sudoku-sound-enabled', true)

// Audio context (created lazily to comply with autoplay policies)
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

/** Play a simple tone */
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3): void {
  if (!soundEnabled.value) return

  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = type
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Silently fail if audio not supported
  }
}

/** Click/tap sound - short, subtle */
function playClick(): void {
  playTone(800, 0.05, 'sine', 0.15)
}

/** Fill digit sound - slightly longer */
function playFill(): void {
  playTone(600, 0.08, 'sine', 0.2)
}

/** Error sound - lower, harsher */
function playError(): void {
  playTone(200, 0.15, 'square', 0.2)
}

/** Success/win sound - cheerful melody */
function playSuccess(): void {
  if (!soundEnabled.value) return

  try {
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.2, 'sine', 0.25)
      }, i * 150)
    })
  } catch {
    // Silently fail
  }
}

/** Toggle sound on/off */
function toggleSound(): void {
  soundEnabled.value = !soundEnabled.value
}

export function useSound() {
  return {
    soundEnabled,
    playClick,
    playFill,
    playError,
    playSuccess,
    toggleSound,
  }
}

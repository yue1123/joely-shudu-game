import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

export function useTimer(onTick?: () => void) {
  const elapsedSeconds = ref(0)

  const { pause, resume, isActive } = useIntervalFn(
    () => {
      elapsedSeconds.value += 1
      onTick?.()
    },
    1000,
    { immediate: false }
  )

  function start(): void {
    resume()
  }

  function stop(): void {
    pause()
  }

  function reset(): void {
    pause()
    elapsedSeconds.value = 0
  }

  function setTime(seconds: number): void {
    elapsedSeconds.value = seconds
  }

  return {
    elapsedSeconds,
    isActive,
    start,
    stop,
    reset,
    setTime,
  }
}

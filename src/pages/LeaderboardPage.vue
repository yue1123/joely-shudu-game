<script setup lang="ts">
import { computed, ref } from 'vue'

import TopNav from '../components/TopNav.vue'
import { t } from '../i18n'
import { useUiStore } from '../stores/uiStore'

import type { Difficulty } from '../sudoku'

type LeaderboardEntry = {
  seconds: number
  at: number
  hintsUsed: number
}

type LeaderboardState = {
  version: 1
  easy: LeaderboardEntry[]
  medium: LeaderboardEntry[]
  hard: LeaderboardEntry[]
}

const LEADERBOARD_KEY = 'joely-shudu-game:leaderboard:v1'

const ui = useUiStore()

const tab = ref<Difficulty>('easy')

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function loadLeaderboard(): LeaderboardState {
  const raw = localStorage.getItem(LEADERBOARD_KEY)
  if (!raw) return { version: 1, easy: [], medium: [], hard: [] }
  try {
    const parsed = JSON.parse(raw) as LeaderboardState
    if (parsed && parsed.version === 1) return parsed
  } catch {
    // ignore
  }
  return { version: 1, easy: [], medium: [], hard: [] }
}

const data = computed(() => loadLeaderboard())

const tabs = computed(() => [
  { value: 'easy' as const, label: t(ui.lang.value, 'easy') },
  { value: 'medium' as const, label: t(ui.lang.value, 'medium') },
  { value: 'hard' as const, label: t(ui.lang.value, 'hard') },
])
</script>

<template>
  <div class="min-h-screen w-full">
    <TopNav />

    <main class="mx-auto w-full max-w-5xl px-4 py-8">
      <div class="mb-4 flex items-center justify-center">
        <div role="tablist" class="tabs tabs-box">
          <button
            v-for="x in tabs"
            :key="x.value"
            type="button"
            role="tab"
            class="tab hover-3d font-mono text-sm font-bold"
            :class="tab === x.value ? 'tab-active' : ''"
            @click="tab = x.value"
          >
            {{ x.label }}
          </button>
        </div>
      </div>

      <div class="mx-auto w-full max-w-md border border-base-content bg-base-100 text-base-content p-4">
        <div class="mb-2 text-sm font-extrabold">{{ t(ui.lang.value, 'leaderboard') }} · {{ tabs.find((x) => x.value === tab)?.label }}</div>
        <div class="text-xs font-semibold opacity-80">{{ t(ui.lang.value, 'bestTimes') }}</div>

        <ol v-if="data[tab].length" class="mt-4 grid gap-2">
          <li v-for="(e, idx) in data[tab]" :key="e.at + ':' + idx" class="flex items-center justify-between border border-base-content px-3 py-2">
            <span class="font-mono tabular-nums">{{ String(idx + 1).padStart(2, '0') }} · {{ formatTime(e.seconds) }}</span>
            <span class="text-xs font-semibold opacity-80">{{ t(ui.lang.value, 'hintsUsed') }}: {{ e.hintsUsed }}</span>
          </li>
        </ol>

        <div v-else class="mt-4 text-sm font-semibold opacity-80">{{ t(ui.lang.value, 'noRecords') }}</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import TopNav from '../components/TopNav.vue'
import { useI18n } from '../composables'
import { useLeaderboardStore } from '../stores'

const { translations } = useI18n()
const leaderboard = useLeaderboardStore()

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const tabs = [
  { value: 'easy' as const, get label() { return translations.value.easy } },
  { value: 'medium' as const, get label() { return translations.value.medium } },
  { value: 'hard' as const, get label() { return translations.value.hard } },
]
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
            :class="leaderboard.currentTab.value === x.value ? 'tab-active' : ''"
            @click="leaderboard.setTab(x.value)"
          >
            {{ x.label }}
          </button>
        </div>
      </div>

      <div class="mx-auto w-full max-w-md border border-base-content bg-base-100 text-base-content p-4">
        <div class="mb-2 text-sm font-extrabold">{{ translations.leaderboard }} · {{ tabs.find((x) => x.value === leaderboard.currentTab.value)?.label }}</div>
        <div class="text-xs font-semibold opacity-80">{{ translations.bestTimes }}</div>

        <ol v-if="leaderboard.currentEntries.value.length" class="mt-4 grid gap-2">
          <li v-for="(e, idx) in leaderboard.currentEntries.value" :key="e.at + ':' + idx" class="flex items-center justify-between border border-base-content px-3 py-2">
            <span class="font-mono tabular-nums">{{ String(idx + 1).padStart(2, '0') }} · {{ formatTime(e.seconds) }}</span>
            <span class="text-xs font-semibold opacity-80">{{ translations.hintsUsed }}: {{ e.hintsUsed }}</span>
          </li>
        </ol>

        <div v-else class="mt-4 text-sm font-semibold opacity-80">{{ translations.noRecords }}</div>
      </div>
    </main>
  </div>
</template>

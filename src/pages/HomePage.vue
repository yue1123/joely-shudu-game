<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TopNav from '../components/TopNav.vue'
import { useI18n } from '../composables'
import { useGameStore } from '../stores'
import type { Difficulty } from '../sudoku'

const router = useRouter()
const route = useRoute()
const game = useGameStore()
const { translations } = useI18n()

const isNewFlow = computed(() => route.name === 'new')

const showContinue = computed(() => !isNewFlow.value && game.hasSave())
const primaryBtn =
  'btn btn-ghost h-16 border border-base-content bg-base-100 text-base-content text-sm font-extrabold shadow-none hover:bg-base-content hover:text-base-100'

function goToNewFlow(): void {
  router.push({ name: 'new' })
}

function continueGame(): void {
  router.push({ name: 'game', query: { mode: 'continue' } })
}

function startNewGame(difficulty: Difficulty): void {
  router.push({ name: 'game', query: { mode: 'new', difficulty } })
}

function openLeaderboard(): void {
  router.push({ name: 'leaderboard' })
}

function openTutorial(): void {
  router.push({ name: 'tutorial' })
}
</script>

<template>
  <div class="min-h-screen w-full">
    <TopNav />

    <main class="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <div v-if="!isNewFlow" class="grid gap-3">
          <button v-if="showContinue" type="button" :class="primaryBtn" @click="continueGame">
            {{ translations.continueGame }}
          </button>

          <button type="button" :class="primaryBtn" @click="goToNewFlow">
            {{ translations.newGame }}
          </button>

          <button type="button" :class="primaryBtn" @click="openLeaderboard">
            {{ translations.leaderboard }}
          </button>

          <button type="button" :class="primaryBtn" @click="openTutorial">
            {{ translations.tutorial }}
          </button>
        </div>

        <div v-else class="grid gap-3">
          <button type="button" :class="primaryBtn" @click="startNewGame('easy')">
            {{ translations.easy }}
          </button>
          <button type="button" :class="primaryBtn" @click="startNewGame('medium')">
            {{ translations.medium }}
          </button>
          <button type="button" :class="primaryBtn" @click="startNewGame('hard')">
            {{ translations.hard }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

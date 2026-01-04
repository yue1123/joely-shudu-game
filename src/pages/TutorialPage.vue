<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

import TopNav from '../components/TopNav.vue'
import { useUiStore } from '../stores'

import tutorialEn from '../content/tutorial.en.md?raw'
import tutorialZh from '../content/tutorial.zh.md?raw'

const ui = useUiStore()

const markdown = computed(() => (ui.lang.value === 'en' ? tutorialEn : tutorialZh))

const html = computed(() => {
  return marked.parse(markdown.value) as string
})
</script>

<template>
  <div class="min-h-screen w-full">
    <TopNav />

    <main class="mx-auto w-full max-w-5xl px-4 py-8">
      <div class="mx-auto w-full max-w-2xl border border-base-content bg-base-100 text-base-content p-4 md:p-6">
        <div
          class="space-y-4 text-sm leading-6
          [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:tracking-tight
          [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-extrabold
          [&_p]:opacity-90
          [&_ul]:list-disc [&_ul]:pl-6
          [&_li]:my-1"
          v-html="html"
        />
      </div>
    </main>
  </div>
</template>

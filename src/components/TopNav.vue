<script setup lang="ts">
	import { computed, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'

	import { Icon } from '@iconify/vue'

	import { useI18n, useSound } from '../composables'
	import { useUiStore } from '../stores'
	import ShortcutsModal from './ShortcutsModal.vue'

	const router = useRouter()
	const route = useRoute()
	const ui = useUiStore()
	const { translations } = useI18n()
	const sound = useSound()

	const canGoBack = computed(() => route.path !== '/')
	const showShortcuts = ref(false)

	function goBack(): void {
		if (window.history.length > 1) {
			router.back()
			return
		}
		router.push({ name: 'home' })
	}

	const btnSquare = computed(
		() => 'btn btn-ghost btn-square h-10 w-10 border border-base-content shadow-none'
	)
</script>

<template>
	<header class="navbar w-full border-b border-base-content bg-base-100 text-base-content">
		<div class="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4">
			<div class="flex items-center gap-2">
				<button
					v-if="canGoBack"
					type="button"
					:class="btnSquare"
					@click="goBack"
					aria-label="Back"
				>
					<Icon icon="tabler:chevron-left" class="h-4 w-4" />
				</button>

				<div class="flex items-center gap-2">
					<div class="font-mono text-sm font-extrabold tracking-tight">
						{{ translations.appTitle }}
					</div>
				</div>
			</div>

			<div class="flex-1" />

			<div class="flex items-center gap-2">
				<select
					:value="ui.lang.value"
					@change="(e: Event) => (ui.lang.value = (e.target as HTMLSelectElement).value as 'zh' | 'en')"
					class="select select-ghost h-10 border border-base-content font-mono text-sm font-bold shadow-none"
					aria-label="Language"
				>
					<option value="zh">中文</option>
					<option value="en">English</option>
				</select>

				<button type="button" :class="btnSquare" @click="showShortcuts = true" :aria-label="translations.shortcuts">
					<Icon icon="tabler:keyboard" class="h-4 w-4" />
				</button>

				<button type="button" :class="btnSquare" @click="sound.toggleSound" aria-label="Sound">
					<Icon v-if="sound.soundEnabled.value" icon="tabler:volume" class="h-4 w-4" />
					<Icon v-else icon="tabler:volume-off" class="h-4 w-4" />
				</button>

				<button type="button" :class="btnSquare" @click="ui.toggleTheme" aria-label="Theme">
					<Icon v-if="ui.isDark" icon="tabler:sun" class="h-4 w-4" />
					<Icon v-else icon="tabler:moon" class="h-4 w-4" />
				</button>
			</div>
		</div>
	</header>

	<ShortcutsModal :show="showShortcuts" @close="showShortcuts = false" />
</template>

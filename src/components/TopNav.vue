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
	const mobileMenuOpen = ref(false)

	function goBack(): void {
		if (window.history.length > 1) {
			router.back()
			return
		}
		router.push({ name: 'home' })
	}

	function closeMobileMenu(): void {
		mobileMenuOpen.value = false
	}

	const btnSquare = computed(
		() => 'btn btn-ghost btn-square h-10 w-10 border border-base-content shadow-none'
	)
</script>

<template>
	<header class="navbar py-0 w-full border-b border-base-content bg-base-100 text-base-content">
		<div class="mx-auto flex h-full w-full max-w-5xl items-center gap-3 px-4">
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

			<!-- 移动端：汉堡菜单按钮 -->
			<button
				type="button"
				:class="btnSquare"
				@click="mobileMenuOpen = true"
				aria-label="Menu"
				class="md:hidden"
			>
				<Icon icon="tabler:menu-2" class="h-4 w-4" />
			</button>

			<!-- 桌面端：完整菜单 -->
			<div class="hidden md:flex items-center gap-2">
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

	<!-- 移动端抽屉菜单 -->
	<div class="drawer drawer-end md:hidden">
		<input id="mobile-menu" type="checkbox" class="drawer-toggle" v-model="mobileMenuOpen" />
		<div class="drawer-side" style="z-index: 9999">
			<label for="mobile-menu" class="drawer-overlay" @click="closeMobileMenu"></label>
			<div class="menu bg-base-100 min-h-full w-64 p-4 shadow-xl border-l border-base-content">
				<div class="flex items-center justify-between mb-6">
					<h3 class="font-mono text-sm font-bold">{{ translations.appTitle }}</h3>
					<button type="button" :class="btnSquare" @click="closeMobileMenu" aria-label="Close">
						<Icon icon="tabler:x" class="h-4 w-4" />
					</button>
				</div>

				<ul class="space-y-2">
					<li>
						<label class="flex items-center gap-3 p-3 rounded hover:bg-base-200">
							<Icon icon="tabler:language" class="h-5 w-5" />
							<select
								:value="ui.lang.value"
								@change="(e: Event) => (ui.lang.value = (e.target as HTMLSelectElement).value as 'zh' | 'en')"
								class="select select-ghost flex-1 h-8 font-mono text-sm font-bold shadow-none"
								aria-label="Language"
							>
								<option value="zh">中文</option>
								<option value="en">English</option>
							</select>
						</label>
					</li>

					<li>
						<button
							type="button"
							class="flex items-center gap-3 p-3 rounded hover:bg-base-200 w-full"
							@click="showShortcuts = true; closeMobileMenu()"
						>
							<Icon icon="tabler:keyboard" class="h-5 w-5" />
							<span class="flex-1 text-left">{{ translations.shortcuts }}</span>
						</button>
					</li>

					<li>
						<button
							type="button"
							class="flex items-center gap-3 p-3 rounded hover:bg-base-200 w-full"
							@click="sound.toggleSound"
						>
							<Icon v-if="sound.soundEnabled.value" icon="tabler:volume" class="h-5 w-5" />
							<Icon v-else icon="tabler:volume-off" class="h-5 w-5" />
							<span class="flex-1 text-left">
								{{ sound.soundEnabled.value ? '关闭音效' : '开启音效' }}
							</span>
						</button>
					</li>

					<li>
						<button
							type="button"
							class="flex items-center gap-3 p-3 rounded hover:bg-base-200 w-full"
							@click="ui.toggleTheme"
						>
							<Icon v-if="ui.isDark" icon="tabler:sun" class="h-5 w-5" />
							<Icon v-else icon="tabler:moon" class="h-5 w-5" />
							<span class="flex-1 text-left">
								{{ ui.isDark ? '浅色模式' : '深色模式' }}
							</span>
						</button>
					</li>
				</ul>
			</div>
		</div>
	</div>

	<ShortcutsModal :show="showShortcuts" @close="showShortcuts = false" />
</template>

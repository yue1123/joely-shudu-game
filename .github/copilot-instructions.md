# Copilot instructions (joely-shudu-game)

## Project snapshot
- Vue 3 + TypeScript + Vite. App entry: [index.html](../index.html) → mounts `#app` → [src/main.ts](../src/main.ts).
- Root component is [src/App.vue](../src/App.vue); components live in [src/components/](../src/components/).
- Global CSS is in [src/style.css](../src/style.css); component styles typically use `<style scoped>`.

## Dev workflows (pnpm)
- Install: `pnpm install`
- Dev server (HMR): `pnpm dev`
- Typecheck + build: `pnpm build` (runs `vue-tsc -b` then `vite build`)
- Preview production build: `pnpm preview`

## TypeScript + Vue conventions
- Vue SFCs use `<script setup lang="ts">` (see [src/App.vue](../src/App.vue) and [src/components/HelloWorld.vue](../src/components/HelloWorld.vue)).
- TypeScript is intentionally strict. Keep code clean to satisfy:
  - `strict`, `noUnusedLocals`, `noUnusedParameters` (see [tsconfig.app.json](../tsconfig.app.json))
  - Avoid side-effect-only imports when possible (`noUncheckedSideEffectImports`).
- Prefer explicit prop typing via `defineProps<...>()` (example: [src/components/HelloWorld.vue](../src/components/HelloWorld.vue)).

## Build tooling notes
- This repo uses `pnpm` and overrides Vite to `rolldown-vite` (see [package.json](../package.json)).
  - When changing bundler-related behavior, check [vite.config.ts](../vite.config.ts) and keep config minimal.
- TypeScript build uses project references ([tsconfig.json](../tsconfig.json)); if you add new TS entry points/config, keep `vue-tsc -b` working.

## Making changes (expected patterns)
- New UI should be added as Vue components under [src/components/](../src/components/) and wired from [src/App.vue](../src/App.vue).
- Assets:
  - Bundled assets: [src/assets/](../src/assets/)
  - Public/static assets: [public/](../public/)

## What not to assume
- No test runner/linter scripts are configured in [package.json](../package.json). Don’t invent tooling; align with existing scripts.

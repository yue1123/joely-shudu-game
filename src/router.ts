import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Lazy-loaded page components for better initial bundle size
const HomePage = () => import('./pages/HomePage.vue')
const GamePage = () => import('./pages/GamePage.vue')
const LeaderboardPage = () => import('./pages/LeaderboardPage.vue')
const TutorialPage = () => import('./pages/TutorialPage.vue')

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/new', name: 'new', component: HomePage },
  { path: '/game', name: 'game', component: GamePage },
  { path: '/leaderboard', name: 'leaderboard', component: LeaderboardPage },
  { path: '/tutorial', name: 'tutorial', component: TutorialPage },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

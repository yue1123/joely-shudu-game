import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import GamePage from './pages/GamePage.vue'
import HomePage from './pages/HomePage.vue'
import LeaderboardPage from './pages/LeaderboardPage.vue'
import TutorialPage from './pages/TutorialPage.vue'

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

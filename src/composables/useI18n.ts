import { computed } from 'vue'
import type { I18nKey, Language } from '../types'
import { useUiStore } from '../stores/uiStore'

const DICT: Record<Language, Record<I18nKey, string>> = {
  zh: {
    appTitle: 'Joely 数独',
    back: '返回',
    language: '语言',
    theme: '主题',
    difficulty: '难度',
    easy: '简单',
    medium: '中等',
    hard: '困难',
    chooseDifficulty: '选择难度',
    continueGame: '继续游戏',
    newGame: '新游戏',
    tutorial: '学习玩法',
    hint: '提示',
    timer: '计时',
    hintsUsed: '提示次数',
    mistakes: '错误',
    continue: '继续游戏',
    saved: '已保存',
    completed: '完成！',
    leaderboard: '排行榜',
    bestTimes: '最快用时',
    noRecords: '暂无记录',
    tutorialTitle: '玩法教程',
    undo: '撤销',
    clear: '擦除',
    notes: '标记',
  },
  en: {
    appTitle: 'Joely Sudoku',
    back: 'Back',
    language: 'Language',
    theme: 'Theme',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    chooseDifficulty: 'Choose difficulty',
    continueGame: 'Continue',
    newGame: 'New Game',
    tutorial: 'How to Play',
    hint: 'Hint',
    timer: 'Timer',
    hintsUsed: 'Hints',
    mistakes: 'Mistakes',
    continue: 'Continue',
    saved: 'Saved',
    completed: 'Completed!',
    leaderboard: 'Leaderboard',
    bestTimes: 'Best times',
    noRecords: 'No records yet',
    tutorialTitle: 'How to Play',
    undo: 'Undo',
    clear: 'Erase',
    notes: 'Notes',
  },
}

/**
 * Composable for i18n translations
 * Automatically uses the current language from uiStore
 */
export function useI18n() {
  const ui = useUiStore()

  // Create a reactive translate function
  function t(key: I18nKey): string {
    return DICT[ui.lang.value]?.[key] ?? key
  }

  const locale = computed(() => ui.lang.value)

  // Return reactive translations object for template use
  const translations = computed(() => {
    const lang = ui.lang.value
    return DICT[lang]
  })

  return { t, locale, translations }
}

/**
 * Direct translation function (for use outside of setup)
 */
export function translate(lang: Language, key: I18nKey): string {
  return DICT[lang]?.[key] ?? key
}

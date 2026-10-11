import { useColorMode, useStorage } from '@vueuse/core'
import { computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveLocale } from '../locales'

export function usePreferences() {
  const { locale } = useI18n()
  const storedLanguage = useStorage('videojs-vue:language', 'zh-CN')
  const language = computed({
    get: () => resolveLocale(storedLanguage.value),
    set: (value: string) => {
      storedLanguage.value = resolveLocale(value)
    },
  })
  const theme = useColorMode({
    storageKey: 'videojs-vue:theme',
    emitAuto: true,
  })
  watchEffect(() => {
    locale.value = language.value
    document.documentElement.lang = locale.value
  })
  return { language, theme }
}

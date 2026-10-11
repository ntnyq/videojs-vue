import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { usePreferences } from '../playground/src/composables/usePreferences'
import { i18n } from '../playground/src/i18n'
import { cleanup, disposals, settle } from './helpers'

function mountPreferences() {
  const container = document.createElement('div')
  document.body.append(container)
  const app = createApp(
    defineComponent({
      setup() {
        const { language } = usePreferences()
        return () =>
          h(
            'button',
            {
              onClick: () => {
                language.value = 'ko'
              },
            },
            i18n.global.t('app.audioPlayer'),
          )
      },
    }),
  )
  app.use(i18n)
  app.mount(container)
  disposals.push(() => {
    app.unmount()
    container.remove()
  })
  return container
}

describe('playground language preferences', () => {
  afterEach(() => {
    cleanup()
    localStorage.removeItem('videojs-vue:language')
    document.documentElement.lang = ''
    i18n.global.locale.value = 'zh-CN'
  })

  it.each([
    ['zh-CN', '音频播放器'],
    ['zh-TW', '音訊播放器'],
    ['en', 'Audio player'],
    ['ja', '音声プレーヤー'],
    ['ko', '오디오 플레이어'],
  ])(
    'restores %s for the interface and document language',
    async (locale, label) => {
      expect.hasAssertions()
      localStorage.setItem('videojs-vue:language', locale)
      const container = mountPreferences()
      await settle()
      expect(container.textContent).toBe(label)
      expect(document.documentElement.lang).toBe(locale)
      expect(i18n.global.locale.value).toBe(locale)
    },
  )

  it('falls back for an unsupported stored locale and persists subsequent changes', async () => {
    expect.hasAssertions()
    localStorage.setItem('videojs-vue:language', 'invalid-locale')
    const container = mountPreferences()
    await settle()
    expect(container.textContent).toBe('音频播放器')
    expect(document.documentElement.lang).toBe('zh-CN')
    container.querySelector('button')!.click()
    await settle()
    expect(container.textContent).toBe('오디오 플레이어')
    expect(document.documentElement.lang).toBe('ko')
    expect(localStorage.getItem('videojs-vue:language')).toBe('ko')
  })
})

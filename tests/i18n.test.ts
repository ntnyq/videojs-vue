import '@videojs/html/i18n/locales/zh-CN/register'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, shallowRef } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { PlayerRoot, Video, VideoPlayer } from '../src'
import {
  MediaI18n,
  MediaText,
  getI18nTranslations,
  hasRegisteredLocale,
  onI18nRegistryChange,
  registerI18n,
} from '../src/i18n'
import type { Translations } from '../src/i18n'
import { MediaContainer, PlayButton } from '../src/ui'
import { cleanup, disposals, mount, settle } from './helpers'

describe('internationalization', () => {
  afterEach(cleanup)

  it('switches multiple players and custom controls without recreating media', async () => {
    expect.hasAssertions()
    const lang = shallowRef('zh-CN')
    const ready = vi.fn()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            MediaI18n,
            { lang: lang.value },
            {
              default: () => [
                h(VideoPlayer, { src: '/first.mp4', onReady: ready }),
                h(VideoPlayer, {
                  src: '/second.mp4',
                  skin: 'neutral',
                  onReady: ready,
                }),
                h(PlayerRoot, null, {
                  default: () =>
                    h(MediaContainer, null, {
                      default: () => [h(Video), h(PlayButton)],
                    }),
                }),
              ],
            },
          ),
      ),
    )
    await settle()
    const media = [...container.querySelectorAll('video')]
    const buttons = [...container.querySelectorAll('media-play-button')]
    for (const skin of container.querySelectorAll(
      'video-skin, video-neutral-skin',
    )) {
      buttons.push(...skin.shadowRoot!.querySelectorAll('media-play-button'))
    }
    expect(buttons.length).toBeGreaterThanOrEqual(3)
    expect(
      buttons.every(button => button.getAttribute('aria-label') === '播放'),
    ).toBe(true)
    expect(ready).toHaveBeenCalledTimes(2)

    lang.value = 'en'
    await settle()
    expect(
      buttons.every(button => button.getAttribute('aria-label') === 'Play'),
    ).toBe(true)
    expect([...container.querySelectorAll('video')]).toStrictEqual(media)
    expect(ready).toHaveBeenCalledTimes(2)
  })

  it('inherits ancestor language, isolates nested providers, and clears overrides', async () => {
    expect.hasAssertions()
    const ambient = shallowRef('zh-CN')
    const nested = shallowRef<string | undefined>('en')
    const { container } = mount(
      defineComponent(
        () => () =>
          h('section', { lang: ambient.value }, [
            h(MediaI18n, null, {
              default: () => [
                h(
                  MediaText,
                  { token: 'buttons.play' },
                  { default: () => 'Play' },
                ),
                h(
                  MediaI18n,
                  { lang: nested.value },
                  {
                    default: () =>
                      h(
                        MediaText,
                        { token: 'buttons.play' },
                        { default: () => 'Play' },
                      ),
                  },
                ),
              ],
            }),
          ]),
      ),
    )
    await settle()
    const texts = () =>
      [...container.querySelectorAll('media-text')].map(
        element => element.textContent,
      )
    expect(texts()).toStrictEqual(['播放', 'Play'])
    nested.value = undefined
    await settle()
    expect(texts()).toStrictEqual(['播放', '播放'])
    ambient.value = 'en'
    await settle()
    expect(texts()).toStrictEqual(['Play', 'Play'])
  })

  it('uses the shared registry for late overrides and regional fallback', async () => {
    expect.hasAssertions()
    const locale = 'en-XV'
    const translations = {
      buttons: { play: 'Start movie' },
    } satisfies Partial<Translations>
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            MediaI18n,
            { lang: locale },
            {
              default: () =>
                h(
                  MediaText,
                  { token: 'buttons.play' },
                  { default: () => 'Play' },
                ),
            },
          ),
      ),
    )
    await settle()
    expect(container.textContent).toBe('Play')
    const changed = vi.fn()
    const unsubscribe = onI18nRegistryChange(changed)
    disposals.push(unsubscribe)
    registerI18n(locale, translations)
    await settle()
    expect(container.textContent).toBe('Start movie')
    expect(hasRegisteredLocale(locale)).toBe(true)
    expect(getI18nTranslations(`${locale}-demo`)['buttons.play']).toBe(
      'Start movie',
    )
    expect(changed).toHaveBeenCalledTimes(1)
    unsubscribe()
    registerI18n(locale, { buttons: { play: 'Start again' } })
    await settle()
    expect(container.textContent).toBe('Start again')
    expect(changed).toHaveBeenCalledTimes(1)
  })

  it('updates text tokens and fallbacks while forwarding attrs and events', async () => {
    expect.hasAssertions()
    const token = shallowRef('buttons.play')
    const fallback = shallowRef('Play')
    const clicked = vi.fn()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            MediaI18n,
            { lang: 'zh-CN', class: 'translations' },
            {
              default: () =>
                h(
                  MediaText,
                  { token: token.value, class: 'label', onClick: clicked },
                  {
                    default: () => fallback.value,
                  },
                ),
            },
          ),
      ),
    )
    await settle()
    expect(container.querySelector('media-i18n')?.className).toBe(
      'translations',
    )
    expect(container.querySelector('.label')?.textContent).toBe('播放')
    container
      .querySelector('media-text')
      ?.dispatchEvent(new MouseEvent('click'))
    expect(clicked).toHaveBeenCalledTimes(1)
    token.value = 'buttons.pause'
    fallback.value = 'Pause'
    await settle()
    expect(container.textContent).toBe('暂停')
    token.value = 'custom.missing'
    await settle()
    expect(container.textContent).toBe('Pause')
    fallback.value = 'Unavailable'
    await settle()
    expect(container.textContent).toBe('Unavailable')
    fallback.value = ''
    await settle()
    expect(container.textContent).toBe('')
  })

  it('derives direction and supports an explicit direction override', async () => {
    expect.hasAssertions()
    const lang = shallowRef('ar')
    const dir = shallowRef<'ltr' | undefined>()
    const { container } = mount(
      defineComponent(
        () => () => h(MediaI18n, { lang: lang.value, dir: dir.value }),
      ),
    )
    await settle()
    const provider = container.querySelector('media-i18n')!
    expect(provider.dir).toBe('rtl')
    dir.value = 'ltr'
    await settle()
    expect(provider.dir).toBe('ltr')
    dir.value = undefined
    await settle()
    expect(provider.dir).toBe('rtl')
    lang.value = 'en'
    await settle()
    expect(provider.dir).toBe('ltr')
  })

  it('hydrates translated elements that upgraded before Vue mounted', async () => {
    expect.hasAssertions()
    const lang = shallowRef('zh-CN')
    const Example = defineComponent(
      () => () =>
        h(
          MediaI18n,
          { lang: lang.value },
          {
            default: () =>
              h(
                MediaText,
                { token: 'buttons.play' },
                { default: () => 'Play' },
              ),
          },
        ),
    )
    const container = document.createElement('div')
    container.innerHTML = await renderToString(createSSRApp(Example))
    document.body.append(container)
    await settle()
    expect(container.textContent).toBe('播放')
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = createSSRApp(Example)
    app.mount(container)
    disposals.push(() => {
      app.unmount()
      container.remove()
    })
    await settle()
    expect(container.textContent).toBe('播放')
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    lang.value = 'en'
    await settle()
    expect(container.textContent).toBe('Play')
  })
})

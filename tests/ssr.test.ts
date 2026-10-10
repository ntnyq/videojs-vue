import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
// @vitest-environment node
import { renderToString } from 'vue/server-renderer'
import { VideoPlayer } from '../src'
import {
  MediaI18n,
  MediaText,
  registerI18n,
  getI18nTranslations,
} from '../src/i18n'
import { HlsVideo } from '../src/media/hls'

describe('server rendering', () => {
  it('renders i18n attributes and fallback text without browser globals', async () => {
    expect.hasAssertions()
    registerI18n('en-XS', { buttons: { play: 'Start' } })
    expect(getI18nTranslations('en-XS')['buttons.play']).toBe('Start')
    const html = await renderToString(
      createSSRApp(() =>
        h(
          MediaI18n,
          { lang: 'zh-CN', dir: 'ltr' },
          {
            default: () => [
              h(VideoPlayer, { src: '/movie.mp4' }),
              h(
                MediaText,
                { token: 'buttons.play' },
                { default: () => 'Play' },
              ),
            ],
          },
        ),
      ),
    )
    expect(html).toContain('<media-i18n lang="zh-CN" dir="ltr">')
    expect(html).toContain('token="buttons.play"')
    expect(html).toContain('>Play</media-text>')
    expect(html).toContain('<video-player')
  })

  it('imports without browser globals and emits hydratable player markup', async () => {
    expect.hasAssertions()
    const html = await renderToString(
      createSSRApp(() =>
        h(VideoPlayer, { src: '/movie.mp4', title: 'Example' }),
      ),
    )
    expect(html).toContain('<video-player')
    expect(html).toContain('<video-skin')
    expect(html).toContain('src="/movie.mp4"')
  })

  it('keeps the optional HLS entry safe to import on the server', async () => {
    expect.hasAssertions()
    const html = await renderToString(
      createSSRApp(() =>
        h(VideoPlayer, { media: HlsVideo, src: '/stream.m3u8' }),
      ),
    )
    expect(html).toContain('<hlsjs-video')
    expect(html).toContain('src="/stream.m3u8"')
  })
})

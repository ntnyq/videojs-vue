import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
// @vitest-environment node
import { renderToString } from 'vue/server-renderer'
import { VideoPlayer } from '../src'
import { HlsVideo } from '../src/media/hls'

describe('server rendering', () => {
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

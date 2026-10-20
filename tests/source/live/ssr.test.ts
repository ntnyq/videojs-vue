// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { LiveVideoPlayer } from '../../../src/live'
import { HlsVideo } from '../../../src/media/hls'

describe('live server rendering', () => {
  it.each(['default', 'neutral'] as const)(
    'renders the %s HLS live preset without browser globals',
    async skin => {
      expect.hasAssertions()
      const html = await renderToString(
        createSSRApp(() =>
          h(LiveVideoPlayer, {
            skin,
            media: HlsVideo,
            src: '/live.m3u8',
            title: 'Live',
            muted: true,
          }),
        ),
      )
      expect(html).toContain('<live-video-player content-title="Live"')
      expect(html).toContain('<hlsjs-video')
      expect(html).toContain('src="/live.m3u8"')
      expect(html).toContain(' muted')
      expect(html).not.toContain('playback-rate')
    },
  )
})

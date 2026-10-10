// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { AudioPlayer } from '../src/audio'

describe('audio server rendering', () => {
  it.each(['default', 'neutral'] as const)(
    'renders the %s skin without browser globals',
    async skin => {
      expect.hasAssertions()
      const html = await renderToString(
        createSSRApp(() =>
          h(AudioPlayer, {
            src: '/episode.mp3',
            title: 'Episode',
            poster: '/cover.jpg',
            skin,
          }),
        ),
      )
      expect(html).toContain(
        '<audio-player content-title="Episode" poster="/cover.jpg">',
      )
      expect(html).toContain('src="/episode.mp3"')
      expect(html).toContain('<audio')
      expect(html).not.toContain('<video')
      expect(html).not.toContain('playsinline')
      expect(html).not.toContain('keep-alive')
      expect(html).not.toContain('aspect-ratio')
    },
  )
})

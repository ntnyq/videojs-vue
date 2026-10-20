import { AudioPlayer as DefaultAudioPlayer } from 'videojs-vue/audio/default'
import { AudioPlayer as NeutralAudioPlayer } from 'videojs-vue/audio/neutral'
import { AudioTrackRadioGroup } from 'videojs-vue/ui/audio-track-radio-group'
import { MediaMenu } from 'videojs-vue/ui/menu'
import { MediaMenuContent } from 'videojs-vue/ui/menu-content'
import { QualityRadioGroup } from 'videojs-vue/ui/quality-radio-group'
import { VideoPlayer as CompatVideoPlayer } from 'videojs-vue/video/compat'
import { VideoPlayer as DefaultVideoPlayer } from 'videojs-vue/video/default'
import { VideoPlayer as LegacyVideoPlayer } from 'videojs-vue/video/legacy'
import { VideoPlayer as NeutralVideoPlayer } from 'videojs-vue/video/neutral'
// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'

describe('published package', () => {
  it.each<[Component, string]>([
    [LegacyVideoPlayer, 'media-container'],
    [CompatVideoPlayer, 'video-compat-skin'],
    [DefaultVideoPlayer, 'video-skin'],
    [NeutralVideoPlayer, 'video-neutral-skin'],
    [DefaultAudioPlayer, 'audio-skin'],
    [NeutralAudioPlayer, 'audio-neutral-skin'],
    [QualityRadioGroup, 'media-quality-radio-group'],
    [AudioTrackRadioGroup, 'media-audio-track-radio-group'],
    [MediaMenu, 'media-menu'],
    [MediaMenuContent, 'media-menu-content'],
  ])('renders %s from dist without browser globals', async (Player, tag) => {
    expect.hasAssertions()
    const html = await renderToString(
      createSSRApp(() => h(Player, { src: '/media.mp4' })),
    )
    expect(html).toContain(`<${tag}`)
    expect(html).toContain('src="/media.mp4"')
  })
})

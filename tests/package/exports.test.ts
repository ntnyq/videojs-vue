import { readFile } from 'node:fs/promises'
// @vitest-environment node
import { createRequire } from 'node:module'
import type {
  LiveVideoPlayerStore as UpstreamLiveVideoPlayerStore,
  VideoPlayerStore as UpstreamVideoPlayerStore,
} from '@videojs/html'
import * as video from 'videojs-vue'
import * as live from 'videojs-vue/live'
import * as liveComposables from 'videojs-vue/live/composables'
import * as liveCore from 'videojs-vue/live/core'
import { DefaultLiveVideoSkin } from 'videojs-vue/live/skins/default'
import * as videoComposables from 'videojs-vue/video/composables'
import * as videoCore from 'videojs-vue/video/core'
import { DefaultVideoSkin } from 'videojs-vue/video/skins/default'
import { describe, expect, expectTypeOf, it } from 'vitest'

const require = createRequire(import.meta.url)

describe('published API names and paths', () => {
  it('shares the explicit video and live APIs across aggregate and granular entries', () => {
    expect.hasAssertions()
    expect(video.VideoPlayerRoot).toBe(videoCore.VideoPlayerRoot)
    expect(video.VideoPlayerRoot.name).toBe('VideoPlayerRoot')
    expect(video.useVideoPlayerState).toBe(videoComposables.useVideoPlayerState)
    expect(video.useVideoPlayerActions).toBe(
      videoComposables.useVideoPlayerActions,
    )
    expect(video.DefaultVideoSkin).toBe(DefaultVideoSkin)
    expect(live.LiveVideoPlayerRoot).toBe(liveCore.LiveVideoPlayerRoot)
    expect(live.useLiveVideoPlayerState).toBe(
      liveComposables.useLiveVideoPlayerState,
    )
    expect(live.useLiveVideoPlayerActions).toBe(
      liveComposables.useLiveVideoPlayerActions,
    )
    expect(live.DefaultLiveVideoSkin).toBe(DefaultLiveVideoSkin)
    expect(DefaultLiveVideoSkin.name).toBe('DefaultLiveVideoSkin')
  })

  it('preserves store, exposed handle, and ready event types', () => {
    expect.assertions(0)
    expectTypeOf<video.VideoPlayerStore>().toEqualTypeOf<UpstreamVideoPlayerStore>()
    expectTypeOf<live.LiveVideoPlayerStore>().toEqualTypeOf<UpstreamLiveVideoPlayerStore>()
    expectTypeOf<video.VideoPlayerHandle>().toEqualTypeOf<videoCore.VideoPlayerHandle>()
    expectTypeOf<video.VideoPlayerHandle>().toEqualTypeOf<videoComposables.VideoPlayerHandle>()
    expectTypeOf<live.LiveVideoPlayerHandle>().toEqualTypeOf<liveCore.LiveVideoPlayerHandle>()
    expectTypeOf<live.LiveVideoPlayerHandle>().toEqualTypeOf<liveComposables.LiveVideoPlayerHandle>()
    expectTypeOf<
      Parameters<
        NonNullable<
          InstanceType<typeof video.VideoPlayerRoot>['$props']['onReady']
        >
      >[0]
    >().toEqualTypeOf<video.VideoPlayerHandle>()
    expectTypeOf<
      Parameters<
        NonNullable<
          InstanceType<typeof live.LiveVideoPlayerRoot>['$props']['onReady']
        >
      >[0]
    >().toEqualTypeOf<live.LiveVideoPlayerHandle>()
    expectTypeOf<video.VideoMediaProps['poster']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<live.LiveVideoMediaProps>().not.toHaveProperty('playbackRate')
  })

  it('does not export historical type aliases', () => {
    expect.assertions(0)
    // @ts-expect-error Video types use the explicit VideoPlayer prefix.
    expectTypeOf<video.PlayerHandle>()
    // @ts-expect-error Video types use the explicit VideoPlayer prefix.
    expectTypeOf<video.PlayerStore>()
    // @ts-expect-error Video types use the explicit VideoPlayer prefix.
    expectTypeOf<video.PlayerState>()
    // @ts-expect-error Video types use the explicit VideoPlayer prefix.
    expectTypeOf<video.PlayerActions>()
    // @ts-expect-error Video types use the explicit VideoPlayer prefix.
    expectTypeOf<video.PlayerElement>()
    // @ts-expect-error Video types use the explicit VideoPlayer prefix.
    expectTypeOf<video.PlayerTarget>()
    // @ts-expect-error Video media props are explicitly named.
    expectTypeOf<video.MediaProps>()
    // @ts-expect-error Live types use the complete LiveVideoPlayer prefix.
    expectTypeOf<live.LivePlayerHandle>()
    // @ts-expect-error Live types use the complete LiveVideoPlayer prefix.
    expectTypeOf<live.LivePlayerState>()
    // @ts-expect-error Live types use the complete LiveVideoPlayer prefix.
    expectTypeOf<live.LivePlayerActions>()
    // @ts-expect-error Live types use the complete LiveVideoPlayer prefix.
    expectTypeOf<live.LivePlayerElement>()
    // @ts-expect-error Live types use the complete LiveVideoPlayer prefix.
    expectTypeOf<live.LivePlayerTarget>()
    // @ts-expect-error Live video media props are explicitly named.
    expectTypeOf<live.LiveMediaProps>()
  })

  it.each([
    [
      'video aggregate',
      video,
      ['PlayerRoot', 'usePlayerState', 'usePlayerActions'],
    ],
    ['video core', videoCore, ['PlayerRoot']],
    [
      'video composables',
      videoComposables,
      ['usePlayerState', 'usePlayerActions'],
    ],
    [
      'live aggregate',
      live,
      ['LiveVideoSkin', 'useLivePlayerState', 'useLivePlayerActions'],
    ],
    [
      'live composables',
      liveComposables,
      ['useLivePlayerState', 'useLivePlayerActions'],
    ],
  ] as const)(
    'does not expose historical runtime aliases in %s',
    (_name, entry, removed) => {
      expect.hasAssertions()
      for (const name of removed) {
        expect(entry).not.toHaveProperty(name)
      }
    },
  )

  it.each([
    'core',
    'composables',
    'skins/compat',
    'skins/default',
    'skins/neutral',
    'skins/legacy',
    'skins/legacy.css',
  ])('rejects the removed %s package path', entry => {
    expect.hasAssertions()
    expect(() => require.resolve(`videojs-vue/${entry}`)).toThrow(
      expect.objectContaining({ code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' }),
    )
  })

  it('publishes the legacy stylesheet under the video namespace', async () => {
    expect.hasAssertions()
    const css = await readFile(
      require.resolve('videojs-vue/video/skins/legacy.css'),
      'utf8',
    )
    expect(css).toContain('.vjs-legacy')
  })
})

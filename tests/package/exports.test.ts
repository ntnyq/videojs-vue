/* oxlint-disable import/no-namespace -- Namespace imports verify runtime exports and public types across package entries. */
import { readdir, readFile } from 'node:fs/promises'
// @vitest-environment node
import { createRequire } from 'node:module'
import path from 'node:path'
import type {
  LiveVideoPlayerStore as UpstreamLiveVideoPlayerStore,
  VideoPlayerStore as UpstreamVideoPlayerStore,
} from '@videojs/html'
import upstreamPackage from '@videojs/html/package.json' with { type: 'json' }
import * as video from 'videojs-vue'
import * as live from 'videojs-vue/live'
import * as liveComposables from 'videojs-vue/live/composables'
import * as liveCore from 'videojs-vue/live/core'
import { DefaultLiveVideoSkin } from 'videojs-vue/live/skins/default'
import { captureVideoFrame, downloadMedia } from 'videojs-vue/media/utils'
import type { VideoFrameOptions } from 'videojs-vue/media/utils'
import * as ui from 'videojs-vue/ui'
import {
  CaptionsRadioGroup as AggregateCaptionsRadioGroup,
  PlaybackRateButton as AggregatePlaybackRateButton,
  PlaybackRateRadioGroup as AggregatePlaybackRateRadioGroup,
} from 'videojs-vue/ui'
import { CaptionsRadioGroup } from 'videojs-vue/ui/captions-radio-group'
import { PlaybackRateButton } from 'videojs-vue/ui/playback-rate-button'
import { PlaybackRateRadioGroup } from 'videojs-vue/ui/playback-rate-radio-group'
import * as videoComposables from 'videojs-vue/video/composables'
import * as videoCore from 'videojs-vue/video/core'
import { DefaultVideoSkin } from 'videojs-vue/video/skins/default'
import { describe, expect, expectTypeOf, it } from 'vitest'
import packageJson from '../../package.json' with { type: 'json' }
import playgroundPackage from '../../playground/package.json' with { type: 'json' }
import { registrationEntries } from './entries'

const require = createRequire(import.meta.url)

describe('published API names and paths', () => {
  it('aligns optional HLS peers and workspace consumers with the upstream requirement', () => {
    expect.hasAssertions()
    const required = upstreamPackage.peerDependencies['@videojs/hlsjs-video']
    expect(packageJson.peerDependencies['@videojs/hlsjs-video']).toBe(
      `^${required}`,
    )
    expect(packageJson.devDependencies['@videojs/hlsjs-video']).toBe(
      `^${required}`,
    )
    expect(playgroundPackage.dependencies['@videojs/hlsjs-video']).toBe(
      required,
    )
    expect(
      packageJson.peerDependenciesMeta['@videojs/hlsjs-video'].optional,
    ).toBe(true)
  })

  it.each([
    'README.md',
    'docs/api/media.md',
    'docs/api/overview.md',
    'docs/examples/hls.md',
    'docs/examples/live.md',
    'docs/guide/overview.md',
    'docs/guide/troubleshooting.md',
  ])('documents a compatible HLS installation in %s', async file => {
    expect.hasAssertions()
    const text = await readFile(
      new URL(`../../${file}`, import.meta.url),
      'utf8',
    )
    expect(text).toContain(
      `@videojs/hlsjs-video@${upstreamPackage.peerDependencies['@videojs/hlsjs-video']}`,
    )
  })

  it('covers every UI entry in the installed upstream version', async () => {
    expect.hasAssertions()
    const upstream = await readdir(
      path.dirname(require.resolve('@videojs/html/ui/play-button')),
    )
    const expected = upstream
      .filter(file => file.endsWith('.js'))
      .map(file => `./ui/${file.slice(0, -3)}`)
      .toSorted()
    expect(
      Object.keys(packageJson.exports)
        .filter(entry => entry.startsWith('./ui/'))
        .toSorted(),
    ).toStrictEqual(expected)
    expect(Object.keys(ui)).toHaveLength(expected.length)
  })

  it.each(
    Object.keys(registrationEntries).filter(entry => entry.startsWith('ui/')),
  )(
    'shares the %s component between granular and aggregate entries',
    async entry => {
      expect.hasAssertions()
      const granular: Record<string, unknown> = await import(
        `videojs-vue/${entry}`
      )
      expect(Object.keys(granular)).toHaveLength(1)
      for (const [name, component] of Object.entries(granular)) {
        expect(ui).toHaveProperty(name, component)
      }
    },
  )

  it('shares captions and playback rate controls across aggregate and granular entries', () => {
    expect.hasAssertions()
    expect(AggregateCaptionsRadioGroup).toBe(CaptionsRadioGroup)
    expect(AggregatePlaybackRateButton).toBe(PlaybackRateButton)
    expect(AggregatePlaybackRateRadioGroup).toBe(PlaybackRateRadioGroup)
    expectTypeOf<
      InstanceType<typeof PlaybackRateRadioGroup>['$props']['formatRate']
    >().toEqualTypeOf<((rate: number) => string) | undefined>()
  })

  it('exports SSR-safe media utilities from their standalone entry', async () => {
    expect.hasAssertions()
    expect(globalThis).not.toHaveProperty('document')
    expect(downloadMedia).toBeTypeOf('function')
    await expect(captureVideoFrame(null)).rejects.toThrow('native video')
    expect(() => downloadMedia('/video.mp4', 'video.mp4')).toThrow(
      'browser document',
    )
    expectTypeOf(captureVideoFrame).returns.toEqualTypeOf<Promise<Blob>>()
    expectTypeOf<VideoFrameOptions['quality']>().toEqualTypeOf<
      number | undefined
    >()
  })

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

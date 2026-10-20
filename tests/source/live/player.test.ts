import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defineComponent, h, KeepAlive, shallowRef } from 'vue'
import {
  LiveVideoPlayer,
  LiveVideoPlayerRoot,
  DefaultLiveVideoSkin,
  useLiveVideoPlayerActions,
  useLiveVideoPlayerState,
} from '../../../src/live'
import type {
  LiveVideoPlayerActions,
  LiveVideoPlayerHandle,
  LiveVideoPlayerState,
} from '../../../src/live'
import { HlsVideo } from '../../../src/media/hls'
import { LiveButton } from '../../../src/ui/live-button'
import {
  cleanup,
  disposals,
  mount,
  reconnectPlayer,
  settle,
} from '../../helpers'

/**
 * Replace jsdom's missing streaming timeline, leaving the upstream live store and button real.
 * @param {HTMLElement} media - The live-capable HLS media element.
 * @param {object} timeline - Current window category, seekable end, and live edge.
 */
function setLiveTimeline(
  media: HTMLElement,
  timeline: { window: number; end: number; edge: number },
) {
  const { window, end, edge } = timeline
  Object.defineProperties(media, {
    targetLiveWindow: { configurable: true, value: window },
    liveEdgeStart: { configurable: true, value: edge },
    duration: { configurable: true, value: Infinity },
    readyState: { configurable: true, value: 1 },
    seekable: {
      configurable: true,
      value: {
        length: 2,
        start: (index: number) => (index === 0 ? 100 : end - 40),
        end: (index: number) => (index === 0 ? 150 : end),
      },
    },
  })
  media.dispatchEvent(new Event('loadedmetadata'))
  media.dispatchEvent(new Event('progress'))
}

describe('live video player', () => {
  afterEach(cleanup)

  it('exposes only supported live capabilities and keeps upstream state types', () => {
    expect.assertions(0)
    expectTypeOf<
      InstanceType<typeof LiveVideoPlayer>
    >().toExtend<LiveVideoPlayerHandle>()
    expectTypeOf<
      LiveVideoPlayerState['liveEdgeStart']
    >().toEqualTypeOf<number>()
    expectTypeOf<
      LiveVideoPlayerState['targetLiveWindow']
    >().toEqualTypeOf<number>()
    expectTypeOf<LiveVideoPlayerActions>().not.toHaveProperty('setPlaybackRate')
    expectTypeOf<LiveVideoPlayerActions>().not.toHaveProperty(
      'selectVideoRendition',
    )
    expectTypeOf<LiveVideoPlayerActions>().not.toHaveProperty(
      'selectAudioTrack',
    )
    expectTypeOf<
      InstanceType<typeof LiveVideoPlayer>['$props']
    >().not.toHaveProperty('playbackRate')
  })

  it.each(['default', 'neutral'] as const)(
    'connects HLS to the %s live skin and synchronizes settings',
    async skin => {
      expect.hasAssertions()
      const player = shallowRef<LiveVideoPlayerHandle | null>(null)
      const volume = shallowRef(0.4)
      const muted = shallowRef(true)
      const ready = vi.fn()
      const played = vi.fn()
      const updated = vi.fn()
      const { container } = mount(
        defineComponent(
          () => () =>
            h(LiveVideoPlayer, {
              ref: player,
              media: HlsVideo,
              skin,
              title: 'Live event',
              volume: volume.value,
              muted: muted.value,
              onReady: ready,
              onPlay: played,
              'onUpdate:volume': updated,
            }),
        ),
      )
      await settle()
      expect(ready).toHaveBeenCalledWith(player.value)
      expect(player.value?.element?.localName).toBe('live-video-player')
      expect(player.value?.store?.title).toBe('Live event')
      const media = container.querySelector('hlsjs-video')!
      expect(player.value?.media).toBe(media)
      expect(media.volume).toBe(0.4)
      expect(player.value?.store?.muted).toBe(true)
      expect(player.value).not.toHaveProperty('setPlaybackRate')
      expect(player.value).not.toHaveProperty('selectVideoRendition')
      const packagedSkin = container.querySelector(
        'live-video-skin, live-video-neutral-skin',
      )!
      expect(
        packagedSkin.shadowRoot?.querySelector('media-live-button'),
      ).not.toBeNull()
      expect(
        packagedSkin.shadowRoot?.querySelector('media-time-slider'),
      ).toBeNull()
      volume.value = 0.6
      muted.value = false
      await settle()
      expect(player.value?.store?.volume).toBe(0.6)
      expect(player.value?.store?.muted).toBe(false)
      expect(updated).toHaveBeenLastCalledWith(0.6)
      const event = new Event('play')
      media.dispatchEvent(event)
      expect(played).toHaveBeenCalledWith(event)
    },
  )

  it('subscribes to live state and returns to the latest seekable end after the window moves', async () => {
    expect.hasAssertions()
    const player = shallowRef<LiveVideoPlayerHandle | null>(null)
    let readWindow: () => number | undefined = () =>
      player.value?.store?.targetLiveWindow
    const Probe = defineComponent({
      setup() {
        const window = useLiveVideoPlayerState(state => state.targetLiveWindow)
        const actions = useLiveVideoPlayerActions()
        readWindow = () => window.value
        return () => h('button', { onClick: () => actions.pause() }, 'Pause')
      },
    })
    const { container, unmount } = mount(
      defineComponent(
        () => () =>
          h(
            LiveVideoPlayerRoot,
            { ref: player },
            {
              default: () =>
                h(DefaultLiveVideoSkin, null, {
                  default: () => [
                    h(HlsVideo),
                    h(LiveButton, { class: 'jump' }),
                    h(Probe),
                  ],
                }),
            },
          ),
      ),
    )
    await settle()
    const handle = player.value!
    const media = container.querySelector('hlsjs-video')!
    const button = container.querySelector<HTMLElement>(
      'media-live-button.jump',
    )!
    expect(readWindow()).toBeNaN()
    expect(Object.hasOwn(button.dataset, 'disabled')).toBe(true)
    setLiveTimeline(media, { window: 0, end: 220, edge: 210 })
    await settle()
    expect(readWindow()).toBe(0)
    expect(handle.store?.seekable).toStrictEqual([
      [100, 150],
      [180, 220],
    ])
    expect(Object.hasOwn(button.dataset, 'live')).toBe(true)
    expect(Object.hasOwn(button.dataset, 'liveEdge')).toBe(false)
    // Update the moving window before clicking; the command must use the fresh range.
    setLiveTimeline(media, { window: Infinity, end: 260, edge: 250 })
    await settle()
    expect(readWindow()).toBe(Infinity)
    button.click()
    expect(media.currentTime).toBe(260)
    media.dispatchEvent(new Event('seeked'))
    await settle()
    expect(Object.hasOwn(button.dataset, 'liveEdge')).toBe(true)
    setLiveTimeline(media, { window: Number.NaN, end: 260, edge: Number.NaN })
    await settle()
    expect(Object.hasOwn(button.dataset, 'disabled')).toBe(true)
    expect(Object.hasOwn(button.dataset, 'live')).toBe(false)
    const oldTime = media.currentTime
    button.click()
    expect(media.currentTime).toBe(oldTime)
    unmount()
    disposals.pop()
    expect(handle.store).toBeNull()
    await expect(handle.play()).rejects.toThrow('not ready')
  })

  it('retains cached HLS, releases subscriptions while inactive, and destroys it on eviction', async () => {
    expect.hasAssertions()
    const player = shallowRef<LiveVideoPlayerHandle | null>(null)
    const visible = shallowRef(true)
    let readWindow: () => number | undefined = () =>
      player.value?.store?.targetLiveWindow
    const ready = vi.fn()
    const Cached = defineComponent(
      () => () =>
        h(LiveVideoPlayer, { ref: player, media: HlsVideo, onReady: ready }),
    )
    const { container, unmount } = mount(
      defineComponent({
        setup() {
          const window = useLiveVideoPlayerState(
            state => state.targetLiveWindow,
            player,
          )
          readWindow = () => window.value
          return () =>
            h(KeepAlive, null, {
              // oxlint-disable-next-line vitest/no-conditional-in-test -- Drives cache activation.
              default: () => (visible.value ? h(Cached) : h('div')),
            })
        },
      }),
    )
    await settle()
    const handle = player.value!
    const media = container.querySelector('hlsjs-video')!
    const destroy = vi.spyOn(media.adapter, 'destroy')
    setLiveTimeline(media, { window: 0, end: 220, edge: 210 })
    await settle()
    const unsubscribe = vi.fn()
    const subscribe = handle.store!.subscribe.bind(handle.store!)
    vi.spyOn(handle.store!, 'subscribe').mockImplementation(listener => {
      const stop = subscribe(listener)
      return () => {
        unsubscribe()
        stop()
      }
    })
    // Force the external selection to subscribe through the spy.
    player.value = null
    player.value = handle
    await handle.play()
    visible.value = false
    await settle()
    // oxlint-disable-next-line promise/avoid-new -- Wait beyond upstream's disconnected-frame destruction window.
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )
    expect(handle.store).toBeNull()
    expect(handle.media).toBeNull()
    expect(readWindow()).toBeUndefined()
    expect(unsubscribe).toHaveBeenCalledWith()
    expect(media.paused).toBe(true)
    expect(destroy).not.toHaveBeenCalled()
    await reconnectPlayer(() => {
      visible.value = true
    })
    expect(player.value?.media).toBe(media)
    expect(readWindow()).toBe(0)
    expect(ready).toHaveBeenCalledTimes(2)
    expect(media.paused).toBe(true)
    visible.value = false
    await settle()
    unmount()
    disposals.pop()
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(handle.store).toBeNull()
  })

  it('rebinds external action and state targets and preserves playback rejection causes', async () => {
    expect.hasAssertions()
    const first = shallowRef<LiveVideoPlayerHandle | null>(null)
    const second = shallowRef<LiveVideoPlayerHandle | null>(null)
    const target = shallowRef<LiveVideoPlayerHandle | null>(null)
    let actions: LiveVideoPlayerActions | undefined
    let readPaused: () => boolean | undefined = () =>
      target.value?.store?.paused
    mount(
      defineComponent({
        setup() {
          actions = useLiveVideoPlayerActions(target)
          const paused = useLiveVideoPlayerState(state => state.paused, target)
          readPaused = () => paused.value
          return () =>
            h('div', [
              h(LiveVideoPlayer, { ref: first }),
              h(LiveVideoPlayer, { ref: second }),
            ])
        },
      }),
    )
    await expect(actions!.play()).rejects.toThrow('not ready')
    await settle()
    expect(first.value?.store?.paused).toBe(true)
    target.value = first.value
    await actions!.play()
    expect(readPaused()).toBe(false)
    expect(second.value?.store?.paused).toBe(true)
    target.value = second.value
    expect(readPaused()).toBe(true)
    const reason = new DOMException('Permission denied', 'NotAllowedError')
    vi.spyOn(second.value!.media!, 'play').mockRejectedValueOnce(reason)
    await expect(actions!.play()).rejects.toBe(reason)
    target.value = null
    expect(readPaused()).toBeUndefined()
    expect(() => actions!.pause()).toThrow('not ready')
  })
})

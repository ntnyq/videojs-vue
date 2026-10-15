import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defineComponent, h, KeepAlive, shallowRef } from 'vue'
import { HlsVideo } from '../../../src/media/hls'
import type { PlayerHandle } from '../../../src/player/types'
import { VideoPlayer } from '../../../src/video/legacy'
import {
  cleanup,
  disposals,
  mount,
  settle,
  reconnectPlayer,
} from '../../helpers'

describe('legacy video player', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('exposes only the legacy skin with the existing player handle', () => {
    expect.assertions(0)
    expectTypeOf<
      InstanceType<typeof VideoPlayer>['$props']['skin']
    >().toEqualTypeOf<'legacy' | undefined>()
    expectTypeOf<InstanceType<typeof VideoPlayer>>().toExtend<PlayerHandle>()
    // @ts-expect-error This entry cannot select a modern skin.
    h(VideoPlayer, { skin: 'default' })
  })

  it('plays, mutes and changes speed through light-DOM controls and forwards settings', async () => {
    expect.hasAssertions()
    const player = shallowRef<PlayerHandle | null>(null)
    const played = vi.fn()
    const changed = vi.fn()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            VideoPlayer,
            {
              ref: player,
              src: '/movie.mp4',
              class: 'custom-skin',
              onPlay: played,
              'onUpdate:playbackRate': changed,
            },
            { poster: () => h('img', { src: '/poster.jpg' }) },
          ),
      ),
    )
    await settle()
    expect(
      container.querySelector(
        'video-skin, video-neutral-skin, video-compat-skin',
      ),
    ).toBeNull()
    expect(
      container.querySelector('.custom-skin')?.classList.contains('vjs-legacy'),
    ).toBe(true)
    expect(container.querySelector('.vjs-legacy__poster img')).not.toBeNull()
    const playButton =
      container.querySelector<HTMLElement>('media-play-button')!
    const muteButton =
      container.querySelector<HTMLElement>('media-mute-button')!
    const playIcon = playButton.querySelector('svg')?.outerHTML
    const volumeIcon = muteButton.querySelector('svg')?.outerHTML
    expect(playIcon).toBeDefined()
    expect(volumeIcon).toBeDefined()
    expect(muteButton.getAttribute('aria-label')).toBe('Mute')
    expect(muteButton.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
    container.querySelector<HTMLElement>('media-play-button')!.click()
    await settle()
    expect(player.value?.store?.paused).toBe(false)
    expect(played).toHaveBeenCalledTimes(1)
    expect(container.querySelector('.vjs-legacy__poster')).toBeNull()
    expect(playButton.querySelector('svg')?.outerHTML).not.toBe(playIcon)
    container.querySelector<HTMLElement>('media-mute-button')!.click()
    await settle()
    expect(player.value?.store?.muted).toBe(true)
    expect(muteButton.querySelector('svg')?.outerHTML).not.toBe(volumeIcon)
    expect(muteButton.getAttribute('aria-label')).toBe('Unmute')
    const mutedIcon = muteButton.querySelector('svg')?.outerHTML
    player.value!.media!.volume = 0
    player.value!.media!.muted = false
    await settle()
    expect(muteButton.querySelector('svg')?.outerHTML).toBe(mutedIcon)
    const select = container.querySelector('select')!
    select.value = '1.5'
    select.dispatchEvent(new Event('change', { bubbles: true }))
    await settle()
    expect(player.value?.media?.playbackRate).toBe(1.5)
    expect(changed).toHaveBeenLastCalledWith(1.5)
  })

  it('observes player width, disconnects while cached and restores controls on activation', async () => {
    expect.hasAssertions()
    const callbacks: ResizeObserverCallback[] = []
    const disconnect = vi.fn()
    const observe = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        // oxlint-disable-next-line promise/prefer-await-to-callbacks -- ResizeObserver takes a callback by contract.
        public constructor(callback: ResizeObserverCallback) {
          // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Simulate ResizeObserver notifications.
          callbacks.push(callback)
        }
        public observe = observe
        public disconnect = disconnect
        public unobserve = vi.fn()
      },
    )
    const visible = shallowRef(true)
    const player = shallowRef<PlayerHandle | null>(null)
    const { container, unmount } = mount(
      defineComponent(
        () => () =>
          h(KeepAlive, null, {
            default: () =>
              // oxlint-disable-next-line vitest/no-conditional-in-test -- Exercise cache activation.
              visible.value ? h(VideoPlayer, { ref: player }) : h('div'),
          }),
      ),
    )
    await settle()
    const surface = container.querySelector<HTMLElement>(
      '.vjs-legacy__surface',
    )!
    const skin = container.querySelector<HTMLElement>('.vjs-legacy')!
    // The skin observer watches the surface; upstream slider observers watch their own elements.
    const index = observe.mock.calls.findLastIndex(call => call[0] === surface)
    const resize = callbacks[index]!
    resize(
      [{ contentRect: { width: 800 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    )
    await settle()
    expect(skin.dataset['size']).toBe('large')
    resize(
      [{ contentRect: { width: 320 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    )
    await settle()
    expect(skin.dataset['size']).toBe('small')
    const handle = player.value!
    disconnect.mockClear()
    visible.value = false
    await settle()
    expect(disconnect).toHaveBeenCalledWith()
    expect(handle.store).toBeNull()
    await reconnectPlayer(() => {
      visible.value = true
    })
    container.querySelector<HTMLElement>('media-play-button')!.click()
    await settle()
    expect(handle.store?.paused).toBe(false)
    unmount()
    disposals.pop()
    expect(handle.store).toBeNull()
  })

  it('supports the optional HLS media adapter', async () => {
    expect.hasAssertions()
    const player = shallowRef<PlayerHandle | null>(null)
    const { container } = mount(
      defineComponent(
        () => () =>
          h(VideoPlayer, {
            ref: player,
            media: HlsVideo,
            muted: true,
            playbackRate: 1.5,
          }),
      ),
    )
    await settle()
    expect(player.value?.media).toBe(container.querySelector('hlsjs-video'))
    expect(player.value?.store?.muted).toBe(true)
    expect(player.value?.store?.playbackRate).toBe(1.5)
  })
})

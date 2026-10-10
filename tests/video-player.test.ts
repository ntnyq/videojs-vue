import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import { VideoPlayer } from '../src'
import type { PlayerHandle, PlayerState } from '../src'
import { mount, settle, cleanup } from './helpers'

describe('video player component', () => {
  afterEach(cleanup)

  it('keeps real upstream state types', () => {
    expect.assertions(0)
    expectTypeOf<
      InstanceType<typeof VideoPlayer>
    >().toMatchTypeOf<PlayerHandle>()
    expectTypeOf<PlayerState['paused']>().toEqualTypeOf<boolean>()
    expectTypeOf<PlayerState['currentTime']>().toEqualTypeOf<number>()
  })

  it('registers elements, attaches native media, forwards original events and exposes actions', async () => {
    expect.hasAssertions()
    const player = shallowRef<PlayerHandle | null>(null)
    const ready = vi.fn()
    const played = vi.fn()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(VideoPlayer, {
            ref: player,
            src: '/movie.mp4',
            title: 'Video title',
            onReady: ready,
            onPlay: played,
            class: 'visible-surface',
          }),
      ),
    )
    await settle()
    expect(ready).toHaveBeenCalledTimes(1)
    expect(player.value?.store?.title).toBe('Video title')
    expect(player.value?.media).toBe(container.querySelector('video'))
    expect(player.value?.store?.paused).toBe(true)
    expect(container.querySelector('video-skin')?.className).toBe(
      'visible-surface',
    )
    const media = container.querySelector('video')!
    const event = new Event('play')
    media.dispatchEvent(event)
    expect(played).toHaveBeenCalledWith(event)
    await player.value?.play()
    expect(player.value?.store?.paused).toBe(false)
    player.value?.pause()
    expect(player.value?.store?.paused).toBe(true)
  })

  it('updates props and confirms settings without a feedback loop', async () => {
    expect.hasAssertions()
    const src = shallowRef('/first.mp4')
    const volume = shallowRef(0.5)
    const muted = shallowRef(false)
    const rate = shallowRef(1)
    const changed = vi.fn((value: number) => {
      volume.value = value
    })
    const { container } = mount(
      defineComponent(
        () => () =>
          h(VideoPlayer, {
            src: src.value,
            volume: volume.value,
            muted: muted.value,
            playbackRate: rate.value,
            'onUpdate:volume': changed,
            tracks: [{ src: '/captions.vtt', kind: 'captions', srclang: 'en' }],
          }),
      ),
    )
    await settle()
    const media = container.querySelector('video')!
    expect(media.volume).toBe(0.5)
    src.value = '/second.mp4'
    volume.value = 0.8
    muted.value = true
    rate.value = 1.5
    await settle()
    expect(media.getAttribute('src')).toBe('/second.mp4')
    expect(media.volume).toBe(0.8)
    expect(media.muted).toBe(true)
    expect(media.playbackRate).toBe(1.5)
    expect(media.querySelector('track')?.getAttribute('src')).toBe(
      '/captions.vtt',
    )
    changed.mockClear()
    media.volume = 0.3
    await settle()
    expect(volume.value).toBe(0.3)
    expect(changed).toHaveBeenCalledTimes(1)
  })

  it('preserves skin sizing with styles and maps supported poster slots', async () => {
    expect.hasAssertions()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            VideoPlayer,
            {
              style: { borderRadius: '12px' },
            },
            { poster: () => h('img', { src: '/poster.jpg', alt: 'Preview' }) },
          ),
      ),
    )
    await settle()
    const skin = container.querySelector('video-skin')!
    expect(skin.style.aspectRatio).toBe('16 / 9')
    expect(skin.style.borderRadius).toBe('12px')
    expect(skin.querySelector('img')?.getAttribute('slot')).toBe('poster')
  })
})

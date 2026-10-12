import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import {
  AudioPlayer,
  AudioPlayerRoot,
  Audio,
  useAudioPlayerActions,
  useAudioPlayerState,
} from '../src/audio'
import type { AudioPlayerHandle, AudioPlayerState } from '../src/audio'
import { mount, settle, cleanup } from './helpers'

describe('audio player component', () => {
  afterEach(cleanup)

  it('keeps real upstream state types', () => {
    expect.assertions(0)
    expectTypeOf<
      InstanceType<typeof AudioPlayer>
    >().toExtend<AudioPlayerHandle>()
    expectTypeOf<AudioPlayerState['paused']>().toEqualTypeOf<boolean>()
    expectTypeOf<AudioPlayerState['currentTime']>().toEqualTypeOf<number>()
    expectTypeOf<AudioPlayerHandle>().not.toHaveProperty('requestFullscreen')
    expectTypeOf<AudioPlayerState>().not.toHaveProperty('fullscreen')
  })

  it('registers only the audio preset and skins', () => {
    expect.hasAssertions()
    expect(customElements.get('audio-player')).toBeDefined()
    expect(customElements.get('audio-skin')).toBeDefined()
    expect(customElements.get('audio-neutral-skin')).toBeDefined()
    expect(customElements.get('video-player')).toBeUndefined()
    expect(customElements.get('video-skin')).toBeUndefined()
    expect(customElements.get('hlsjs-video')).toBeUndefined()
  })

  it('registers elements, attaches native media, forwards original events and exposes actions', async () => {
    expect.hasAssertions()
    const player = shallowRef<AudioPlayerHandle | null>(null)
    const ready = vi.fn()
    const played = vi.fn()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(AudioPlayer, {
            ref: player,
            src: '/movie.mp3',
            title: 'Audio episode',
            poster: '/cover.jpg',
            onReady: ready,
            onPlay: played,
            class: 'visible-surface',
          }),
      ),
    )
    await settle()
    expect(ready).toHaveBeenCalledTimes(1)
    expect(player.value?.media).toBe(container.querySelector('audio'))
    expect(player.value?.store?.paused).toBe(true)
    expect(player.value?.store?.title).toBe('Audio episode')
    expect(player.value?.store?.poster).toBe('/cover.jpg')
    expect(player.value).not.toHaveProperty('requestFullscreen')
    expect(player.value).not.toHaveProperty('requestPictureInPicture')
    expect(container.querySelector('audio')?.hasAttribute('poster')).toBe(false)
    expect(container.querySelector('audio')?.hasAttribute('playsinline')).toBe(
      false,
    )
    expect(container.querySelector('audio')?.hasAttribute('keep-alive')).toBe(
      false,
    )
    expect(container.querySelector('audio-skin')?.className).toBe(
      'visible-surface',
    )
    const media = container.querySelector('audio')!
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
    const src = shallowRef('/first.mp3')
    const volume = shallowRef(0.5)
    const muted = shallowRef(false)
    const rate = shallowRef(1)
    const changed = vi.fn((value: number) => {
      volume.value = value
    })
    const { container } = mount(
      defineComponent(
        () => () =>
          h(AudioPlayer, {
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
    const media = container.querySelector('audio')!
    expect(media.volume).toBe(0.5)
    src.value = '/second.mp3'
    volume.value = 0.8
    muted.value = true
    rate.value = 1.5
    await settle()
    expect(media.getAttribute('src')).toBe('/second.mp3')
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
            AudioPlayer,
            {
              style: { borderRadius: '12px' },
            },
            { poster: () => h('img', { src: '/poster.jpg', alt: 'Preview' }) },
          ),
      ),
    )
    await settle()
    const skin = container.querySelector('audio-skin')!
    expect(skin.style.aspectRatio).toBe('')
    expect(skin.style.borderRadius).toBe('12px')
    expect(skin.querySelector('img')?.getAttribute('slot')).toBe('poster')
  })

  it('provides audio state and actions to descendants and forwards source children', async () => {
    expect.hasAssertions()
    const rootPlayed = vi.fn()
    const mediaPlayed = vi.fn()
    const Controls = defineComponent({
      setup() {
        const paused = useAudioPlayerState(state => state.paused)
        const actions = useAudioPlayerActions()
        return () =>
          h('button', { onClick: () => actions.play() }, String(paused.value))
      },
    })
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            AudioPlayerRoot,
            { onPlay: rootPlayed },
            {
              default: () => [
                h(
                  Audio,
                  { controls: true, onPlay: mediaPlayed },
                  {
                    default: () =>
                      h('source', { src: '/episode.ogg', type: 'audio/ogg' }),
                  },
                ),
                h(Controls),
              ],
            },
          ),
      ),
    )
    await settle()
    const media = container.querySelector('audio')!
    expect(media.controls).toBe(true)
    expect(media.querySelector('source')?.getAttribute('src')).toBe(
      '/episode.ogg',
    )
    expect(container.querySelector('button')?.textContent).toBe('true')
    container.querySelector('button')!.click()
    await settle()
    expect(container.querySelector('button')?.textContent).toBe('false')
    expect(rootPlayed).toHaveBeenCalledTimes(1)
    expect(mediaPlayed).toHaveBeenCalledTimes(1)
    expect(rootPlayed.mock.calls[0]?.[0]).toBe(mediaPlayed.mock.calls[0]?.[0])
  })

  it('switches skins and forwards native source children without duplicate listeners', async () => {
    expect.hasAssertions()
    const skin = shallowRef<'default' | 'neutral'>('default')
    const player = shallowRef<AudioPlayerHandle | null>(null)
    const played = vi.fn()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            AudioPlayer,
            {
              ref: player,
              skin: skin.value,
              onPlay: played,
            },
            {
              default: () =>
                h('source', { src: '/episode.mp3', type: 'audio/mpeg' }),
            },
          ),
      ),
    )
    await settle()
    const previous = container.querySelector('audio')!
    skin.value = 'neutral'
    await settle()
    const media = container.querySelector('audio')!
    expect(media).not.toBe(previous)
    expect(container.querySelector('audio-neutral-skin')).not.toBeNull()
    expect(media.querySelector('source')?.getAttribute('src')).toBe(
      '/episode.mp3',
    )
    expect(player.value?.media).toBe(media)
    previous.dispatchEvent(new Event('play'))
    expect(played).not.toHaveBeenCalled()
    await player.value!.play()
    expect(played).toHaveBeenCalledTimes(1)
    expect(player.value?.store?.paused).toBe(false)
  })
})

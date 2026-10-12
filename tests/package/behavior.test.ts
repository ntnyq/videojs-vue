import { VideoPlayer } from 'videojs-vue'
import {
  useAudioPlayerActions,
  useAudioPlayerState,
} from 'videojs-vue/audio/composables'
import { AudioPlayerRoot, Audio } from 'videojs-vue/audio/core'
import type { AudioPlayerHandle } from 'videojs-vue/audio/core'
import { AudioPlayer as DefaultAudioPlayer } from 'videojs-vue/audio/default'
import { AudioPlayer as NeutralAudioPlayer } from 'videojs-vue/audio/neutral'
import { usePlayerActions, usePlayerState } from 'videojs-vue/composables'
import { PlayerRoot, Video } from 'videojs-vue/core'
import type { PlayerHandle } from 'videojs-vue/core'
import { VideoPlayer as CompatVideoPlayer } from 'videojs-vue/video/compat'
import type { VideoMediaComponent } from 'videojs-vue/video/compat'
import { VideoPlayer as DefaultVideoPlayer } from 'videojs-vue/video/default'
import { VideoPlayer as NeutralVideoPlayer } from 'videojs-vue/video/neutral'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defineComponent, h, KeepAlive, shallowRef } from 'vue'
import type { Component } from 'vue'
import { cleanup, disposals, mount, settle } from '../helpers'

describe('published package', () => {
  afterEach(cleanup)

  it('keeps fixed skin and exposed handle types', () => {
    expect.assertions(0)
    h(CompatVideoPlayer, { skin: 'compat' })
    // @ts-expect-error A fixed compat player cannot select the default skin.
    h(CompatVideoPlayer, { skin: 'default' })
    // @ts-expect-error A fixed default player cannot select the compat skin.
    h(DefaultVideoPlayer, { skin: 'compat' })
    // @ts-expect-error The aggregate player still selects default or neutral.
    h(VideoPlayer, { skin: 'compat' })
    expectTypeOf<
      InstanceType<typeof VideoPlayer>['$props']['skin']
    >().toEqualTypeOf<'default' | 'neutral' | undefined>()
    expectTypeOf<
      InstanceType<typeof CompatVideoPlayer>['$props']['skin']
    >().toEqualTypeOf<'compat' | undefined>()
    expectTypeOf<
      InstanceType<typeof CompatVideoPlayer>
    >().toExtend<PlayerHandle>()
    expectTypeOf<VideoMediaComponent>().toEqualTypeOf<typeof Video>()
    // @ts-expect-error A fixed default player cannot select a neutral skin.
    h(DefaultVideoPlayer, { skin: 'neutral' })
    // @ts-expect-error A fixed neutral audio player cannot select the default skin.
    h(NeutralAudioPlayer, { skin: 'default' })
    expectTypeOf<
      InstanceType<typeof DefaultVideoPlayer>['$props']['skin']
    >().toEqualTypeOf<'default' | undefined>()
    expectTypeOf<
      InstanceType<typeof NeutralVideoPlayer>['$props']['skin']
    >().toEqualTypeOf<'neutral' | undefined>()
    expectTypeOf<
      InstanceType<typeof DefaultAudioPlayer>['$props']['skin']
    >().toEqualTypeOf<'default' | undefined>()
    expectTypeOf<
      InstanceType<typeof NeutralAudioPlayer>['$props']['skin']
    >().toEqualTypeOf<'neutral' | undefined>()
    expectTypeOf<
      InstanceType<typeof DefaultVideoPlayer>
    >().toExtend<PlayerHandle>()
    expectTypeOf<
      InstanceType<typeof DefaultAudioPlayer>
    >().toExtend<AudioPlayerHandle>()
  })

  describe.each([
    {
      name: 'video',
      Root: PlayerRoot,
      Media: Video,
      state: usePlayerState,
      actions: usePlayerActions,
    },
    {
      name: 'audio',
      Root: AudioPlayerRoot,
      Media: Audio,
      state: useAudioPlayerState,
      actions: useAudioPlayerActions,
    },
  ])('$name cross-entry context', ({ Root, Media, state, actions }) => {
    it('shares injected state and commands with media binding and cleans up', async () => {
      expect.hasAssertions()
      const player = shallowRef<PlayerHandle | AudioPlayerHandle | null>(null)
      const Child = defineComponent({
        setup() {
          const paused = state(snapshot => snapshot.paused)
          const commands = actions()
          return () =>
            h(
              'button',
              { onClick: () => commands.play() },
              String(paused.value),
            )
        },
      })
      const { container, unmount } = mount(
        defineComponent(
          () => () =>
            h(Root, { ref: player }, { default: () => [h(Media), h(Child)] }),
        ),
      )
      await settle()
      expect(player.value?.media).toBe(container.querySelector('video, audio'))
      expect(container.querySelector('button')?.textContent).toBe('true')
      container.querySelector('button')?.click()
      await settle()
      expect(container.querySelector('button')?.textContent).toBe('false')
      const handle = player.value!
      unmount()
      disposals.pop()
      expect(handle.store).toBeNull()
      expect(handle.media).toBeNull()
    })
  })

  describe.each<{ name: string; Player: Component; tag: string }>([
    {
      name: 'compat video',
      Player: CompatVideoPlayer,
      tag: 'video-compat-skin',
    },
    { name: 'default video', Player: DefaultVideoPlayer, tag: 'video-skin' },
    {
      name: 'neutral video',
      Player: NeutralVideoPlayer,
      tag: 'video-neutral-skin',
    },
    { name: 'default audio', Player: DefaultAudioPlayer, tag: 'audio-skin' },
    {
      name: 'neutral audio',
      Player: NeutralAudioPlayer,
      tag: 'audio-neutral-skin',
    },
  ])('$name published component', ({ Player, tag }) => {
    it('forwards events, props, slots and handles through KeepAlive and disposal', async () => {
      expect.hasAssertions()
      const player = shallowRef<PlayerHandle | AudioPlayerHandle | null>(null)
      const visible = shallowRef(true)
      const volume = shallowRef(0.4)
      const played = vi.fn()
      const updated = vi.fn()
      const ready = vi.fn()
      const { container, unmount } = mount(
        defineComponent(
          () => () =>
            h(KeepAlive, null, {
              default: () =>
                // oxlint-disable-next-line vitest/no-conditional-in-test
                visible.value
                  ? h(
                      Player,
                      {
                        ref: player,
                        volume: volume.value,
                        title: 'Published',
                        onPlay: played,
                        onReady: ready,
                        'onUpdate:volume': updated,
                      },
                      {
                        poster: () => h('img', { src: '/poster.jpg' }),
                        thumbnail: () => h('img', { src: '/thumbnail.jpg' }),
                      },
                    )
                  : h('div'),
            }),
        ),
      )
      await settle()
      const handle = player.value!
      const media = handle.media!
      expect(handle.store?.title).toBe('Published')
      expect(media.volume).toBe(0.4)
      expect(container.querySelector(`${tag} img`)?.getAttribute('slot')).toBe(
        'poster',
      )
      volume.value = 0.7
      await settle()
      expect(media.volume).toBe(0.7)
      media.volume = 0.2
      await settle()
      expect(updated).toHaveBeenLastCalledWith(0.2)
      const event = new Event('play')
      media.dispatchEvent(event)
      expect(played).toHaveBeenCalledWith(event)
      await handle.play()
      visible.value = false
      await settle()
      expect(media.paused).toBe(true)
      expect(handle.store).toBeNull()
      visible.value = true
      await settle()
      expect(handle.store).not.toBeNull()
      expect(ready).toHaveBeenCalledTimes(2)
      unmount()
      disposals.pop()
      expect(handle.store).toBeNull()
      played.mockClear()
      media.dispatchEvent(event)
      expect(played).not.toHaveBeenCalled()
    })
  })
})

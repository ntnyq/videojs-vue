import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createSSRApp,
  defineComponent,
  Fragment,
  h,
  KeepAlive,
  onErrorCaptured,
  shallowRef,
} from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  VideoPlayerRoot,
  Video,
  VideoPlayer,
  DefaultVideoSkin,
} from '../../../src'
import type { VideoPlayerHandle } from '../../../src'
import {
  Audio,
  AudioPlayer,
  AudioPlayerRoot,
  DefaultAudioSkin,
} from '../../../src/audio'
import type { AudioPlayerHandle } from '../../../src/audio'
import {
  LiveVideoPlayer,
  LiveVideoPlayerRoot,
  DefaultLiveVideoSkin,
} from '../../../src/live'
import type { LiveVideoPlayerHandle } from '../../../src/live'
import { HlsVideo } from '../../../src/media/hls'
import { MediaContainer, PlayButton } from '../../../src/ui'
import {
  cleanup,
  disposals,
  mount,
  settle,
  reconnectPlayer,
} from '../../helpers'

async function flushDestruction() {
  // oxlint-disable-next-line promise/avoid-new -- Wait for the real browser frame lifecycle.
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
  await settle()
}

describe('player contracts', () => {
  afterEach(cleanup)

  describe.each<{
    name: string
    Player: Component
    Root: Component
    Media: Component
    Skin: Component
    tag: string
  }>([
    {
      name: 'video',
      Player: VideoPlayer,
      Root: VideoPlayerRoot,
      Media: Video,
      Skin: DefaultVideoSkin,
      tag: 'video-skin',
    },
    {
      name: 'live',
      Player: LiveVideoPlayer,
      Root: LiveVideoPlayerRoot,
      Media: Video,
      Skin: DefaultLiveVideoSkin,
      tag: 'live-video-skin',
    },
    {
      name: 'audio',
      Player: AudioPlayer,
      Root: AudioPlayerRoot,
      Media: Audio,
      Skin: DefaultAudioSkin,
      tag: 'audio-skin',
    },
  ])('$name', ({ Player, Root, Media, Skin, tag }) => {
    it('retains individually cached controls until their actual eviction', async () => {
      expect.hasAssertions()
      const Panel = defineComponent(() => () => h('div', [h(PlayButton)]))
      const Other = defineComponent(() => () => h('p', 'Other panel'))
      const Third = defineComponent(() => () => h('p', 'Third panel'))
      const content = shallowRef<Component>(Panel)
      const { container, unmount } = mount(
        defineComponent(
          () => () =>
            h(Root, null, {
              default: () =>
                h(MediaContainer, null, {
                  default: () => [
                    h(Media),
                    h(
                      KeepAlive,
                      { max: 2 },
                      {
                        default: () => h(content.value),
                      },
                    ),
                  ],
                }),
            }),
        ),
      )
      await settle()
      const button = container.querySelector('media-play-button')!
      const destroy = vi.spyOn(button, 'destroy')
      content.value = Other
      await settle()
      await flushDestruction()
      expect(destroy).not.toHaveBeenCalled()
      content.value = Panel
      await settle()
      expect(container.querySelector('media-play-button')).toBe(button)
      button.click()
      await settle()
      expect(
        container.querySelector<HTMLMediaElement>('video, audio')!.paused,
      ).toBe(false)
      content.value = Other
      await settle()
      content.value = Third
      await settle()
      await flushDestruction()
      expect(destroy).toHaveBeenCalledTimes(1)
      unmount()
      disposals.pop()
      await flushDestruction()
      expect(destroy).toHaveBeenCalledTimes(1)
    })

    it('retains individually cached skins and their shadow controls', async () => {
      expect.hasAssertions()
      const CachedSkin = defineComponent(
        () => () =>
          h(Skin, null, {
            default: () => h(Media),
          }),
      )
      const content = shallowRef<Component>(CachedSkin)
      const { container, unmount } = mount(
        defineComponent(
          () => () =>
            h(Root, null, {
              default: () =>
                h(KeepAlive, null, {
                  default: () => h(content.value),
                }),
            }),
        ),
      )
      await settle()
      const skin = container.querySelector(tag)!
      const button = skin.shadowRoot!.querySelector('media-play-button')!
      const destroy = vi.spyOn(button, 'destroy')
      content.value = defineComponent(() => () => h('p', 'Cached'))
      await settle()
      await flushDestruction()
      expect(destroy).not.toHaveBeenCalled()
      await reconnectPlayer(() => {
        content.value = CachedSkin
      })
      expect(container.querySelector(tag)).toBe(skin)
      button.click()
      await settle()
      expect(
        container.querySelector<HTMLMediaElement>('video, audio')!.paused,
      ).toBe(false)
      unmount()
      disposals.pop()
      await flushDestruction()
      expect(destroy).toHaveBeenCalledTimes(1)
    })

    it('pauses and unregisters independently cached media, then restores it without autoplay', async () => {
      expect.hasAssertions()
      const visible = shallowRef(true)
      const volume = shallowRef(0.4)
      const played = vi.fn()
      const player = shallowRef<
        VideoPlayerHandle | AudioPlayerHandle | LiveVideoPlayerHandle | null
      >(null)
      const Cached = defineComponent(
        () => () => h(Media, { onPlay: played, volume: volume.value }),
      )
      mount(
        defineComponent(
          () => () =>
            h(
              Root,
              { ref: player },
              {
                default: () =>
                  h(MediaContainer, null, {
                    default: () =>
                      h(KeepAlive, null, {
                        // oxlint-disable-next-line vitest/no-conditional-in-test -- Drives the adapter's independent cache.
                        default: () => (visible.value ? h(Cached) : h('div')),
                      }),
                  }),
              },
            ),
        ),
      )
      await settle()
      const media = player.value!.media!
      await player.value!.play()
      const pause = vi.spyOn(media, 'pause')
      const { store } = player.value!
      visible.value = false
      await settle()
      expect(pause).toHaveBeenCalledWith()
      expect(media.paused).toBe(true)
      expect(player.value!.media).toBeNull()
      expect(player.value!.store).toBe(store)
      volume.value = 0.8
      await settle()
      expect(media.volume).toBe(0.4)
      played.mockClear()
      media.dispatchEvent(new Event('play'))
      expect(played).not.toHaveBeenCalled()
      await reconnectPlayer(() => {
        visible.value = true
      })
      expect(player.value!.media).toBe(media)
      expect(media.paused).toBe(true)
      expect(media.volume).toBe(0.8)
      await player.value!.play()
      expect(played).toHaveBeenCalledTimes(1)
    })

    it.each(['immediate', 'after removal'])(
      'applies settings to replacement media %s before the upstream target catches up',
      async mode => {
        expect.hasAssertions()
        const revision = shallowRef<number | null>(0)
        const errors: unknown[] = []
        const player = shallowRef<
          VideoPlayerHandle | AudioPlayerHandle | LiveVideoPlayerHandle | null
        >(null)
        const { container } = mount(
          defineComponent({
            setup() {
              // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Vue's error capture hook receives the actual child watcher failure.
              onErrorCaptured(error => {
                errors.push(error)
                return false
              })
              return () =>
                h(
                  Root,
                  { ref: player },
                  {
                    default: () =>
                      h(MediaContainer, null, {
                        default: () =>
                          // oxlint-disable-next-line vitest/no-conditional-in-test -- Exercises both direct replacement and an async resolver gap.
                          revision.value === null
                            ? null
                            : h(Media, {
                                key: revision.value,
                                src: `/${revision.value}.mp4`,
                                volume: 0.3,
                                muted: true,
                                playbackRate: 1.5,
                              }),
                      }),
                  },
                )
            },
          }),
        )
        await settle()
        const original = player.value!.media!
        const root = player.value!.element
        // oxlint-disable-next-line vitest/no-conditional-in-test -- An async resolver can leave the root without media between selections.
        if (mode === 'after removal') {
          revision.value = null
          await settle()
        }
        revision.value = 1
        await settle()
        const replacement =
          container.querySelector<HTMLMediaElement>('video, audio')!
        expect(errors).toStrictEqual([])
        expect(player.value!.element).toBe(root)
        expect(player.value!.media).toBe(replacement)
        expect(replacement).not.toBe(original)
        expect(replacement.volume).toBe(0.3)
        expect(replacement.muted).toBe(true)
        expect(replacement.playbackRate).toBe(1.5)
        expect(player.value!.store!.volume).toBe(0.3)
        expect(player.value!.store!.muted).toBe(true)
      },
    )

    it.each(['packaged', 'composed'])(
      'keeps %s controls and metadata live after a long cache',
      async mode => {
        expect.hasAssertions()
        const visible = shallowRef(true)
        const title = shallowRef('Before')
        const player = shallowRef<
          VideoPlayerHandle | AudioPlayerHandle | LiveVideoPlayerHandle | null
        >(null)
        const ready = vi.fn()
        const Cached = defineComponent(
          () => () =>
            // oxlint-disable-next-line vitest/no-conditional-in-test -- Selects the parameterized component fixture.
            mode === 'packaged'
              ? h(Player, { ref: player, title: title.value, onReady: ready })
              : h(
                  Root,
                  { ref: player, title: title.value, onReady: ready },
                  {
                    default: () =>
                      h(MediaContainer, null, {
                        default: () => [h(Media), h(PlayButton)],
                      }),
                  },
                ),
        )
        const { container, unmount } = mount(
          defineComponent(
            () => () =>
              h(KeepAlive, null, {
                // oxlint-disable-next-line vitest/no-conditional-in-test -- Drives KeepAlive activation.
                default: () => (visible.value ? h(Cached) : h('div')),
              }),
          ),
        )
        await settle()
        const handle = player.value!
        const root = handle.element!
        const button =
          // oxlint-disable-next-line vitest/no-conditional-in-test -- Composed controls use light DOM; skin controls use shadow DOM.
          container.querySelector('media-play-button') ??
          container
            .querySelector(tag)!
            .shadowRoot!.querySelector('media-play-button')!
        const destroyRoot = vi.spyOn(root, 'destroy')
        const destroyButton = vi.spyOn(button, 'destroy')
        visible.value = false
        await settle()
        await flushDestruction()
        expect(handle.store).toBeNull()
        expect(destroyRoot).not.toHaveBeenCalled()
        expect(destroyButton).not.toHaveBeenCalled()
        await reconnectPlayer(() => {
          visible.value = true
        })
        expect(handle.store?.target?.container?.isConnected).toBe(true)
        title.value = 'After'
        await settle()
        expect(handle.store?.title).toBe('After')
        button.click()
        await settle()
        expect(handle.store?.paused).toBe(false)
        expect(ready).toHaveBeenCalledTimes(2)
        visible.value = false
        await settle()
        await flushDestruction()
        unmount()
        disposals.pop()
        await flushDestruction()
        expect(destroyRoot).toHaveBeenCalledTimes(1)
        expect(destroyButton).toHaveBeenCalledTimes(1)
      },
    )

    it('preserves mute when relinquishing the binding, then accepts explicit values', async () => {
      expect.hasAssertions()
      const muted = shallowRef<boolean | undefined>(true)
      const player = shallowRef<
        VideoPlayerHandle | AudioPlayerHandle | LiveVideoPlayerHandle | null
      >(null)
      const updated = vi.fn()
      mount(
        defineComponent(
          () => () =>
            h(Player, {
              ref: player,
              muted: muted.value,
              'onUpdate:muted': updated,
            }),
        ),
      )
      await settle()
      updated.mockClear()
      muted.value = undefined
      await settle()
      expect(player.value?.media?.muted).toBe(true)
      expect(player.value?.store?.muted).toBe(true)
      expect(updated).not.toHaveBeenCalled()
      muted.value = false
      await settle()
      expect(player.value?.media?.muted).toBe(false)
      expect(updated).toHaveBeenLastCalledWith(false)
    })

    it('forwards nested keyed fragment posters and preserves identity when reordered', async () => {
      expect.hasAssertions()
      const items = shallowRef(['first', 'second'])
      const { container } = mount(
        defineComponent(
          () => () =>
            h(Player, null, {
              poster: () =>
                h(Fragment, null, [
                  h(
                    Fragment,
                    { key: 'images' },
                    items.value.map(key =>
                      h('img', { key, src: `/${key}.jpg` }),
                    ),
                  ),
                ]),
            }),
        ),
      )
      await settle()
      const images = [...container.querySelectorAll('img')]
      expect(images.map(image => image.getAttribute('slot'))).toStrictEqual([
        'poster',
        'poster',
      ])
      items.value = ['second', 'first']
      await settle()
      expect([...container.querySelectorAll('img')]).toStrictEqual(
        images.toReversed(),
      )
    })

    it('hydrates muted media and fragment posters without losing their state', async () => {
      expect.hasAssertions()
      const muted = shallowRef<boolean | undefined>(true)
      const player = shallowRef<
        VideoPlayerHandle | AudioPlayerHandle | LiveVideoPlayerHandle | null
      >(null)
      const Fixture = defineComponent(
        () => () =>
          h(
            Player,
            { ref: player, muted: muted.value },
            {
              poster: () =>
                h(Fragment, null, [h('img', { src: '/poster.jpg' })]),
            },
          ),
      )
      const container = document.createElement('div')
      container.innerHTML = await renderToString(createSSRApp(Fixture))
      expect(
        container.querySelector('video, audio')?.hasAttribute('muted'),
      ).toBe(true)
      expect(container.querySelector('img')?.getAttribute('slot')).toBe(
        'poster',
      )
      document.body.append(container)
      const app = createSSRApp(Fixture)
      app.mount(container)
      disposals.push(() => {
        app.unmount()
        container.remove()
      })
      await settle()
      muted.value = undefined
      await settle()
      expect(player.value?.media?.muted).toBe(true)
      expect(player.value?.store?.muted).toBe(true)
      expect(container.querySelector('img')?.getAttribute('slot')).toBe(
        'poster',
      )
    })
  })

  it('forwards fragment thumbnails', async () => {
    expect.hasAssertions()
    const { container } = mount(
      defineComponent(
        () => () =>
          h(VideoPlayer, null, {
            thumbnail: () =>
              h(Fragment, null, [h('img', { src: '/thumbnail.jpg' })]),
          }),
      ),
    )
    await settle()
    expect(container.querySelector('img')?.getAttribute('slot')).toBe(
      'thumbnail',
    )
  })

  it('preserves HLS mute when its binding is removed', async () => {
    expect.hasAssertions()
    const muted = shallowRef<boolean | undefined>(true)
    const player = shallowRef<VideoPlayerHandle | null>(null)
    mount(
      defineComponent(
        () => () =>
          h(VideoPlayer, { ref: player, media: HlsVideo, muted: muted.value }),
      ),
    )
    await settle()
    muted.value = undefined
    await settle()
    expect(player.value?.media?.muted).toBe(true)
    expect(player.value?.store?.muted).toBe(true)
  })

  it('preserves added shadow controls and disposes removed ones', async () => {
    expect.hasAssertions()
    const content = shallowRef<Component>(VideoPlayer)
    const { container, unmount } = mount(
      defineComponent(
        () => () => h(KeepAlive, null, { default: () => h(content.value) }),
      ),
    )
    await settle()
    const shadow = container.querySelector('video-skin')!.shadowRoot!
    const removed = document.createElement('media-play-button')
    shadow.append(removed)
    await settle()
    const destroyRemoved = vi.spyOn(removed, 'destroy')
    removed.remove()
    await settle()
    await flushDestruction()
    expect(destroyRemoved).toHaveBeenCalledTimes(1)

    const added = document.createElement('media-play-button')
    shadow.append(added)
    await settle()
    const destroyAdded = vi.spyOn(added, 'destroy')
    content.value = defineComponent(() => () => h('p', 'Cached'))
    await settle()
    await flushDestruction()
    expect(destroyAdded).not.toHaveBeenCalled()
    await reconnectPlayer(() => {
      content.value = VideoPlayer
    })
    added.click()
    await settle()
    expect(container.querySelector('video')!.paused).toBe(false)
    unmount()
    disposals.pop()
    await flushDestruction()
    expect(destroyAdded).toHaveBeenCalledTimes(1)
    expect(destroyRemoved).toHaveBeenCalledTimes(1)
  })

  it('destroys a cached player and its shadow controls when evicted', async () => {
    expect.hasAssertions()
    const content = shallowRef<Component>(VideoPlayer)
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            KeepAlive,
            { max: 2 },
            {
              default: () => h(content.value),
            },
          ),
      ),
    )
    await settle()
    const root = container.querySelector('video-player')!
    const button = container
      .querySelector('video-skin')!
      .shadowRoot!.querySelector('media-play-button')!
    const destroyRoot = vi.spyOn(root, 'destroy')
    const destroyButton = vi.spyOn(button, 'destroy')
    content.value = defineComponent(() => () => h('p', 'Second'))
    await settle()
    await flushDestruction()
    expect(destroyRoot).not.toHaveBeenCalled()
    content.value = defineComponent(() => () => h('p', 'Third'))
    await settle()
    await flushDestruction()
    expect(destroyRoot).toHaveBeenCalledTimes(1)
    expect(destroyButton).toHaveBeenCalledTimes(1)
  })
})

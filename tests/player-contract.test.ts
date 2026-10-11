import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createSSRApp,
  defineComponent,
  Fragment,
  h,
  KeepAlive,
  shallowRef,
} from 'vue'
import type { Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { PlayerRoot, Video, VideoPlayer } from '../src'
import type { PlayerHandle } from '../src'
import { Audio, AudioPlayer, AudioPlayerRoot } from '../src/audio'
import type { AudioPlayerHandle } from '../src/audio'
import { HlsVideo } from '../src/media/hls'
import { MediaContainer, PlayButton } from '../src/ui'
import { cleanup, disposals, mount, settle } from './helpers'

async function flushDestruction() {
  // oxlint-disable-next-line promise/avoid-new -- Wait for the real browser frame lifecycle.
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
  await settle()
}

describe('player contracts', () => {
  afterEach(cleanup)

  describe.each([
    {
      name: 'video',
      Player: VideoPlayer,
      Root: PlayerRoot,
      Media: Video,
      tag: 'video-skin',
    },
    {
      name: 'audio',
      Player: AudioPlayer,
      Root: AudioPlayerRoot,
      Media: Audio,
      tag: 'audio-skin',
    },
  ])('$name', ({ Player, Root, Media, tag }) => {
    it.each(['packaged', 'composed'])(
      'keeps %s controls and metadata live after a long cache',
      async mode => {
        expect.hasAssertions()
        const visible = shallowRef(true)
        const title = shallowRef('Before')
        const player = shallowRef<PlayerHandle | AudioPlayerHandle | null>(null)
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
        visible.value = true
        await settle()
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
      const player = shallowRef<PlayerHandle | AudioPlayerHandle | null>(null)
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
      const player = shallowRef<PlayerHandle | AudioPlayerHandle | null>(null)
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
    const player = shallowRef<PlayerHandle | null>(null)
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
    content.value = VideoPlayer
    await settle()
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

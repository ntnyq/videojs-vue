import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, KeepAlive, shallowRef } from 'vue'
import type { Component } from 'vue'
import { VideoPlayer } from '../../../src'
import type { PlayerHandle } from '../../../src'
import { HlsVideo } from '../../../src/media/hls'
import {
  mount,
  settle,
  cleanup,
  disposals,
  reconnectPlayer,
} from '../../helpers'

describe('player lifecycle', () => {
  afterEach(cleanup)

  it('pauses and releases state while cached, then reconnects without autoplay', async () => {
    expect.hasAssertions()
    const isVisible = shallowRef(true)
    const player = shallowRef<PlayerHandle | null>(null)
    const ready = vi.fn()
    mount(
      defineComponent(
        () => () =>
          h(KeepAlive, null, {
            default: () =>
              // oxlint-disable-next-line vitest/no-conditional-in-test
              isVisible.value
                ? h(VideoPlayer, { ref: player, onReady: ready })
                : h('div'),
          }),
      ),
    )
    await settle()
    const handle = player.value!
    const media = handle.media!
    await handle.play()
    isVisible.value = false
    await settle()
    expect(media.paused).toBe(true)
    expect(handle.store).toBeNull()
    await reconnectPlayer(() => {
      isVisible.value = true
    })
    expect(player.value!.store).not.toBeNull()
    expect(player.value!.store!.paused).toBe(true)
    expect(ready).toHaveBeenCalledTimes(2)
    const store = player.value!.store!
    const container = store.target!.container!
    expect(container.isConnected).toBe(true)
    container.dispatchEvent(new MouseEvent('mouseleave'))
    expect(store.userActive).toBe(false)
    container.dispatchEvent(new Event('pointermove'))
    expect(store.userActive).toBe(true)
  })

  it('preserves an HLS adapter in KeepAlive and destroys it on actual unmount', async () => {
    expect.hasAssertions()
    const content = shallowRef<Component>(VideoPlayer)
    const played = vi.fn()
    const { container, unmount } = mount(
      defineComponent(
        () => () =>
          h(KeepAlive, null, {
            default: () =>
              h(content.value, { media: HlsVideo, onPlay: played }),
          }),
      ),
    )
    await settle()
    const media = container.querySelector('hlsjs-video')!
    const destroy = vi.spyOn(media.adapter, 'destroy')
    const Other = defineComponent(() => () => h('p', 'Cached'))
    content.value = Other
    await settle()
    expect(destroy).not.toHaveBeenCalled()
    played.mockClear()
    media.dispatchEvent(new Event('play'))
    expect(played).not.toHaveBeenCalled()
    content.value = VideoPlayer
    await settle()
    expect(container.querySelector('hlsjs-video')).toBe(media)
    media.dispatchEvent(new Event('play'))
    expect(played).toHaveBeenCalledTimes(1)
    unmount()
    disposals.pop()
    await settle()
    expect(destroy).toHaveBeenCalledTimes(1)
    played.mockClear()
    media.dispatchEvent(new Event('play'))
    expect(played).not.toHaveBeenCalled()
  })

  it('destroys a cached HLS adapter when its KeepAlive owner unmounts', async () => {
    expect.hasAssertions()
    const content = shallowRef<Component>(VideoPlayer)
    const { container, unmount } = mount(
      defineComponent(
        () => () =>
          h(KeepAlive, null, {
            default: () => h(content.value, { media: HlsVideo }),
          }),
      ),
    )
    await settle()
    const media = container.querySelector('hlsjs-video')!
    const destroy = vi.spyOn(media.adapter, 'destroy')
    content.value = defineComponent(() => () => h('p', 'Other view'))
    await settle()
    expect(media.isConnected).toBe(false)
    expect(destroy).not.toHaveBeenCalled()

    unmount()
    disposals.pop()
    await settle()
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('destroys an HLS adapter when its cached component is evicted', async () => {
    expect.hasAssertions()
    const content = shallowRef<Component>(VideoPlayer)
    const { container } = mount(
      defineComponent(
        () => () =>
          h(
            KeepAlive,
            { max: 2 },
            {
              default: () => h(content.value, { media: HlsVideo }),
            },
          ),
      ),
    )
    await settle()
    const media = container.querySelector('hlsjs-video')!
    const destroy = vi.spyOn(media.adapter, 'destroy')
    content.value = defineComponent(() => () => h('p', 'Second view'))
    await settle()
    expect(destroy).not.toHaveBeenCalled()

    content.value = defineComponent(() => () => h('p', 'Third view'))
    await settle()
    expect(destroy).toHaveBeenCalledTimes(1)
  })
})

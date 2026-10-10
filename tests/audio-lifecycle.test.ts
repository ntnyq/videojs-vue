import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, KeepAlive, shallowRef } from 'vue'
import { AudioPlayer } from '../src/audio'
import type { AudioPlayerHandle } from '../src/audio'
import { mount, settle, cleanup, disposals } from './helpers'

describe('player lifecycle', () => {
  afterEach(cleanup)

  it('pauses and releases state while cached, then reconnects without autoplay', async () => {
    expect.hasAssertions()
    const isVisible = shallowRef(true)
    const player = shallowRef<AudioPlayerHandle | null>(null)
    const ready = vi.fn()
    mount(
      defineComponent(
        () => () =>
          h(KeepAlive, null, {
            default: () =>
              // oxlint-disable-next-line vitest/no-conditional-in-test
              isVisible.value
                ? h(AudioPlayer, { ref: player, onReady: ready })
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
    isVisible.value = true
    await settle()
    expect(player.value!.store).not.toBeNull()
    expect(player.value!.store!.paused).toBe(true)
    expect(ready).toHaveBeenCalledTimes(2)
  })

  it('removes cached listeners and clears retained handles on unmount', async () => {
    expect.hasAssertions()
    const isVisible = shallowRef(true)
    const player = shallowRef<AudioPlayerHandle | null>(null)
    const played = vi.fn()
    const { unmount } = mount(
      defineComponent(
        () => () =>
          h(KeepAlive, null, {
            default: () =>
              // oxlint-disable-next-line vitest/no-conditional-in-test
              isVisible.value
                ? h(AudioPlayer, { ref: player, onPlay: played })
                : h('div'),
          }),
      ),
    )
    await settle()
    const handle = player.value!
    const media = handle.media!
    isVisible.value = false
    await settle()
    media.dispatchEvent(new Event('play'))
    expect(played).not.toHaveBeenCalled()
    expect(handle.element).toBeNull()
    expect(handle.media).toBeNull()
    expect(() => handle.pause()).toThrow('inactive')
    await expect(handle.play()).rejects.toThrow('inactive')
    isVisible.value = true
    await settle()
    await handle.play()
    expect(played).toHaveBeenCalledTimes(1)
    unmount()
    disposals.pop()
    expect(media.paused).toBe(true)
    expect(handle.store).toBeNull()
    expect(handle.element).toBeNull()
    expect(handle.media).toBeNull()
    media.dispatchEvent(new Event('play'))
    expect(played).toHaveBeenCalledTimes(1)
  })
})

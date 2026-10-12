import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, shallowRef, watch } from 'vue'
import {
  AudioPlayer,
  useAudioPlayerActions,
  useAudioPlayerState,
} from '../../../src/audio'
import type { AudioPlayerHandle } from '../../../src/audio'
import { mount, settle, cleanup, disposals } from '../../helpers'

describe('player composables', () => {
  afterEach(cleanup)

  it('isolates players and only notifies consumers when the selected field changes', async () => {
    expect.hasAssertions()
    const first = shallowRef<AudioPlayerHandle | null>(null)
    const second = shallowRef<AudioPlayerHandle | null>(null)
    const changed = vi.fn()
    mount(
      defineComponent({
        setup() {
          const paused = useAudioPlayerState(state => state.paused, first)
          expect(paused.value).toBeUndefined()
          watch(paused, changed, { flush: 'sync' })
          return () =>
            h('div', [
              h(AudioPlayer, { ref: first }),
              h(AudioPlayer, { ref: second }),
            ])
        },
      }),
    )
    await settle()
    changed.mockClear()
    first.value!.media!.dispatchEvent(new Event('timeupdate'))
    expect(changed).not.toHaveBeenCalled()
    await first.value!.play()
    expect(changed).toHaveBeenCalledTimes(1)
    expect(second.value!.store!.paused).toBe(true)
  })

  it('tracks external ref replacement and releases old store subscriptions', async () => {
    expect.hasAssertions()
    const first = shallowRef<AudioPlayerHandle | null>(null)
    const second = shallowRef<AudioPlayerHandle | null>(null)
    const selected = shallowRef<AudioPlayerHandle | null>(null)
    let readPaused: () => boolean | undefined = () =>
      selected.value?.store?.paused
    const { unmount } = mount(
      defineComponent({
        setup() {
          const paused = useAudioPlayerState(state => state.paused, selected)
          readPaused = () => paused.value
          return () =>
            h('div', [
              h(AudioPlayer, { ref: first }),
              h(AudioPlayer, { ref: second }),
            ])
        },
      }),
    )
    await settle()
    const unsubscribe = vi.fn()
    const original = first.value!.store!.subscribe.bind(first.value!.store)
    vi.spyOn(first.value!.store!, 'subscribe').mockImplementation(listener => {
      const stop = original(listener)
      return () => {
        unsubscribe()
        stop()
      }
    })
    selected.value = first.value
    await first.value!.play()
    expect(readPaused()).toBe(false)
    selected.value = second.value
    expect(unsubscribe).toHaveBeenCalledTimes(1)
    expect(readPaused()).toBe(true)
    selected.value = null
    expect(readPaused()).toBeUndefined()
    const oldHandle = first.value!
    const oldMedia = oldHandle.media!
    const onPause = vi.fn()
    oldMedia.addEventListener('pause', onPause)
    unmount()
    disposals.pop()
    expect(oldHandle.store).toBeNull()
    expect(onPause).toHaveBeenCalledWith(expect.any(Event))
    await expect(oldHandle.play()).rejects.toThrow('not ready')
  })

  it('preserves command rejection causes and never replays an unready request', async () => {
    expect.hasAssertions()
    const target = shallowRef<AudioPlayerHandle | null>(null)
    let actions: ReturnType<typeof useAudioPlayerActions> | undefined
    mount(
      defineComponent({
        setup() {
          actions = useAudioPlayerActions(target)
          return () => h(AudioPlayer, { ref: target })
        },
      }),
    )
    const rejection = actions!.play()
    await expect(rejection).rejects.toThrow('not ready')
    await settle()
    expect(target.value!.store!.paused).toBe(true)
    const reason = new DOMException('Permission denied', 'NotAllowedError')
    vi.spyOn(target.value!.media!, 'play').mockRejectedValueOnce(reason)
    await expect(actions!.play()).rejects.toBe(reason)
  })

  it('rejects missing injected context clearly', () => {
    expect.hasAssertions()
    expect(() =>
      mount(
        defineComponent({
          setup() {
            useAudioPlayerState(state => state.paused)
            return () => null
          },
        }),
      ),
    ).toThrow('inside AudioPlayerRoot')
  })
})

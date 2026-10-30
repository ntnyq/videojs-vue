import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { usePlaylist } from '../../playground/src/playlist/usePlaylist'
import type { PlaylistItem } from '../../playground/src/playlist/usePlaylist'

const items: readonly PlaylistItem[] = [
  { id: 'a', title: 'A', src: '/a.mp4' },
  { id: 'b', title: 'B', src: '/b.mp4' },
  { id: 'c', title: 'C', src: '/c.mp4' },
]
const scopes: ReturnType<typeof effectScope>[] = []

function deferred<Value>() {
  let resolve: (value: Value) => void = vi.fn()
  let reject: (error: unknown) => void = vi.fn()
  // oxlint-disable-next-line promise/avoid-new -- Tests control completion order to exercise races.
  const promise = new Promise<Value>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
  return { promise, resolve, reject }
}

function setup(
  options: {
    items?: readonly PlaylistItem[]
    advanceDelay?: number
    resolveSource?: (
      item: PlaylistItem,
      signal: AbortSignal,
    ) => string | Promise<string>
  } = {},
) {
  const media = document.createElement('video')
  const scope = effectScope()
  scopes.push(scope)
  const playlist = scope.run(() =>
    usePlaylist({
      ...options,
      items: options.items ?? items,
      getMedia: () => media,
    }),
  )!
  return { playlist, media, scope }
}

describe('playlist recipe', () => {
  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop()
    }
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('preserves paused and playing intent across manual selections', async () => {
    expect.hasAssertions()
    const { playlist, media } = setup()
    const play = vi.spyOn(media, 'play')
    await playlist.select(0)
    await playlist.loadedMetadata(playlist.session.value!.version)
    expect(play).not.toHaveBeenCalled()
    await media.play()
    play.mockClear()
    await playlist.select(1)
    expect(media.paused).toBe(true)
    const token = playlist.session.value!.version
    await playlist.loadedMetadata(token)
    await playlist.loadedMetadata(token)
    expect(play).toHaveBeenCalledTimes(1)
    media.pause()
    play.mockClear()
    await playlist.previous()
    await playlist.loadedMetadata(playlist.session.value!.version)
    expect(play).not.toHaveBeenCalled()
  })

  it('advances once on ended, stops at the end and optionally loops the list', async () => {
    expect.hasAssertions()
    const { playlist, media } = setup()
    const play = vi.spyOn(media, 'play')
    await playlist.select(0)
    const first = playlist.session.value!.version
    await playlist.loadedMetadata(first)
    await playlist.ended(first)
    expect(playlist.index.value).toBe(1)
    await playlist.ended(first)
    expect(playlist.index.value).toBe(1)
    await playlist.loadedMetadata(playlist.session.value!.version)
    expect(play).toHaveBeenCalledTimes(1)
    await playlist.select(2, false)
    const last = playlist.session.value!.version
    await playlist.loadedMetadata(last)
    await playlist.ended(last)
    expect(playlist.index.value).toBe(2)
    expect(playlist.canNext.value).toBe(false)
    playlist.repeat.value = true
    await playlist.ended(last)
    expect(playlist.index.value).toBe(0)
  })

  it('aborts obsolete requests and ignores results from a resolver that ignores abort', async () => {
    expect.hasAssertions()
    const requests: { signal: AbortSignal; resolve: (src: string) => void }[] =
      []
    const { playlist, media } = setup({
      resolveSource: (_, signal) => {
        const request = deferred<string>()
        requests.push({ signal, resolve: request.resolve })
        return request.promise
      },
    })
    await media.play()
    const a = playlist.select(0)
    const b = playlist.select(1)
    const c = playlist.select(2)
    expect(requests[0]!.signal.aborted).toBe(true)
    expect(requests[1]!.signal.aborted).toBe(true)
    requests[2]!.resolve('/signed-c.mp4')
    await c
    requests[0]!.resolve('/stale-a.mp4')
    requests[1]!.resolve('/stale-b.mp4')
    await Promise.all([a, b])
    expect(playlist.session.value?.src).toBe('/signed-c.mp4')
    const play = vi.spyOn(media, 'play')
    await playlist.loadedMetadata(playlist.session.value!.version)
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('ignores stale metadata, ended, media errors and play rejections', async () => {
    expect.hasAssertions()
    const { playlist, media } = setup()
    const pendingPlay = deferred<undefined>()
    const play = vi
      .spyOn(media, 'play')
      .mockReturnValueOnce(pendingPlay.promise)
    await playlist.select(0, true)
    const old = playlist.session.value!.version
    const pending = playlist.loadedMetadata(old)
    await playlist.select(1, false)
    pendingPlay.reject(new Error('obsolete rejection'))
    await pending
    await playlist.loadedMetadata(old)
    await playlist.ended(old)
    playlist.mediaError(old)
    expect(playlist.index.value).toBe(1)
    expect(playlist.failure.value).toBe('')
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('surfaces resolver, playback and media failures without skipping items', async () => {
    expect.hasAssertions()
    const resolveSource = vi
      .fn()
      .mockRejectedValueOnce(new Error('URL expired'))
      .mockResolvedValue('/ok.mp4')
    const { playlist, media } = setup({ resolveSource })
    await playlist.select(0)
    expect(playlist.failure.value).toBe('URL expired')
    expect(playlist.session.value).toBeNull()
    expect(playlist.isLoading.value).toBe(false)
    await playlist.select(0, true)
    vi.spyOn(media, 'play').mockRejectedValueOnce(new Error('Playback blocked'))
    const token = playlist.session.value!.version
    await playlist.loadedMetadata(token)
    expect(playlist.failure.value).toBe('Playback blocked')
    playlist.playing(token)
    expect(playlist.failure.value).toBe('')
    expect(playlist.index.value).toBe(0)
    expect(resolveSource).toHaveBeenCalledTimes(2)
    playlist.mediaError(token)
    expect(playlist.failure.value).toBe('Media playback failed.')
    await playlist.ended(token)
    expect(playlist.index.value).toBe(0)
  })

  it('cancels pending work on scope disposal and rejects later selections', async () => {
    expect.hasAssertions()
    const request = deferred<string>()
    let signal: AbortSignal | undefined
    const { playlist, media, scope } = setup({
      resolveSource: (_, requestSignal) => {
        signal = requestSignal
        return request.promise
      },
    })
    const pending = playlist.select(0, true)
    scope.stop()
    expect(signal?.aborted).toBe(true)
    expect(media.paused).toBe(true)
    request.resolve('/late.mp4')
    await pending
    await playlist.select(1)
    expect(playlist.session.value).toBeNull()
    expect(playlist.isLoading.value).toBe(false)
  })

  it('handles empty lists, invalid indexes, one-item loops and empty sources', async () => {
    expect.hasAssertions()
    const { playlist: empty } = setup({ items: [] })
    await empty.select(0)
    expect(empty.canNext.value).toBe(false)
    expect(empty.session.value).toBeNull()
    const { playlist } = setup({ items: [items[0]!] })
    await playlist.select(0)
    const token = playlist.session.value!.version
    await playlist.select(-1)
    await playlist.select(0.5)
    await playlist.select(Number.NaN)
    expect(playlist.session.value!.version).toBe(token)
    playlist.repeat.value = true
    await playlist.loadedMetadata(token)
    await playlist.ended(token)
    expect(playlist.index.value).toBe(0)
    expect(playlist.session.value!.version).not.toBe(token)
    const { playlist: invalid } = setup({ resolveSource: () => ' ' })
    await invalid.select(0)
    expect(invalid.failure.value).toContain('empty')
  })

  it('counts down once, advances on expiry and preserves playback intent', async () => {
    expect.hasAssertions()
    vi.useFakeTimers()
    const { playlist, media } = setup({ advanceDelay: 5 })
    await playlist.select(0)
    const token = playlist.session.value!.version
    await playlist.loadedMetadata(token)
    await playlist.ended(token)
    await playlist.ended(token)
    expect(playlist.countdown.value).toBe(5)
    await vi.advanceTimersByTimeAsync(4000)
    expect(playlist.index.value).toBe(0)
    expect(playlist.countdown.value).toBe(1)
    await vi.advanceTimersByTimeAsync(1000)
    expect(playlist.index.value).toBe(1)
    expect(playlist.countdown.value).toBeNull()
    const play = vi.spyOn(media, 'play')
    await playlist.loadedMetadata(playlist.session.value!.version)
    expect(play).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each<[string, (state: ReturnType<typeof setup>) => unknown, number]>([
    ['cancel', ({ playlist }) => playlist.cancelAdvance(), 0],
    ['select', ({ playlist }) => playlist.select(2), 2],
    [
      'disable',
      ({ playlist }) => {
        playlist.autoAdvance.value = false
      },
      0,
    ],
    [
      'shuffle',
      ({ playlist }) => {
        playlist.shuffle.value = true
      },
      0,
    ],
    [
      'repeat',
      ({ playlist }) => {
        playlist.repeat.value = true
      },
      0,
    ],
    [
      'playing',
      ({ playlist }) => playlist.playing(playlist.session.value!.version),
      0,
    ],
    [
      'error',
      ({ playlist }) => playlist.mediaError(playlist.session.value!.version),
      0,
    ],
    ['dispose', ({ scope }) => scope.stop(), 0],
  ])('cancels the next-up timer on %s', async (_, action, expectedIndex) => {
    expect.hasAssertions()
    vi.useFakeTimers()
    const state = setup({ advanceDelay: 5 })
    const { playlist } = state
    await playlist.select(0)
    const token = playlist.session.value!.version
    await playlist.loadedMetadata(token)
    await playlist.ended(token)
    await action(state)
    expect(playlist.countdown.value).toBeNull()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(playlist.index.value).toBe(expectedIndex)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('stays on the current item with auto advance disabled, but permits manual next', async () => {
    expect.hasAssertions()
    const { playlist } = setup({ advanceDelay: 5 })
    await playlist.select(0)
    const token = playlist.session.value!.version
    await playlist.loadedMetadata(token)
    playlist.autoAdvance.value = false
    await playlist.ended(token)
    expect(playlist.index.value).toBe(0)
    expect(playlist.countdown.value).toBeNull()
    await playlist.next()
    expect(playlist.index.value).toBe(1)
  })

  it('visits each shuffled item once and navigates backward in the same order', async () => {
    expect.hasAssertions()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { playlist } = setup()
    await playlist.select(1)
    playlist.shuffle.value = true
    expect(playlist.order.value).toStrictEqual([1, 2, 0])
    expect(playlist.position.value).toBe(0)
    expect(playlist.canPrevious.value).toBe(false)
    expect(playlist.nextIndex.value).toBe(2)
    await playlist.next()
    expect(playlist.index.value).toBe(2)
    await playlist.previous()
    expect(playlist.index.value).toBe(1)
    await playlist.next()
    await playlist.next()
    expect(playlist.index.value).toBe(0)
    expect(playlist.canNext.value).toBe(false)
    playlist.repeat.value = true
    await playlist.next()
    expect(playlist.index.value).toBe(1)
    playlist.shuffle.value = false
    expect(playlist.order.value).toStrictEqual([0, 1, 2])
    expect(playlist.index.value).toBe(1)
    expect(playlist.position.value).toBe(1)
  })

  it('cleans up a countdown when the entire queue is cancelled', async () => {
    expect.hasAssertions()
    vi.useFakeTimers()
    const { playlist } = setup({ advanceDelay: 5 })
    await playlist.select(0)
    const token = playlist.session.value!.version
    await playlist.loadedMetadata(token)
    await playlist.ended(token)
    playlist.cancel()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(playlist.session.value).toBeNull()
    expect(playlist.countdown.value).toBeNull()
    expect(playlist.index.value).toBe(0)
  })

  it('can replay and schedule again after cancelling an ended item countdown', async () => {
    expect.hasAssertions()
    vi.useFakeTimers()
    const { playlist } = setup({ advanceDelay: 5 })
    await playlist.select(0)
    const token = playlist.session.value!.version
    await playlist.loadedMetadata(token)
    await playlist.ended(token)
    playlist.cancelAdvance()
    playlist.playing(token)
    await playlist.ended(token)
    expect(playlist.countdown.value).toBe(5)
    await vi.advanceTimersByTimeAsync(5000)
    expect(playlist.index.value).toBe(1)
  })
})

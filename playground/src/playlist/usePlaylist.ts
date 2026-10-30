import type { PlayerMedia } from 'videojs-vue'
import { computed, onScopeDispose, shallowRef, watch } from 'vue'

export interface PlaylistItem {
  id: string
  title: string
  src: string
  poster?: string
  duration?: number
}

interface PlaylistOptions {
  items: readonly PlaylistItem[]
  getMedia: () => PlayerMedia | null
  advanceDelay?: number
  resolveSource?: (
    item: PlaylistItem,
    signal: AbortSignal,
  ) => string | Promise<string>
}

/**
 * Application-level queue recipe. The player remains the playback state owner.
 * @param {PlaylistOptions} options - Queue entries, active media and optional URL resolver.
 * @returns {object} Queue state and selection/event handlers for keyed media elements.
 */
export function usePlaylist(options: PlaylistOptions) {
  const index = shallowRef(-1)
  const repeat = shallowRef(false)
  const shuffle = shallowRef(false)
  const autoAdvance = shallowRef(true)
  const countdown = shallowRef<number | null>(null)
  const order = shallowRef(options.items.map((_, itemIndex) => itemIndex))
  const isLoading = shallowRef(false)
  const failure = shallowRef('')
  const session = shallowRef<{
    version: number
    item: PlaylistItem
    src: string
  } | null>(null)
  const position = computed(() => order.value.indexOf(index.value))
  const canPrevious = computed(() => position.value > 0)
  const canNext = computed(
    () =>
      options.items.length > 0 &&
      (repeat.value || position.value < options.items.length - 1),
  )
  const nextIndex = computed(() =>
    canNext.value
      ? order.value[(position.value + 1) % order.value.length]
      : undefined,
  )
  let version = 0
  let request: AbortController | undefined
  let shouldResume = false
  let hasMetadata = false
  let hasEnded = false
  let isDisposed = false
  let timer: ReturnType<typeof setInterval> | undefined

  function cancelAdvance() {
    clearInterval(timer)
    timer = undefined
    countdown.value = null
  }

  // Keep the selected item first when shuffling, then visit every other item once.
  watch(
    shuffle,
    enabled => {
      cancelAdvance()
      const indexes = options.items.map((_, itemIndex) => itemIndex)
      if (enabled) {
        const remaining = indexes.filter(itemIndex => itemIndex !== index.value)
        for (let cursor = remaining.length - 1; cursor > 0; cursor--) {
          const target = Math.floor(Math.random() * (cursor + 1))
          ;[remaining[cursor], remaining[target]] = [
            remaining[target]!,
            remaining[cursor]!,
          ]
        }
        order.value = index.value < 0 ? remaining : [index.value, ...remaining]
        return
      }
      order.value = indexes
    },
    { flush: 'sync' },
  )
  watch([autoAdvance, repeat], cancelAdvance, { flush: 'sync' })

  function cancel() {
    cancelAdvance()
    version++
    request?.abort()
    request = undefined
    shouldResume = false
    hasMetadata = false
    hasEnded = false
    isLoading.value = false
    options.getMedia()?.pause()
    session.value = null
  }

  async function select(requestedIndex: number, play?: boolean) {
    const item = options.items[requestedIndex]
    if (isDisposed || !Number.isInteger(requestedIndex) || !item) {
      return
    }
    const resume =
      play ?? (shouldResume || options.getMedia()?.paused === false)
    cancel()
    const token = version
    const controller = new AbortController()
    request = controller
    index.value = requestedIndex
    shouldResume = resume
    failure.value = ''
    isLoading.value = true
    try {
      const src = options.resolveSource
        ? await options.resolveSource(item, controller.signal)
        : item.src
      if (token !== version || controller.signal.aborted) {
        return
      }
      if (!src.trim()) {
        throw new Error('The playlist source is empty.')
      }
      session.value = { version: token, item, src }
    } catch (error) {
      if (token === version && !controller.signal.aborted) {
        failure.value = error instanceof Error ? error.message : String(error)
        shouldResume = false
      }
    } finally {
      if (token === version) {
        isLoading.value = false
        request = undefined
      }
    }
  }

  async function loadedMetadata(token: number) {
    const media = options.getMedia()
    if (session.value?.version !== token || hasMetadata || !media) {
      return
    }
    hasMetadata = true
    if (!shouldResume) {
      return
    }
    shouldResume = false
    try {
      await media.play()
      if (session.value?.version !== token) {
        media.pause()
      }
    } catch (error) {
      if (session.value?.version === token) {
        failure.value = error instanceof Error ? error.message : String(error)
      }
    }
  }

  function mediaError(token: number) {
    if (session.value?.version !== token) {
      return
    }
    shouldResume = false
    cancelAdvance()
    hasMetadata = false
    failure.value =
      options.getMedia()?.error?.message || 'Media playback failed.'
  }

  function playing(token: number) {
    if (session.value?.version === token) {
      hasEnded = false
      cancelAdvance()
      failure.value = ''
    }
  }

  async function selectNext(play?: boolean) {
    if (nextIndex.value !== undefined) {
      await select(nextIndex.value, play)
    }
  }

  async function ended(token: number): Promise<void> {
    if (session.value?.version !== token || !hasMetadata || hasEnded) {
      return
    }
    if (!autoAdvance.value || !canNext.value) {
      return
    }
    hasEnded = true
    const delay = options.advanceDelay ?? 0
    if (!Number.isFinite(delay) || delay <= 0) {
      await selectNext(true)
      return
    }
    countdown.value = Math.ceil(delay)
    timer = setInterval(async () => {
      if (countdown.value === null || session.value?.version !== token) {
        cancelAdvance()
        return
      }
      countdown.value--
      if (countdown.value <= 0) {
        cancelAdvance()
        await selectNext(true)
      }
    }, 1000)
  }

  onScopeDispose(() => {
    isDisposed = true
    cancel()
  })

  return {
    index,
    repeat,
    shuffle,
    autoAdvance,
    order,
    position,
    nextIndex,
    countdown,
    isLoading,
    failure,
    session,
    canPrevious,
    canNext,
    select,
    next: selectNext,
    ended,
    loadedMetadata,
    mediaError,
    playing,
    cancel,
    cancelAdvance,
    previous: () =>
      canPrevious.value ? select(order.value[position.value - 1]!) : undefined,
  }
}

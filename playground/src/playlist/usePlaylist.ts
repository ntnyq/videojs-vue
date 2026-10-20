import type { PlayerMedia } from 'videojs-vue'
import { computed, onScopeDispose, shallowRef } from 'vue'

export interface PlaylistItem {
  id: string
  title: string
  src: string
  poster?: string
}

interface PlaylistOptions {
  items: readonly PlaylistItem[]
  getMedia: () => PlayerMedia | null
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
  const isLoading = shallowRef(false)
  const failure = shallowRef('')
  const session = shallowRef<{
    version: number
    item: PlaylistItem
    src: string
  } | null>(null)
  const canPrevious = computed(() => index.value > 0)
  const canNext = computed(
    () =>
      options.items.length > 0 &&
      (repeat.value || index.value < options.items.length - 1),
  )
  let version = 0
  let request: AbortController | undefined
  let shouldResume = false
  let hasMetadata = false
  let isDisposed = false

  function cancel() {
    version++
    request?.abort()
    request = undefined
    shouldResume = false
    hasMetadata = false
    isLoading.value = false
    options.getMedia()?.pause()
    session.value = null
  }

  async function select(nextIndex: number, play?: boolean) {
    const item = options.items[nextIndex]
    if (isDisposed || !Number.isInteger(nextIndex) || !item) {
      return
    }
    const resume =
      play ?? (shouldResume || options.getMedia()?.paused === false)
    cancel()
    const token = version
    const controller = new AbortController()
    request = controller
    index.value = nextIndex
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
    hasMetadata = false
    failure.value =
      options.getMedia()?.error?.message || 'Media playback failed.'
  }

  function playing(token: number) {
    if (session.value?.version === token) {
      failure.value = ''
    }
  }

  async function next(play?: boolean) {
    if (canNext.value) {
      await select((index.value + 1) % options.items.length, play)
    }
  }

  function ended(token: number) {
    if (session.value?.version !== token || !hasMetadata) {
      return
    }
    if (!canNext.value) {
      return
    }
    hasMetadata = false
    return next(true)
  }

  onScopeDispose(() => {
    isDisposed = true
    cancel()
  })

  return {
    index,
    repeat,
    isLoading,
    failure,
    session,
    canPrevious,
    canNext,
    select,
    next,
    ended,
    loadedMetadata,
    mediaError,
    playing,
    cancel,
    previous: () => (canPrevious.value ? select(index.value - 1) : undefined),
  }
}

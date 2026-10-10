import type { AudioPlayerStore } from '@videojs/html'
import {
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  provide,
  shallowRef,
} from 'vue'
import type { ShallowRef } from 'vue'
import type { MediaEventName } from '../media/events'
import type { CommonPlayerActions } from './actions'
import { MEDIA_CONTEXT } from './context'
import type { PlayerMedia } from './types'

interface RootCallbacks {
  onReady: () => void
  onMediaEvent: (name: MediaEventName, event: Event) => void
  onVolume: (volume: number) => void
  onMuted: (muted: boolean) => void
  onPlaybackRate: (rate: number) => void
}

/**
 * Share lifecycle and media synchronization without registering either preset.
 * @param {(getStore: () => Store | null) => Actions} createActions - Binds the preset's commands to the active store.
 * @param {RootCallbacks} callbacks - Forward lifecycle, media, and confirmed setting events.
 * @returns {object} The root element ref and live player handle.
 */
export function usePlayerRoot<
  Store extends AudioPlayerStore,
  Element extends HTMLElement & {
    readonly store: Store
    readonly updateComplete: Promise<boolean>
  },
  Actions extends CommonPlayerActions,
>(
  createActions: (getStore: () => Store | null) => Actions,
  callbacks: RootCallbacks,
): {
  element: ShallowRef<Element | null>
  handle: Actions & {
    readonly element: Element | null
    readonly store: Store | null
    readonly media: PlayerMedia | null
  }
} {
  const element: ShallowRef<Element | null> = shallowRef(null)
  const store: ShallowRef<Store | null> = shallowRef(null)
  const media = shallowRef<PlayerMedia | null>(null)
  let isActive = true
  let activation = 0
  const handle = {
    get element() {
      return store.value ? element.value : null
    },
    get store() {
      return store.value
    },
    get media() {
      return store.value ? media.value : null
    },
    ...createActions(() => store.value),
  }
  let isSettingsSyncPending = false
  let confirmedSettings:
    | { volume: number; muted: boolean; playbackRate: number }
    | undefined
  function confirmSettings() {
    if (isSettingsSyncPending) {
      return
    }
    isSettingsSyncPending = true
    nextTick(() => {
      isSettingsSyncPending = false
      const current = media.value
      if (!isActive || !current) {
        return
      }
      // Read after Vue finishes applying a batch of settings. A muted update can
      // Fire volumechange before the new volume prop has reached the media.
      const actual = {
        volume: current.volume,
        muted: current.muted,
        playbackRate: current.playbackRate,
      }
      if (actual.volume !== confirmedSettings?.volume) {
        callbacks.onVolume(actual.volume)
      }
      if (actual.muted !== confirmedSettings?.muted) {
        callbacks.onMuted(actual.muted)
      }
      if (actual.playbackRate !== confirmedSettings?.playbackRate) {
        callbacks.onPlaybackRate(actual.playbackRate)
      }
      confirmedSettings = actual
    })
  }
  provide(MEDIA_CONTEXT, {
    handle,
    setMedia(next) {
      media.value = next
      confirmedSettings = undefined
    },
    onMediaEvent(name, event) {
      callbacks.onMediaEvent(name, event)
      if (name === 'volumechange' || name === 'ratechange') {
        confirmSettings()
      }
    },
  })

  async function activate() {
    isActive = true
    const token = ++activation
    await nextTick()
    const current = element.value
    if (!current) {
      return
    }
    await current.updateComplete
    if (!isActive || token !== activation || element.value !== current) {
      return
    }
    const next = current.store
    if (store.value === next) {
      return
    }
    store.value = next
    callbacks.onReady()
  }
  function deactivate() {
    isActive = false
    activation++
    media.value?.pause()
    store.value = null
  }
  onMounted(activate)
  onActivated(activate)
  onDeactivated(deactivate)
  onBeforeUnmount(deactivate)

  return { element, handle }
}

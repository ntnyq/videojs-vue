import type { AudioPlayerStore } from '@videojs/html'
import type { PlayerActions, PlayerStore } from './types'

export type PlaybackActions = Pick<
  AudioPlayerStore,
  'play' | 'pause' | 'seek' | 'setVolume' | 'setMuted'
>

export type CommonPlayerActions = Pick<
  AudioPlayerStore,
  'play' | 'pause' | 'seek' | 'setVolume' | 'setMuted' | 'setPlaybackRate'
>

export function requirePlayerStore<Store>(getStore: () => Store | null): Store {
  const store = getStore()
  if (!store) {
    throw new Error('[videojs-vue] Player is not ready or is inactive.')
  }
  return store
}

/**
 * Resolve shared playback commands against the active store on every call.
 * @param {() => PlaybackActions | null} getStore - Reads the active playback commands.
 * @returns {PlaybackActions} Commands bound to the current player.
 */
export function createPlaybackActions(
  getStore: () => PlaybackActions | null,
): PlaybackActions {
  const requireStore = () => requirePlayerStore(getStore)
  return {
    async play() {
      return await requireStore().play()
    },
    pause() {
      return requireStore().pause()
    },
    async seek(time) {
      return await requireStore().seek(time)
    },
    setVolume(volume) {
      return requireStore().setVolume(volume)
    },
    setMuted(muted) {
      return requireStore().setMuted(muted)
    },
  }
}

/**
 * Add on-demand playback speed commands to the shared playback actions.
 * @param {() => AudioPlayerStore | null} getStore - Reads the active on-demand store.
 * @returns {CommonPlayerActions} Shared on-demand playback commands.
 */
export function createCommonPlayerActions(
  getStore: () => AudioPlayerStore | null,
): CommonPlayerActions {
  return {
    ...createPlaybackActions(getStore),
    setPlaybackRate(rate) {
      return requirePlayerStore(getStore).setPlaybackRate(rate)
    },
  }
}

/**
 * Resolve on every call so actions cannot retain an unmounted player's store.
 * @param {() => PlayerStore | null} getStore - Reads the currently active store.
 * @returns {PlayerActions} Commands bound to the current player.
 */
export function createPlayerActions(
  getStore: () => PlayerStore | null,
): PlayerActions {
  const requireStore = () => requirePlayerStore(getStore)
  return {
    ...createCommonPlayerActions(getStore),

    selectVideoRendition(id) {
      return requireStore().selectVideoRendition(id)
    },
    selectAudioTrack(id) {
      return requireStore().selectAudioTrack(id)
    },
    async requestFullscreen() {
      return await requireStore().requestFullscreen()
    },
    async exitFullscreen() {
      return await requireStore().exitFullscreen()
    },
    async requestPictureInPicture() {
      return await requireStore().requestPictureInPicture()
    },
    async exitPictureInPicture() {
      return await requireStore().exitPictureInPicture()
    },
  }
}

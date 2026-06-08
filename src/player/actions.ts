import type { PlayerActions, PlayerStore } from './types'

/**
 * Resolve on every call so actions cannot retain an unmounted player's store.
 * @param {() => PlayerStore | null} getStore - Reads the currently active store.
 * @returns {PlayerActions} Commands bound to the current player.
 */
export function createPlayerActions(
  getStore: () => PlayerStore | null,
): PlayerActions {
  function requireStore() {
    const store = getStore()
    if (!store) {
      throw new Error('[videojs-vue] Player is not ready or is inactive.')
    }
    return store
  }
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
    setPlaybackRate(rate) {
      return requireStore().setPlaybackRate(rate)
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

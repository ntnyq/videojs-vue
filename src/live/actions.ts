import { createPlaybackActions, requirePlayerStore } from '../player/actions'
import type { LivePlayerActions, LiveVideoPlayerStore } from './types'

/**
 * Resolve live commands against the currently active store on every call.
 * @param {() => LiveVideoPlayerStore | null} getStore - Reads the active live store.
 * @returns {LivePlayerActions} Commands that resolve the active player.
 */
export function createLivePlayerActions(
  getStore: () => LiveVideoPlayerStore | null,
): LivePlayerActions {
  const requireStore = () => requirePlayerStore(getStore)
  return {
    ...createPlaybackActions(getStore),
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

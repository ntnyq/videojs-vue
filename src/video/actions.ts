import {
  createOnDemandPlayerActions,
  requirePlayerStore,
} from '../player/actions'
import type { VideoPlayerActions, VideoPlayerStore } from './types'

/**
 * Resolve on every call so actions cannot retain an unmounted player's store.
 * @param {() => VideoPlayerStore | null} getStore - Reads the currently active store.
 * @returns {VideoPlayerActions} Commands bound to the current player.
 */
export function createVideoPlayerActions(
  getStore: () => VideoPlayerStore | null,
): VideoPlayerActions {
  const requireStore = () => requirePlayerStore(getStore)
  return {
    ...createOnDemandPlayerActions(getStore),

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

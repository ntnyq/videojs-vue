import type { VideoPlayerStore } from '@videojs/html'
import type { VideoPlayerElement } from '@videojs/html/video'
import type { MaybeRefOrGetter } from 'vue'
import type { PlayerMedia } from '../media/types'

export type { MediaTrack, PlayerMedia } from '../media/types'

export type PlayerStore = VideoPlayerStore
// Upstream 10.0.1's preset declaration loses the store type through its namespace.
export type PlayerElement = Omit<VideoPlayerElement, 'store'> & {
  readonly store: PlayerStore
}
export type PlayerState = PlayerStore['state']
export type PlayerActions = Pick<
  PlayerStore,
  | 'play'
  | 'pause'
  | 'seek'
  | 'setVolume'
  | 'setMuted'
  | 'setPlaybackRate'
  | 'requestFullscreen'
  | 'exitFullscreen'
  | 'requestPictureInPicture'
  | 'exitPictureInPicture'
>

/**
 * Live getters become null when the player is inactive or unmounted.
 */
export interface PlayerHandle extends PlayerActions {
  readonly element: PlayerElement | null
  readonly store: PlayerStore | null
  readonly media: PlayerMedia | null
}

export type PlayerTarget = MaybeRefOrGetter<PlayerHandle | null | undefined>

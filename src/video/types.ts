import type { VideoPlayerStore } from '@videojs/html'
import type { VideoPlayerElement as UpstreamVideoPlayerElement } from '@videojs/html/video'
import type { MaybeRefOrGetter } from 'vue'
import type { PlayerMedia } from '../media/types'

export type { MediaTrack, PlayerMedia } from '../media/types'

export type { VideoPlayerStore } from '@videojs/html'
// Upstream 10.0.1's preset declaration loses the store type through its namespace.
export type VideoPlayerElement = Omit<UpstreamVideoPlayerElement, 'store'> & {
  readonly store: VideoPlayerStore
}
export type VideoPlayerState = VideoPlayerStore['state']
export type VideoPlayerActions = Pick<
  VideoPlayerStore,
  | 'play'
  | 'pause'
  | 'seek'
  | 'setVolume'
  | 'setMuted'
  | 'setPlaybackRate'
  | 'selectVideoRendition'
  | 'selectAudioTrack'
  | 'requestFullscreen'
  | 'exitFullscreen'
  | 'requestPictureInPicture'
  | 'exitPictureInPicture'
>

/**
 * Live getters become null when the player is inactive or unmounted.
 */
export interface VideoPlayerHandle extends VideoPlayerActions {
  readonly element: VideoPlayerElement | null
  readonly store: VideoPlayerStore | null
  readonly media: PlayerMedia | null
}

export type VideoPlayerTarget = MaybeRefOrGetter<
  VideoPlayerHandle | null | undefined
>

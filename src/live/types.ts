import type { LiveVideoPlayerStore } from '@videojs/html'
import type { LiveVideoPlayerElement as UpstreamLiveVideoPlayerElement } from '@videojs/html/live-video'
import type { MaybeRefOrGetter } from 'vue'
import type { PlayerMedia } from '../media/types'

export type { LiveVideoPlayerStore } from '@videojs/html'
export type LiveVideoPlayerState = LiveVideoPlayerStore['state']
export type LiveVideoPlayerActions = Pick<
  LiveVideoPlayerStore,
  | 'play'
  | 'pause'
  | 'seek'
  | 'setVolume'
  | 'setMuted'
  | 'requestFullscreen'
  | 'exitFullscreen'
  | 'requestPictureInPicture'
  | 'exitPictureInPicture'
>
// Upstream 10.0.1's preset declaration loses the store type through its namespace.
export type LiveVideoPlayerElement = Omit<
  UpstreamLiveVideoPlayerElement,
  'store'
> & {
  readonly store: LiveVideoPlayerStore
}

/**
 * Getters return null while the live player is inactive or unmounted.
 */
export interface LiveVideoPlayerHandle extends LiveVideoPlayerActions {
  readonly element: LiveVideoPlayerElement | null
  readonly store: LiveVideoPlayerStore | null
  readonly media: PlayerMedia | null
}
export type LiveVideoPlayerTarget = MaybeRefOrGetter<
  LiveVideoPlayerHandle | null | undefined
>

import type { VideoPlayerStore } from '@videojs/html'
import type { VideoPlayerElement } from '@videojs/html/video'
import type { MaybeRefOrGetter } from 'vue'

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
 * Common native and adapter media surface. Adapter-specific APIs remain on the element.
 */
export interface PlayerMedia extends HTMLElement {
  src: string
  volume: number
  muted: boolean
  playbackRate: number
  readonly paused: boolean
  readonly currentTime: number
  readonly error: MediaError | null
  play: () => Promise<void>
  pause: () => void
}

/**
 * Live getters become null when the player is inactive or unmounted.
 */
export interface PlayerHandle extends PlayerActions {
  readonly element: PlayerElement | null
  readonly store: PlayerStore | null
  readonly media: PlayerMedia | null
}

export type PlayerTarget = MaybeRefOrGetter<PlayerHandle | null | undefined>

export interface MediaTrack {
  src: string
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  srclang?: string
  label?: string
  default?: boolean
}

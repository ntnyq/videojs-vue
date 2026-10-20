import type { AudioPlayerStore } from '@videojs/html'
import type { AudioPlayerElement as UpstreamAudioPlayerElement } from '@videojs/html/audio'
import type { MaybeRefOrGetter } from 'vue'
import type { PlayerMedia } from '../media/types'
import type { OnDemandPlayerActions } from '../player/actions'

export type { AudioPlayerStore } from '@videojs/html'
/**
 * Readonly playback snapshot from the upstream audio player store.
 * @interface
 */
export type AudioPlayerState = AudioPlayerStore['state']
/**
 * Playback, volume, and playback speed actions exposed by an audio player.
 * @interface
 */
export type AudioPlayerActions = OnDemandPlayerActions
// Upstream 10.0.1's preset declaration loses the store type through its namespace.
export type AudioPlayerElement = Omit<UpstreamAudioPlayerElement, 'store'> & {
  readonly store: AudioPlayerStore
}

/**
 * Live getters become null when the audio player is inactive or unmounted.
 */
export interface AudioPlayerHandle extends AudioPlayerActions {
  readonly element: AudioPlayerElement | null
  readonly store: AudioPlayerStore | null
  readonly media: PlayerMedia | null
}
export type AudioPlayerTarget = MaybeRefOrGetter<
  AudioPlayerHandle | null | undefined
>

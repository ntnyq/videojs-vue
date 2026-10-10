import type { AudioPlayerStore } from '@videojs/html'
import type { AudioPlayerElement as UpstreamAudioPlayerElement } from '@videojs/html/audio'
import type { MaybeRefOrGetter } from 'vue'
import type { CommonPlayerActions } from '../player/actions'
import type { PlayerMedia } from '../player/types'

export type { AudioPlayerStore } from '@videojs/html'
export type AudioPlayerState = AudioPlayerStore['state']
export type AudioPlayerActions = CommonPlayerActions
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

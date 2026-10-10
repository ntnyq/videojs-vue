import type { ComputedRef } from 'vue'
import { useStoreSelection } from '../composables/useStoreSelection'
import { createCommonPlayerActions } from '../player/actions'
import { AUDIO_PLAYER_CONTEXT, useTarget } from '../player/context'
import type {
  AudioPlayerActions,
  AudioPlayerState,
  AudioPlayerTarget,
} from './types'

/**
 * Subscribe to an audio snapshot selection; unavailable players yield undefined.
 * @param {(state: AudioPlayerState) => Selected} selector - Selects from the immutable upstream audio snapshot.
 * @param {AudioPlayerTarget} target - Explicit player target, or injected audio context when omitted.
 * @returns {ComputedRef<Selected | undefined>} A readonly selection, undefined while unavailable.
 */
export function useAudioPlayerState<Selected>(
  selector: (state: AudioPlayerState) => Selected,
  target?: AudioPlayerTarget,
): ComputedRef<Selected | undefined> {
  const player = useTarget(AUDIO_PLAYER_CONTEXT, 'AudioPlayerRoot', target)
  return useStoreSelection(() => player.value?.store, selector)
}

/**
 * Resolve the current audio player on each call. Unready actions are never queued.
 * @param {AudioPlayerTarget} target - Explicit player target, or injected audio context when omitted.
 * @returns {AudioPlayerActions} Playback commands bound to the current player.
 */
export function useAudioPlayerActions(
  target?: AudioPlayerTarget,
): AudioPlayerActions {
  const player = useTarget(AUDIO_PLAYER_CONTEXT, 'AudioPlayerRoot', target)
  return createCommonPlayerActions(() => player.value?.store ?? null)
}

import type { ComputedRef } from 'vue'
import { useStoreSelection } from '../composables/useStoreSelection'
import { useTarget } from '../player/context'
import { createLivePlayerActions } from './actions'
import { LIVE_PLAYER_CONTEXT } from './context'
import type {
  LivePlayerActions,
  LivePlayerState,
  LivePlayerTarget,
} from './types'

/**
 * Subscribe to a live snapshot selection; unavailable players yield undefined.
 * @param {(state: LivePlayerState) => Selected} selector - Selects from the immutable upstream live snapshot.
 * @param {LivePlayerTarget} target - Explicit player target, or injected live context when omitted.
 * @returns {ComputedRef<Selected | undefined>} A readonly selection, undefined while unavailable.
 */
export function useLivePlayerState<Selected>(
  selector: (state: LivePlayerState) => Selected,
  target?: LivePlayerTarget,
): ComputedRef<Selected | undefined> {
  const player = useTarget(LIVE_PLAYER_CONTEXT, 'LiveVideoPlayerRoot', target)
  return useStoreSelection(() => player.value?.store, selector)
}

/**
 * Resolve the current live player on each call. Unready actions are never queued.
 * @param {LivePlayerTarget} target - Explicit player target, or injected live context when omitted.
 * @returns {LivePlayerActions} Playback commands bound to the current player.
 */
export function useLivePlayerActions(
  target?: LivePlayerTarget,
): LivePlayerActions {
  const player = useTarget(LIVE_PLAYER_CONTEXT, 'LiveVideoPlayerRoot', target)
  return createLivePlayerActions(() => player.value?.store ?? null)
}

export type {
  LivePlayerActions,
  LivePlayerHandle,
  LivePlayerState,
  LiveVideoPlayerStore,
  LivePlayerTarget,
} from './types'

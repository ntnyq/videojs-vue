import type { ComputedRef } from 'vue'
import { useStoreSelection } from '../composables/useStoreSelection'
import { useTarget } from '../player/context'
import { createLiveVideoPlayerActions } from './actions'
import { LIVE_VIDEO_PLAYER_CONTEXT } from './context'
import type {
  LiveVideoPlayerActions,
  LiveVideoPlayerState,
  LiveVideoPlayerTarget,
} from './types'

/**
 * Subscribe to a live snapshot selection; unavailable players yield undefined.
 * @param {(state: LiveVideoPlayerState) => Selected} selector - Selects from the immutable upstream live snapshot.
 * @param {LiveVideoPlayerTarget} target - Explicit player target, or injected live context when omitted.
 * @returns {ComputedRef<Selected | undefined>} A readonly selection, undefined while unavailable.
 */
export function useLiveVideoPlayerState<Selected>(
  selector: (state: LiveVideoPlayerState) => Selected,
  target?: LiveVideoPlayerTarget,
): ComputedRef<Selected | undefined> {
  const player = useTarget(
    LIVE_VIDEO_PLAYER_CONTEXT,
    'LiveVideoPlayerRoot',
    target,
  )
  return useStoreSelection(() => player.value?.store, selector)
}

/**
 * Resolve the current live player on each call. Unready actions are never queued.
 * @param {LiveVideoPlayerTarget} target - Explicit player target, or injected live context when omitted.
 * @returns {LiveVideoPlayerActions} Playback commands bound to the current player.
 */
export function useLiveVideoPlayerActions(
  target?: LiveVideoPlayerTarget,
): LiveVideoPlayerActions {
  const player = useTarget(
    LIVE_VIDEO_PLAYER_CONTEXT,
    'LiveVideoPlayerRoot',
    target,
  )
  return createLiveVideoPlayerActions(() => player.value?.store ?? null)
}

export type {
  LiveVideoPlayerActions,
  LiveVideoPlayerHandle,
  LiveVideoPlayerState,
  LiveVideoPlayerStore,
  LiveVideoPlayerTarget,
} from './types'

import type { ComputedRef } from 'vue'
import { usePlayerTarget } from '../player/context'
import type { PlayerState, PlayerTarget } from '../player/types'
import { useStoreSelection } from './useStoreSelection'

/**
 * @param {(state: PlayerState) => Selected} selector - Selects a value from the immutable upstream snapshot.
 * @param {PlayerTarget} target - Explicit player ref/getter, or injected context when omitted.
 * @returns {ComputedRef<Selected | undefined>} A readonly selection, undefined while unavailable.
 * Subscribe to a selection of the upstream snapshot. Unready targets yield undefined.
 * Object selections should preserve identity when their selected fields are unchanged.
 */
export function usePlayerState<Selected>(
  selector: (state: PlayerState) => Selected,
  target?: PlayerTarget,
): ComputedRef<Selected | undefined> {
  const player = usePlayerTarget(target)

  return useStoreSelection(() => player.value?.store, selector)
}

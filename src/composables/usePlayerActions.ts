import { createPlayerActions } from '../player/actions'
import { usePlayerTarget } from '../player/context'
import type { PlayerActions, PlayerTarget } from '../player/types'

/**
 * @param {PlayerTarget} target - Explicit player ref/getter, or injected context when omitted.
 * @returns {PlayerActions} Actions that resolve their target on every call.
 * Commands are never queued. Async failures retain the original rejection reason.
 */
export function usePlayerActions(target?: PlayerTarget): PlayerActions {
  const player = usePlayerTarget(target)
  return createPlayerActions(() => player.value?.store ?? null)
}

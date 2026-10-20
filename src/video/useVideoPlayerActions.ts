import { createVideoPlayerActions } from './actions'
import { useVideoPlayerTarget } from './context'
import type { VideoPlayerActions, VideoPlayerTarget } from './types'

/**
 * @param {VideoPlayerTarget} target - Explicit player ref/getter, or injected context when omitted.
 * @returns {VideoPlayerActions} Actions that resolve their target on every call.
 * Commands are never queued. Async failures retain the original rejection reason.
 */
export function useVideoPlayerActions(
  target?: VideoPlayerTarget,
): VideoPlayerActions {
  const player = useVideoPlayerTarget(target)
  return createVideoPlayerActions(() => player.value?.store ?? null)
}

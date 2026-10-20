import type { ComputedRef } from 'vue'
import { useStoreSelection } from '../composables/useStoreSelection'
import { useVideoPlayerTarget } from './context'
import type { VideoPlayerState, VideoPlayerTarget } from './types'

/**
 * @param {(state: VideoPlayerState) => Selected} selector - Selects a value from the immutable upstream snapshot.
 * @param {VideoPlayerTarget} target - Explicit player ref/getter, or injected context when omitted.
 * @returns {ComputedRef<Selected | undefined>} A readonly selection, undefined while unavailable.
 * Subscribe to a selection of the upstream snapshot. Unready targets yield undefined.
 * Object selections should preserve identity when their selected fields are unchanged.
 */
export function useVideoPlayerState<Selected>(
  selector: (state: VideoPlayerState) => Selected,
  target?: VideoPlayerTarget,
): ComputedRef<Selected | undefined> {
  const player = useVideoPlayerTarget(target)

  return useStoreSelection(() => player.value?.store, selector)
}

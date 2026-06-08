import { computed, shallowRef, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { usePlayerTarget } from '../player/context'
import type { PlayerState, PlayerTarget } from '../player/types'

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

  const selection = shallowRef<Selected>()

  watch(
    () => player.value?.store,
    (store, _previous, onCleanup) => {
      selection.value = store ? selector(store.state) : undefined
      if (!store) {
        return
      }
      onCleanup(
        store.subscribe(() => {
          const next = selector(store.state)
          if (!Object.is(selection.value, next)) {
            selection.value = next
          }
        }),
      )
    },
    {
      immediate: true,
      flush: 'sync',
    },
  )
  return computed(() => selection.value)
}

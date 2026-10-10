import { computed, shallowRef, watch } from 'vue'
import type { ComputedRef } from 'vue'

interface SnapshotStore<State> {
  readonly state: State
  subscribe: (listener: () => void) => () => void
}

export function useStoreSelection<State, Selected>(
  getStore: () => SnapshotStore<State> | null | undefined,
  selector: (state: State) => Selected,
): ComputedRef<Selected | undefined> {
  const selection = shallowRef<Selected>()

  watch(
    getStore,
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

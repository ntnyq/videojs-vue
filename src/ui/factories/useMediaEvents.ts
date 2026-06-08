import { watch } from 'vue'
import type { ShallowRef } from 'vue'

export interface MediaEventBinding {
  type: keyof HTMLMediaElementEventMap
  listener: EventListener
}

export interface UseMediaEventsOptions<El extends HTMLMediaElement> {
  onAttach?: (node: El) => void
  onDetach?: () => void
  bindings: (node: El) => MediaEventBinding[]
}

export function useMediaEvents<El extends HTMLMediaElement>(
  media: Readonly<ShallowRef<El | null>>,
  options: UseMediaEventsOptions<El>,
): void {
  watch(
    media,
    (node, _previousNode, onCleanup) => {
      options.onDetach?.()

      if (!node) {
        return
      }

      options.onAttach?.(node)
      const bindings = options.bindings(node)

      for (const binding of bindings) {
        node.addEventListener(binding.type, binding.listener)
      }

      onCleanup(() => {
        for (const binding of bindings) {
          node.removeEventListener(binding.type, binding.listener)
        }

        options.onDetach?.()
      })
    },
    { immediate: true },
  )
}

import {
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  shallowRef,
} from 'vue'
import type { ShallowRef } from 'vue'

const SMALL_PLAYER_WIDTH = 480

/**
 * Observe the player, including when it is embedded in a narrow container.
 * @param {ShallowRef<HTMLElement | null>} element - The visible player surface.
 * @returns {ShallowRef<'small' | 'large'>} The current layout size.
 */
export function useLegacySize(element: ShallowRef<HTMLElement | null>) {
  const size = shallowRef<'small' | 'large'>('small')
  let observer: ResizeObserver | undefined

  function stop() {
    observer?.disconnect()
    observer = undefined
  }

  function start() {
    stop()
    if (!element.value || typeof ResizeObserver === 'undefined') {
      return
    }
    observer = new ResizeObserver(entries => {
      const [entry] = entries
      if (entry) {
        size.value =
          entry.contentRect.width < SMALL_PLAYER_WIDTH ? 'small' : 'large'
      }
    })
    observer.observe(element.value)
  }

  onMounted(start)
  onActivated(start)
  onDeactivated(stop)
  onBeforeUnmount(stop)

  return size
}

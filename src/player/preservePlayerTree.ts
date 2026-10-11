import type { ObjectDirective } from 'vue'

interface DestroyableElement extends Element {
  readonly destroyed: boolean
  destroy: () => void
}

function isDestroyable(element: Element): element is DestroyableElement {
  return (
    'destroy' in element &&
    typeof element.destroy === 'function' &&
    'destroyed' in element &&
    typeof element.destroyed === 'boolean'
  )
}

const disposals = new WeakMap<Element, () => void>()

/**
 * Vue owns disposal of a player's custom elements, including skin shadow controls.
 * Upstream otherwise permanently destroys them after two disconnected frames.
 */
export const preservePlayerTree: ObjectDirective<HTMLElement> = {
  beforeMount(root) {
    const retained = new Map<DestroyableElement, boolean>()
    const observer = new MutationObserver(records => {
      if (
        records.some(record =>
          [...record.addedNodes, ...record.removedNodes].some(
            node => node.nodeType === 1,
          ),
        )
      ) {
        // oxlint-disable-next-line no-use-before-define -- Mutation callbacks run after initialization.
        sync()
      }
    })

    function release(element: DestroyableElement, hadKeepAlive: boolean) {
      if (!hadKeepAlive) {
        element.removeAttribute('keep-alive')
      }
      if (!element.isConnected && !element.destroyed) {
        element.destroy()
      }
    }

    function sync() {
      observer.disconnect()
      observer.observe(root, { childList: true, subtree: true })
      const current = new Set<DestroyableElement>()
      function visit(element: Element) {
        if (isDestroyable(element)) {
          current.add(element)
          if (!retained.has(element)) {
            retained.set(element, element.hasAttribute('keep-alive'))
            element.setAttribute('keep-alive', '')
          }
        }
        for (const child of element.children) {
          visit(child)
        }
        if (element.shadowRoot) {
          observer.observe(element.shadowRoot, {
            childList: true,
            subtree: true,
          })
          for (const child of element.shadowRoot.children) {
            visit(child)
          }
        }
      }
      visit(root)
      for (const [element, hadKeepAlive] of retained) {
        if (!current.has(element)) {
          retained.delete(element)
          release(element, hadKeepAlive)
        }
      }
    }

    sync()
    disposals.set(root, () => {
      observer.disconnect()
      for (const [element, hadKeepAlive] of retained) {
        release(element, hadKeepAlive)
      }
      retained.clear()
    })
  },
  unmounted(root) {
    disposals.get(root)?.()
    disposals.delete(root)
  },
}

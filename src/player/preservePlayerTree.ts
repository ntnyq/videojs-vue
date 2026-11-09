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
const retentions = new WeakMap<
  DestroyableElement,
  { owners: number; hadKeepAlive: boolean }
>()

function retain(element: DestroyableElement) {
  const retained = retentions.get(element)
  if (retained) {
    retained.owners++
    return
  }
  retentions.set(element, {
    owners: 1,
    hadKeepAlive: element.hasAttribute('keep-alive'),
  })
  element.setAttribute('keep-alive', '')
}

function release(element: DestroyableElement) {
  const retained = retentions.get(element)
  if (!retained || --retained.owners > 0) {
    return
  }
  retentions.delete(element)
  if (!retained.hadKeepAlive) {
    element.removeAttribute('keep-alive')
  }
  if (!element.isConnected && !element.destroyed) {
    element.destroy()
  }
}

/**
 * Vue owns disposal of a player's custom elements, including skin shadow controls.
 * Upstream otherwise permanently destroys them after two disconnected frames.
 */
export const preservePlayerTree: ObjectDirective<HTMLElement> = {
  beforeMount(root) {
    // Nested Vue wrappers retain their own subtree while individually cached.
    const retained = new Set<DestroyableElement>()
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

    function sync() {
      observer.disconnect()
      observer.observe(root, { childList: true, subtree: true })
      const current = new Set<DestroyableElement>()
      function visit(element: Element) {
        if (isDestroyable(element)) {
          current.add(element)
          if (!retained.has(element)) {
            retained.add(element)
            retain(element)
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
      for (const element of retained) {
        if (!current.has(element)) {
          retained.delete(element)
          release(element)
        }
      }
    }

    sync()
    disposals.set(root, () => {
      observer.disconnect()
      for (const element of retained) {
        release(element)
      }
      retained.clear()
    })
  },
  unmounted(root) {
    disposals.get(root)?.()
    disposals.delete(root)
  },
}

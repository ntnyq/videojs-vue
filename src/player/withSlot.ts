import { cloneVNode, createVNode, Fragment, isVNode } from 'vue'
import type { VNodeChild } from 'vue'

/**
 * Assign native slots to rendered nodes while retaining keyed fragment groups.
 * @param {VNodeChild} node - Content returned by the Vue slot.
 * @param {string} slot - Native slot name assigned to each rendered child.
 * @returns {VNodeChild} Content with its fragment boundaries and keys preserved.
 */
export function withSlot(node: VNodeChild, slot: string): VNodeChild {
  if (Array.isArray(node)) {
    return node.map(child => withSlot(child, slot))
  }
  if (!isVNode(node)) {
    return node
  }
  if (node.type === Fragment && Array.isArray(node.children)) {
    // Rebuild the fragment so compiled block optimizations cannot skip rewritten children.
    return createVNode(
      Fragment,
      node.key === null ? null : { key: node.key },
      node.children.map(child => withSlot(child, slot)),
    )
  }
  return cloneVNode(node, { slot })
}

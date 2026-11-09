import { computed, shallowRef, watch } from 'vue'
import type { Ref } from 'vue'
import type { LogEntry } from '../data'

export function useLogScroll(
  entries: () => readonly LogEntry[],
  viewport: Readonly<Ref<HTMLElement | null>>,
  visible: () => boolean,
) {
  const FOLLOW_THRESHOLD = 24
  const isAutoScroll = shallowRef(true)
  const isFollowing = shallowRef(true)
  const lastSeenId = shallowRef(0)
  const unread = computed(
    () => entries().filter(entry => entry.id > lastSeenId.value).length,
  )

  function goLatest() {
    isFollowing.value = true
    if (!visible() || !viewport.value) {
      return
    }
    viewport.value.scrollTop = viewport.value.scrollHeight
    lastSeenId.value = entries().at(-1)?.id ?? 0
  }
  function onScroll() {
    const element = viewport.value
    if (!visible() || !element) {
      return
    }
    isFollowing.value =
      element.scrollHeight - element.clientHeight - element.scrollTop <=
      FOLLOW_THRESHOLD
    if (isFollowing.value) {
      lastSeenId.value = entries().at(-1)?.id ?? 0
    }
  }
  watch(
    () =>
      [
        entries().at(-1)?.id,
        viewport.value,
        visible(),
        isAutoScroll.value,
      ] as const,
    (current, previous) => {
      if (entries().length === 0) {
        lastSeenId.value = 0
        isFollowing.value = true
      }
      if (current[3] && !previous?.[3]) {
        isFollowing.value = true
      }
      if (current[3] && isFollowing.value) {
        goLatest()
      }
    },
    { flush: 'post', immediate: true },
  )
  return { isAutoScroll, isFollowing, unread, goLatest, onScroll }
}

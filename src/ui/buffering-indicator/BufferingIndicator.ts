import { defineComponent, h, onBeforeUnmount, shallowRef, watch } from 'vue'
import type { HTMLAttributes, PropType, VNode } from 'vue'
import { useMedia } from '../../player/context'

export interface BufferingIndicatorProps extends HTMLAttributes {
  delay?: number
}

export const BufferingIndicator = defineComponent({
  name: 'VideoJsBufferingIndicator',
  inheritAttrs: false,
  props: {
    delay: {
      type: Number as PropType<number>,
      default: 500,
    },
  },
  setup(props, { attrs, slots }) {
    const media = useMedia()
    const visible = shallowRef(false)
    let timer: ReturnType<typeof setTimeout> | null = null

    function clearTimer() {
      if (!timer) {
        return
      }

      clearTimeout(timer)
      timer = null
    }

    function queueShow() {
      clearTimer()
      timer = setTimeout(
        () => {
          visible.value = true
        },
        Math.max(0, props.delay),
      )
    }

    function hide() {
      clearTimer()
      visible.value = false
    }

    watch(
      media,
      (node, _, onCleanup) => {
        hide()

        if (!node) {
          return
        }

        node.addEventListener('waiting', queueShow)
        node.addEventListener('stalled', queueShow)
        node.addEventListener('playing', hide)
        node.addEventListener('canplay', hide)

        onCleanup(() => {
          hide()
          node.removeEventListener('waiting', queueShow)
          node.removeEventListener('stalled', queueShow)
          node.removeEventListener('playing', hide)
          node.removeEventListener('canplay', hide)
        })
      },
      { immediate: true },
    )

    onBeforeUnmount(() => {
      hide()
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          hidden: !visible.value,
          'aria-hidden': !visible.value,
          'aria-busy': visible.value,
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

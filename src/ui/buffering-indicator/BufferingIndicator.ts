import { defineComponent, h, onBeforeUnmount, shallowRef } from 'vue'
import type { HTMLAttributes, PropType, VNode } from 'vue'
import { useMedia } from '../../player/context'
import { useMediaEvents } from '../factories/useMediaEvents'

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

    useMediaEvents(media, {
      onDetach: hide,
      bindings: () => [
        { type: 'waiting', listener: queueShow },
        { type: 'stalled', listener: queueShow },
        { type: 'playing', listener: hide },
        { type: 'canplay', listener: hide },
      ],
    })

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

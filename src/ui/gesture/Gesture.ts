import { defineComponent, onBeforeUnmount, shallowRef, watchEffect } from 'vue'
import type { PropType } from 'vue'
import { useContainer, useMedia } from '../../player/context'
import { performMediaAction } from '../factories/mediaActions'

export interface GestureProps {
  type: 'tap' | 'doubletap' | (string & {})
  action: string
  value?: number
  pointer?: string
  region?: string
  disabled?: boolean
}

export const Gesture = defineComponent({
  name: 'VideoJsGesture',
  props: {
    type: {
      type: String as PropType<GestureProps['type']>,
      required: true,
    },
    action: {
      type: String as PropType<string>,
      required: true,
    },
    value: {
      type: Number as PropType<number>,
      default: undefined,
    },
    pointer: {
      type: String as PropType<string>,
      default: undefined,
    },
    region: {
      type: String as PropType<string>,
      default: undefined,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  setup(props) {
    const container = useContainer()
    const media = useMedia()
    const lastTapAt = shallowRef(0)

    let cleanup: (() => void) | null = null

    watchEffect(() => {
      cleanup?.()
      cleanup = null

      if (props.disabled || !props.action || !container.value) {
        return
      }

      const node = container.value
      const onPointerup = (event: PointerEvent) => {
        if (props.pointer && props.pointer !== event.pointerType) {
          return
        }

        if (props.type === 'doubletap') {
          const now = Date.now()
          const delta = now - lastTapAt.value
          lastTapAt.value = now
          // oxlint-disable-next-line no-magic-numbers
          if (delta > 0 && delta < 350) {
            performMediaAction(props.action, {
              media: media.value,
              container: container.value,
              value: props.value,
            })
          }
          return
        }

        performMediaAction(props.action, {
          media: media.value,
          container: container.value,
          value: props.value,
        })
      }

      node.addEventListener('pointerup', onPointerup)
      cleanup = () => node.removeEventListener('pointerup', onPointerup)
    })

    onBeforeUnmount(() => {
      cleanup?.()
      cleanup = null
    })

    return () => null
  },
})

/** @deprecated Use Gesture instead. */
export const MediaGesture = Gesture
export type MediaGestureProps = GestureProps

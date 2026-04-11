import { defineComponent, h, onBeforeUnmount, shallowRef, watch } from 'vue'
import type {
  ComponentPublicInstance,
  VNode,
  VNodeRef,
  VideoHTMLAttributes,
} from 'vue'
import { useMediaAttach } from '../player/context'

// oxlint-disable-next-line typescript/no-empty-interface, typescript/no-empty-object-type
export interface VideoProps extends VideoHTMLAttributes {}

export const Video = defineComponent<VideoProps>({
  name: 'VideoJsVideo',
  inheritAttrs: false,
  setup(_, { attrs, expose, slots }) {
    const setMedia = useMediaAttach()
    const element = shallowRef<HTMLVideoElement | null>(null)

    watch(
      element,
      value => {
        setMedia?.(value)
      },
      { immediate: true },
    )

    onBeforeUnmount(() => {
      setMedia?.(null)
    })

    expose({
      el: element,
    })

    return () =>
      h(
        'video',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLVideoElement | null
          }) as VNodeRef,
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

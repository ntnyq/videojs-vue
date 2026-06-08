import { defineComponent, h, onBeforeUnmount, shallowRef, watch } from 'vue'
import type {
  ComponentPublicInstance,
  VNode,
  VNodeRef,
  AudioHTMLAttributes,
} from 'vue'
import { useMediaAttach } from '../player/context'
import { useSyncMediaProps } from './useSyncMediaProps'

// oxlint-disable-next-line typescript/no-empty-interface, typescript/no-empty-object-type
export interface AudioProps extends AudioHTMLAttributes {}

export const Audio = defineComponent<AudioProps>({
  name: 'VideoJsAudio',
  inheritAttrs: false,
  setup(_, { attrs, expose, slots }) {
    const setMedia = useMediaAttach()
    const element = shallowRef<HTMLAudioElement | null>(null)

    watch(
      element,
      value => {
        setMedia?.(value)
      },
      { immediate: true },
    )
    useSyncMediaProps(element, attrs)

    onBeforeUnmount(() => {
      const current = element.value
      setMedia?.(previous => (previous === current ? null : previous))
    })

    expose({
      el: element,
    })

    return () =>
      h(
        'audio',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLAudioElement | null
          }) as VNodeRef,
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

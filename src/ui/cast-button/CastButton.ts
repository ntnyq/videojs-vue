import { defineComponent, h, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  VNodeRef,
} from 'vue'
import { useMedia } from '../../player/context'

export interface CastButtonProps extends ButtonHTMLAttributes {}

export const CastButton = defineComponent<CastButtonProps>({
  name: 'VideoJsCastButton',
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    const element = shallowRef<HTMLButtonElement | null>(null)
    const media = useMedia()

    expose({ el: element })

    return () =>
      h(
        'button',
        {
          ...attrs,
          type: attrs['type'] ?? 'button',
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          }) as VNodeRef,
          onClick: async (event: MouseEvent) => {
            if (typeof attrs['onClick'] === 'function') {
              ;(attrs['onClick'] as (event: MouseEvent) => void)(event)
            }

            if (event.defaultPrevented) {
              return
            }

            await (media.value as HTMLVideoElement | null)?.remote?.prompt?.()
          },
        },
        slots['default']?.() ?? 'Cast',
      )
  },
})

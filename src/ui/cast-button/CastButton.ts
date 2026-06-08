import { defineComponent, shallowRef } from 'vue'
import type { ButtonHTMLAttributes, ComponentPublicInstance } from 'vue'
import { useMedia } from '../../player/context'
import { renderElement } from '../factories/renderElement'

export interface CastButtonProps extends ButtonHTMLAttributes {}

export const CastButton = defineComponent<CastButtonProps>({
  name: 'VideoJsCastButton',
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    const element = shallowRef<HTMLButtonElement | null>(null)
    const media = useMedia()

    expose({ el: element })

    return () => {
      const content = slots['default']?.() ?? 'Cast'

      return renderElement(
        'button',
        {},
        {
          state: {
            hasMedia: Boolean(media.value),
          },
          ref: (value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          },
          props: [
            {
              type: 'button',
              children: content,
              onClick: async (event: MouseEvent) => {
                if (event.defaultPrevented) {
                  return
                }

                await (
                  media.value as HTMLVideoElement | null
                )?.remote?.prompt?.()
              },
            },
            attrs,
          ],
        },
      )
    }
  },
})

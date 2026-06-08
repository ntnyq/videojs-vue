import { computed, defineComponent, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
} from 'vue'
import { useMedia, useOptionalPlayer } from '../../player/context'
import { renderElement } from '../factories/renderElement'

export interface MuteButtonProps extends ButtonHTMLAttributes {
  muteLabel?: string
  unmuteLabel?: string
}

export const MuteButton = defineComponent({
  name: 'VideoJsMuteButton',
  inheritAttrs: false,
  props: {
    muteLabel: {
      type: String as PropType<string>,
      default: 'Mute',
    },
    unmuteLabel: {
      type: String as PropType<string>,
      default: 'Unmute',
    },
  },
  setup(props, { attrs, expose, slots }) {
    const element = shallowRef<HTMLButtonElement | null>(null)
    const media = useMedia()
    const muted = useOptionalPlayer(state =>
      Boolean((state as { muted?: unknown }).muted ?? false),
    )

    const isMuted = computed(() => muted?.value ?? media.value?.muted ?? false)
    const label = computed(() =>
      isMuted.value ? props.unmuteLabel : props.muteLabel,
    )

    expose({
      el: element,
    })

    return () => {
      const content = slots['default']?.() ?? label.value

      return renderElement(
        'button',
        {},
        {
          state: {
            muted: isMuted.value,
          },
          ref: (value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          },
          props: [
            {
              type: 'button',
              'aria-label': label.value,
              'aria-pressed': isMuted.value,
              children: content,
              onClick: (event: MouseEvent) => {
                if (event.defaultPrevented || !media.value) {
                  return
                }

                media.value.muted = !isMuted.value
              },
            },
            attrs,
          ],
        },
      )
    }
  },
})

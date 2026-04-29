import { computed, defineComponent, h, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
  VNodeRef,
} from 'vue'
import { useMedia, useOptionalPlayer } from '../../player/context'

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

    return () =>
      h(
        'button',
        {
          ...attrs,
          type: attrs['type'] ?? 'button',
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          }) as VNodeRef,
          'aria-label': attrs['aria-label'] ?? label.value,
          'aria-pressed': isMuted.value,
          onClick: (event: MouseEvent) => {
            if (typeof attrs['onClick'] === 'function') {
              ;(attrs['onClick'] as (event: MouseEvent) => void)(event)
            }

            if (event.defaultPrevented || !media.value) {
              return
            }

            media.value.muted = !isMuted.value
          },
        },
        slots['default']?.() ?? label.value,
      )
  },
})

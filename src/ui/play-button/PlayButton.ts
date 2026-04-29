import { computed, defineComponent, h, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
  VNodeRef,
} from 'vue'
import { useMedia, useOptionalPlayer } from '../../player/context'

export interface PlayButtonProps extends ButtonHTMLAttributes {
  playLabel?: string
  pauseLabel?: string
}

export const PlayButton = defineComponent({
  name: 'VideoJsPlayButton',
  inheritAttrs: false,
  props: {
    playLabel: {
      type: String as PropType<string>,
      default: 'Play',
    },
    pauseLabel: {
      type: String as PropType<string>,
      default: 'Pause',
    },
  },
  setup(props, { attrs, expose, slots }) {
    const element = shallowRef<HTMLButtonElement | null>(null)
    const media = useMedia()
    const paused = useOptionalPlayer(state =>
      Boolean((state as { paused?: unknown }).paused ?? true),
    )

    const isPaused = computed(
      () => paused?.value ?? media.value?.paused ?? true,
    )
    const label = computed(() =>
      isPaused.value ? props.playLabel : props.pauseLabel,
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
          'aria-pressed': !isPaused.value,
          onClick: (event: MouseEvent) => {
            if (typeof attrs['onClick'] === 'function') {
              ;(attrs['onClick'] as (event: MouseEvent) => void)(event)
            }

            if (event.defaultPrevented || !media.value) {
              return
            }

            if (isPaused.value) {
              media.value.play()
              return
            }

            media.value.pause()
          },
        },
        slots['default']?.() ?? label.value,
      )
  },
})

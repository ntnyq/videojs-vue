import { computed, defineComponent, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
} from 'vue'
import { useMedia, useOptionalPlayer } from '../../player/context'
import { renderElement } from '../factories/renderElement'

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

    return () => {
      const content = slots['default']?.() ?? label.value

      return renderElement(
        'button',
        {},
        {
          state: {
            paused: isPaused.value,
          },
          ref: (value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          },
          props: [
            {
              type: 'button',
              'aria-label': label.value,
              'aria-pressed': !isPaused.value,
              children: content,
              onClick: (event: MouseEvent) => {
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
            attrs,
          ],
        },
      )
    }
  },
})

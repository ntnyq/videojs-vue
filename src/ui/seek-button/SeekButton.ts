import { computed, defineComponent, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
} from 'vue'
import { useMedia } from '../../player/context'
import { renderElement } from '../factories/renderElement'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export interface SeekButtonProps extends ButtonHTMLAttributes {
  seconds?: number
}

export const SeekButton = defineComponent({
  name: 'VideoJsSeekButton',
  inheritAttrs: false,
  props: {
    seconds: {
      type: Number as PropType<number>,
      default: 10,
    },
  },
  setup(props, { attrs, expose, slots }) {
    const element = shallowRef<HTMLButtonElement | null>(null)
    const media = useMedia()

    const direction = computed(() =>
      props.seconds >= 0 ? 'forward' : 'backward',
    )
    const label = computed(() =>
      direction.value === 'forward'
        ? `Forward ${Math.abs(props.seconds)}s`
        : `Back ${Math.abs(props.seconds)}s`,
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
            seconds: props.seconds,
            direction: direction.value,
          },
          ref: (value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          },
          props: [
            {
              type: 'button',
              'aria-label': label.value,
              children: content,
              onClick: (event: MouseEvent) => {
                if (event.defaultPrevented || !media.value) {
                  return
                }

                const current = Number(media.value.currentTime ?? 0)
                const duration = Number(media.value.duration)
                const upperBound =
                  Number.isFinite(duration) && duration > 0
                    ? duration
                    : Number.MAX_SAFE_INTEGER
                media.value.currentTime = clamp(
                  current + props.seconds,
                  0,
                  upperBound,
                )
              },
            },
            attrs,
          ],
        },
      )
    }
  },
})

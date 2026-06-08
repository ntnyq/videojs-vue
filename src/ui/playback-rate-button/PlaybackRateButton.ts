import { computed, defineComponent, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
} from 'vue'
import { useMedia, useOptionalPlayer } from '../../player/context'
import { renderElement } from '../factories/renderElement'

// oxlint-disable-next-line no-magic-numbers
const DEFAULT_PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2] as const

function getNextRate(currentRate: number, rates: readonly number[]): number {
  const sorted = [...rates].filter(rate => rate > 0).toSorted((a, b) => a - b)

  if (sorted.length === 0) {
    return 1
  }

  const index = sorted.findIndex(rate => rate > currentRate + Number.EPSILON)
  return index === -1 ? sorted[0]! : (sorted[index] ?? sorted[0]!)
}

export interface PlaybackRateButtonProps extends ButtonHTMLAttributes {
  rates?: number[]
  formatRate?: (rate: number) => string
}

export const PlaybackRateButton = defineComponent({
  name: 'VideoJsPlaybackRateButton',
  inheritAttrs: false,
  props: {
    rates: {
      type: Array as PropType<number[]>,
      default: () => [...DEFAULT_PLAYBACK_RATES],
    },
    formatRate: {
      type: Function as PropType<(rate: number) => string>,
      default: (rate: number) => `${rate}x`,
    },
  },
  setup(props, { attrs, expose, slots }) {
    const element = shallowRef<HTMLButtonElement | null>(null)
    const media = useMedia()
    const selectedRate = useOptionalPlayer(state =>
      Number((state as { playbackRate?: number }).playbackRate ?? 1),
    )

    const currentRate = computed(
      () => selectedRate?.value ?? media.value?.playbackRate ?? 1,
    )

    expose({
      el: element,
    })

    return () => {
      const label = props.formatRate(currentRate.value)

      const content = slots['default']?.() ?? label

      return renderElement(
        'button',
        {},
        {
          state: {
            playbackRate: currentRate.value,
          },
          ref: (value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          },
          props: [
            {
              type: 'button',
              children: content,
              onClick: (event: MouseEvent) => {
                if (event.defaultPrevented || !media.value) {
                  return
                }

                const nextRate = getNextRate(currentRate.value, props.rates)
                media.value.defaultPlaybackRate = nextRate
                media.value.playbackRate = nextRate
              },
            },
            attrs,
          ],
        },
      )
    }
  },
})

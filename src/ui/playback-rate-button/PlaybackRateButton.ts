import { computed, defineComponent, h, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
  VNodeRef,
} from 'vue'
import { useMedia, useOptionalPlayer } from '../../player/context'

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

      return h(
        'button',
        {
          ...attrs,
          type: attrs['type'] ?? 'button',
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          }) as VNodeRef,
          onClick: (event: MouseEvent) => {
            if (typeof attrs['onClick'] === 'function') {
              ;(attrs['onClick'] as (event: MouseEvent) => void)(event)
            }

            if (event.defaultPrevented || !media.value) {
              return
            }

            const nextRate = getNextRate(currentRate.value, props.rates)
            media.value.defaultPlaybackRate = nextRate
            media.value.playbackRate = nextRate
          },
        },
        slots['default']?.() ?? label,
      )
    }
  },
})

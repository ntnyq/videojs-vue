import { computed, defineComponent, h, shallowRef } from 'vue'
import type {
  ComponentPublicInstance,
  HTMLAttributes,
  PropType,
  VNode,
  VNodeRef,
} from 'vue'
import { useOptionalPlayer } from '../../player/context'
import { formatClock } from '../factories/formatClock'

export interface TimeGroupProps extends HTMLAttributes {}

const Group = defineComponent<TimeGroupProps>({
  name: 'VideoJsTimeGroup',
  inheritAttrs: false,
  setup(_, { attrs, expose, slots }) {
    const element = shallowRef<HTMLSpanElement | null>(null)

    expose({
      el: element,
    })

    return () =>
      h(
        'span',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLSpanElement | null
          }) as VNodeRef,
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

export interface TimeSeparatorProps extends HTMLAttributes {}

const Separator = defineComponent<TimeSeparatorProps>({
  name: 'VideoJsTimeSeparator',
  inheritAttrs: false,
  setup(_, { attrs, expose, slots }) {
    const element = shallowRef<HTMLSpanElement | null>(null)

    expose({
      el: element,
    })

    return () =>
      h(
        'span',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLSpanElement | null
          }) as VNodeRef,
          'aria-hidden': 'true',
        },
        slots['default']?.() ?? '/',
      )
  },
})

export interface TimeValueProps extends Omit<HTMLAttributes, 'children'> {
  type?: 'current' | 'duration' | 'remaining'
  negativeSign?: string
  label?: string
}

const Value = defineComponent({
  name: 'VideoJsTimeValue',
  inheritAttrs: false,
  props: {
    type: {
      type: String as PropType<TimeValueProps['type']>,
      default: 'current',
    },
    negativeSign: {
      type: String as PropType<string>,
      default: '-',
    },
    label: {
      type: String as PropType<string>,
      default: undefined,
    },
  },
  setup(props, { attrs, expose }) {
    const element = shallowRef<HTMLTimeElement | null>(null)

    const currentTime = useOptionalPlayer(state =>
      Number((state as { currentTime?: number }).currentTime ?? 0),
    )
    const duration = useOptionalPlayer(state =>
      Number((state as { duration?: number }).duration ?? 0),
    )

    const seconds = computed(() => {
      const current = currentTime?.value ?? 0
      const total = duration?.value ?? 0

      if (props.type === 'duration') {
        return total
      }

      if (props.type === 'remaining') {
        return Math.max(0, total - current)
      }

      return current
    })

    const isNegative = computed(
      () => props.type === 'remaining' && seconds.value > 0,
    )

    const text = computed(() => formatClock(seconds.value))

    expose({
      el: element,
    })

    return () =>
      h(
        'time',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLTimeElement | null
          }) as VNodeRef,
          'aria-label': props.label,
          dateTime: String(Math.floor(seconds.value)),
        },
        isNegative.value ? `${props.negativeSign}${text.value}` : text.value,
      )
  },
})

export const Time = {
  Group,
  Separator,
  Value,
}

export type TimeParts = typeof Time

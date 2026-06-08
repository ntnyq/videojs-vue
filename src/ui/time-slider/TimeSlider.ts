import { computed, defineComponent, h, inject, provide, shallowRef } from 'vue'
import type {
  ComponentPublicInstance,
  HTMLAttributes,
  InjectionKey,
  PropType,
  Ref,
  VNode,
  VNodeRef,
} from 'vue'
import { useMedia } from '../../player/context'
import { formatClock } from '../factories/formatClock'
import { useMediaEvents } from '../factories/useMediaEvents'
import { createSliderParts } from '../slider/createParts'
import type {
  SliderBufferProps,
  SliderFillProps,
  SliderPreviewProps,
  SliderThumbProps,
  SliderTrackProps,
  SliderValueProps,
} from '../slider/createParts'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

interface SliderContext {
  current: Ref<number>
  pointer: Ref<number>
  duration: Ref<number>
  buffer: Ref<number>
  ratio: Ref<number>
  pointerRatio: Ref<number>
  bufferRatio: Ref<number>
  format: (value: number) => string
  setFromPointer: (event: PointerEvent) => void
}

const TIME_SLIDER_KEY: InjectionKey<SliderContext> = Symbol(
  'videojs-time-slider',
)

const KEYBOARD_SEEK_STEP_SECONDS = 5

function useTimeSliderContext(): SliderContext {
  const context = inject(TIME_SLIDER_KEY, null)

  if (!context) {
    throw new Error('TimeSlider components must be used within TimeSlider.Root')
  }

  return context
}

export interface TimeSliderRootProps extends HTMLAttributes {
  formatValue?: (value: number) => string
  onDragStart?: () => void
  onDragEnd?: () => void
}

const Root = defineComponent({
  name: 'VideoJsTimeSliderRoot',
  inheritAttrs: false,
  props: {
    formatValue: {
      type: Function as PropType<(value: number) => string>,
      default: (value: number) => formatClock(value),
    },
    onDragStart: {
      type: Function as PropType<() => void>,
      default: undefined,
    },
    onDragEnd: {
      type: Function as PropType<() => void>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const element = shallowRef<HTMLDivElement | null>(null)
    const media = useMedia()
    const current = shallowRef(0)
    const pointer = shallowRef(0)
    const duration = shallowRef(0)
    const buffer = shallowRef(0)

    const reset = () => {
      current.value = 0
      pointer.value = 0
      duration.value = 0
      buffer.value = 0
    }

    const sync = () => {
      const node = media.value
      if (!node) {
        reset()
        return
      }

      const total = Number(node.duration)
      duration.value = Number.isFinite(total) && total > 0 ? total : 0
      current.value = clamp(
        Number(node.currentTime ?? 0),
        0,
        duration.value || 0,
      )
      pointer.value = current.value
      if (node.buffered.length > 0) {
        const bufferedEnd = node.buffered.end(node.buffered.length - 1)
        buffer.value = clamp(bufferedEnd, 0, duration.value || 0)
      } else {
        buffer.value = 0
      }
    }

    useMediaEvents(media, {
      onAttach: sync,
      onDetach: reset,
      bindings: () => [
        { type: 'timeupdate', listener: sync },
        { type: 'durationchange', listener: sync },
        { type: 'progress', listener: sync },
        { type: 'loadedmetadata', listener: sync },
      ],
    })

    function applyValue(next: number) {
      const total = duration.value
      const clamped = clamp(next, 0, total || 0)
      current.value = clamped
      pointer.value = clamped
      if (media.value) {
        media.value.currentTime = clamped
      }
    }

    function setFromPointer(event: PointerEvent) {
      const node = element.value
      if (!node) {
        return
      }

      const rect = node.getBoundingClientRect()
      const ratio =
        rect.width > 0
          ? clamp((event.clientX - rect.left) / rect.width, 0, 1)
          : 0
      const value = ratio * duration.value
      applyValue(value)
    }

    const ratio = computed(() =>
      duration.value > 0 ? current.value / duration.value : 0,
    )

    const pointerRatio = computed(() =>
      duration.value > 0 ? pointer.value / duration.value : 0,
    )

    const bufferRatio = computed(() =>
      duration.value > 0 ? buffer.value / duration.value : 0,
    )

    provide(TIME_SLIDER_KEY, {
      current,
      pointer,
      duration,
      buffer,
      ratio,
      pointerRatio,
      bufferRatio,
      format: props.formatValue,
      setFromPointer,
    })

    expose({ el: element })

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLDivElement | null
          }) as VNodeRef,
          role: 'slider',
          tabIndex: attrs['tabindex'] ?? 0,
          'aria-valuemin': 0,
          'aria-valuemax': duration.value,
          'aria-valuenow': Number(current.value.toFixed(3)),
          onPointerdown: (event: PointerEvent) => {
            props.onDragStart?.()
            setFromPointer(event)
            props.onDragEnd?.()
          },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
              event.preventDefault()
              applyValue(current.value - KEYBOARD_SEEK_STEP_SECONDS)
              return
            }

            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault()
              applyValue(current.value + KEYBOARD_SEEK_STEP_SECONDS)
            }
          },
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

const parts = createSliderParts(useTimeSliderContext, 'VideoJsTimeSlider')

export const TimeSlider = {
  Root,
  Track: parts.Track,
  Buffer: parts.Buffer,
  Fill: parts.Fill,
  Thumb: parts.Thumb,
  Value: parts.Value,
  Preview: parts.Preview,
}

export type TimeSliderParts = typeof TimeSlider
export type {
  SliderBufferProps,
  SliderFillProps,
  SliderPreviewProps,
  SliderThumbProps,
  SliderTrackProps,
  SliderValueProps,
}

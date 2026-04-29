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
import { createSliderParts } from './createParts'
import type {
  SliderBufferProps,
  SliderFillProps,
  SliderPartsContext,
  SliderPreviewProps,
  SliderThumbnailProps,
  SliderThumbProps,
  SliderTrackProps,
  SliderValueProps,
} from './createParts'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export interface SliderRootProps extends HTMLAttributes {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  formatValue?: (value: number) => string
  onValueChange?: (value: number) => void
  onValueCommit?: (value: number) => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

interface SliderContext extends SliderPartsContext {
  min: Ref<number>
  max: Ref<number>
  setFromPointer: (event: PointerEvent) => void
}

const SLIDER_KEY: InjectionKey<SliderContext> = Symbol('videojs-slider')

function useSliderContext(): SliderContext {
  const context = inject(SLIDER_KEY, null)
  if (!context) {
    throw new Error('Slider parts must be used within Slider.Root')
  }

  return context
}

const Root = defineComponent({
  name: 'VideoJsSliderRoot',
  inheritAttrs: false,
  props: {
    min: {
      type: Number as PropType<number>,
      default: 0,
    },
    max: {
      type: Number as PropType<number>,
      default: 1,
    },
    step: {
      type: Number as PropType<number>,
      default: 0.05,
    },
    value: {
      type: Number as PropType<number>,
      default: undefined,
    },
    defaultValue: {
      type: Number as PropType<number>,
      default: 0,
    },
    formatValue: {
      type: Function as PropType<(value: number) => string>,
      // oxlint-disable-next-line unicorn/prefer-native-coercion-functions
      default: (value: number) => String(value),
    },
    onValueChange: {
      type: Function as PropType<(value: number) => void>,
      default: undefined,
    },
    onValueCommit: {
      type: Function as PropType<(value: number) => void>,
      default: undefined,
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
    const internalValue = shallowRef(props.defaultValue)
    const pointer = shallowRef(props.defaultValue)

    const min = computed(() => props.min)
    const max = computed(() => props.max)
    const current = computed(() => props.value ?? internalValue.value)

    function commit(next: number) {
      const clamped = clamp(next, min.value, max.value)
      internalValue.value = clamped
      pointer.value = clamped
      props.onValueChange?.(clamped)
      props.onValueCommit?.(clamped)
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
      const raw = min.value + ratio * (max.value - min.value)
      const next =
        Math.round((raw - min.value) / props.step) * props.step + min.value
      commit(next)
    }

    const ratio = computed(() => {
      const range = max.value - min.value
      return range > 0 ? (current.value - min.value) / range : 0
    })

    const pointerRatio = computed(() => {
      const range = max.value - min.value
      return range > 0 ? (pointer.value - min.value) / range : 0
    })

    const context: SliderContext = {
      current,
      pointer,
      min,
      max,
      ratio,
      pointerRatio,
      format: props.formatValue,
      setFromPointer,
    }

    provide(SLIDER_KEY, context)

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
          'aria-valuemin': min.value,
          'aria-valuemax': max.value,
          'aria-valuenow': Number(current.value.toFixed(3)),
          onPointerdown: (event: PointerEvent) => {
            props.onDragStart?.()
            setFromPointer(event)
            props.onDragEnd?.()
          },
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

const parts = createSliderParts(useSliderContext, 'VideoJsSlider')

export const Slider = {
  Root,
  Track: parts.Track,
  Fill: parts.Fill,
  Thumb: parts.Thumb,
  Buffer: parts.Buffer,
  Value: parts.Value,
  Preview: parts.Preview,
  Thumbnail: parts.Thumbnail,
}

export type SliderParts = typeof Slider
export type {
  SliderBufferProps,
  SliderFillProps,
  SliderPreviewProps,
  SliderThumbnailProps,
  SliderThumbProps,
  SliderTrackProps,
  SliderValueProps,
}

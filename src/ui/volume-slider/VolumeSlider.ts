import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  shallowRef,
  watch,
} from 'vue'
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
import { createSliderParts } from '../slider/createParts'
import type {
  SliderFillProps,
  SliderPreviewProps,
  SliderThumbProps,
  SliderTrackProps,
  SliderValueProps,
} from '../slider/createParts'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function safeStep(value: number, min: number, step: number): number {
  return Math.round((value - min) / step) * step + min
}

interface SliderContext {
  current: Ref<number>
  pointer: Ref<number>
  min: Ref<number>
  max: Ref<number>
  ratio: Ref<number>
  pointerRatio: Ref<number>
  format: (value: number) => string
  setFromPointer: (event: PointerEvent) => void
}

const VOLUME_SLIDER_KEY: InjectionKey<SliderContext> = Symbol(
  'videojs-volume-slider',
)

function useVolumeSliderContext(): SliderContext {
  const injected = inject(VOLUME_SLIDER_KEY, null)
  if (!injected) {
    throw new Error(
      'VolumeSlider components must be used within VolumeSlider.Root',
    )
  }

  return injected
}

export interface VolumeSliderRootProps extends HTMLAttributes {
  min?: number
  max?: number
  step?: number
  formatValue?: (value: number) => string
  onDragStart?: () => void
  onDragEnd?: () => void
}

const Root = defineComponent({
  name: 'VideoJsVolumeSliderRoot',
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
    formatValue: {
      type: Function as PropType<(value: number) => string>,
      default: (value: number) => `${Math.round(value * 100)}%`,
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
    const current = shallowRef(1)
    const pointer = shallowRef(1)

    const min = computed(() => props.min)
    const max = computed(() => props.max)

    watch(
      media,
      (node, _, onCleanup) => {
        if (!node) {
          current.value = 1
          pointer.value = 1
          return
        }

        const sync = () => {
          const next = clamp(Number(node.volume ?? 1), min.value, max.value)
          current.value = next
          pointer.value = next
        }

        sync()
        node.addEventListener('volumechange', sync)
        onCleanup(() => node.removeEventListener('volumechange', sync))
      },
      { immediate: true },
    )

    function applyValue(next: number) {
      const rounded = safeStep(
        clamp(next, min.value, max.value),
        min.value,
        props.step,
      )
      current.value = rounded
      pointer.value = rounded

      if (!media.value) {
        return
      }

      media.value.volume = rounded
      if (rounded > 0 && media.value.muted) {
        media.value.muted = false
      }
      if (rounded <= 0) {
        media.value.muted = true
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
      const value = min.value + ratio * (max.value - min.value)
      applyValue(value)
    }

    const ratio = computed(() => {
      const range = max.value - min.value
      return range > 0 ? (current.value - min.value) / range : 0
    })

    const pointerRatio = computed(() => {
      const range = max.value - min.value
      return range > 0 ? (pointer.value - min.value) / range : 0
    })

    provide(VOLUME_SLIDER_KEY, {
      current,
      pointer,
      min,
      max,
      ratio,
      pointerRatio,
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
          'aria-valuemin': min.value,
          'aria-valuemax': max.value,
          'aria-valuenow': Number(current.value.toFixed(3)),
          onPointerdown: (event: PointerEvent) => {
            props.onDragStart?.()
            setFromPointer(event)
            props.onDragEnd?.()
          },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
              event.preventDefault()
              applyValue(current.value - props.step)
              return
            }

            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault()
              applyValue(current.value + props.step)
            }
          },
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

const parts = createSliderParts(useVolumeSliderContext, 'VideoJsVolumeSlider')

export const VolumeSlider = {
  Root,
  Track: parts.Track,
  Fill: parts.Fill,
  Thumb: parts.Thumb,
  Value: parts.Value,
  Preview: parts.Preview,
}

export type VolumeSliderParts = typeof VolumeSlider
export type {
  SliderFillProps,
  SliderPreviewProps,
  SliderThumbProps,
  SliderTrackProps,
  SliderValueProps,
}

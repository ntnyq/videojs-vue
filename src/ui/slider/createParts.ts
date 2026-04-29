import { computed, defineComponent, h } from 'vue'
import type { HTMLAttributes, PropType, Ref, VNode } from 'vue'
import { Thumbnail } from '../thumbnail'
import type { ThumbnailImage } from '../thumbnail'

export interface SliderPartsContext {
  current: Ref<number>
  pointer: Ref<number>
  ratio: Ref<number>
  pointerRatio: Ref<number>
  bufferRatio?: Ref<number>
  format: (value: number) => string
}

export interface SliderTrackProps extends HTMLAttributes {}
export interface SliderFillProps extends HTMLAttributes {}
export interface SliderThumbProps extends HTMLAttributes {}
export interface SliderBufferProps extends HTMLAttributes {}

export interface SliderValueProps extends Omit<HTMLAttributes, 'type'> {
  type?: 'current' | 'pointer'
  format?: (value: number) => string
}

export interface SliderPreviewProps extends HTMLAttributes {
  overflow?: 'clamp' | 'visible'
}

export interface SliderThumbnailProps extends Omit<HTMLAttributes, 'children'> {
  thumbnails?: ThumbnailImage[]
}

export function createSliderParts(
  useContext: () => SliderPartsContext,
  namePrefix: string,
) {
  const Track = defineComponent<SliderTrackProps>({
    name: `${namePrefix}Track`,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h('div', { ...attrs }, slots['default']?.() as VNode[] | undefined)
    },
  })

  const Fill = defineComponent<SliderFillProps>({
    name: `${namePrefix}Fill`,
    inheritAttrs: false,
    setup(_, { attrs }) {
      const slider = useContext()

      return () =>
        h('div', {
          ...attrs,
          style: {
            ...(attrs['style'] as object | undefined),
            width: `${(slider.ratio.value * 100).toFixed(2)}%`,
          },
        })
    },
  })

  const Thumb = defineComponent<SliderThumbProps>({
    name: `${namePrefix}Thumb`,
    inheritAttrs: false,
    setup(_, { attrs }) {
      const slider = useContext()

      return () =>
        h('div', {
          ...attrs,
          style: {
            ...(attrs['style'] as object | undefined),
            left: `${(slider.ratio.value * 100).toFixed(2)}%`,
          },
        })
    },
  })

  const Buffer = defineComponent<SliderBufferProps>({
    name: `${namePrefix}Buffer`,
    inheritAttrs: false,
    setup(_, { attrs }) {
      const slider = useContext()

      return () =>
        h('div', {
          ...attrs,
          style: {
            ...(attrs['style'] as object | undefined),
            width: `${((slider.bufferRatio?.value ?? 0) * 100).toFixed(2)}%`,
          },
        })
    },
  })

  const Value = defineComponent({
    name: `${namePrefix}Value`,
    inheritAttrs: false,
    props: {
      type: {
        type: String as PropType<'current' | 'pointer'>,
        default: 'current',
      },
      format: {
        type: Function as PropType<(value: number) => string>,
        default: undefined,
      },
    },
    setup(props, { attrs }) {
      const slider = useContext()
      const value = computed(() =>
        props.type === 'pointer' ? slider.pointer.value : slider.current.value,
      )

      return () =>
        h('output', { ...attrs }, (props.format ?? slider.format)(value.value))
    },
  })

  const Preview = defineComponent({
    name: `${namePrefix}Preview`,
    inheritAttrs: false,
    props: {
      overflow: {
        type: String as PropType<'clamp' | 'visible'>,
        default: 'clamp',
      },
    },
    setup(props, { attrs, slots }) {
      const slider = useContext()

      return () => {
        const raw = slider.pointerRatio.value * 100
        const left =
          props.overflow === 'visible' ? raw : Math.max(0, Math.min(100, raw))
        return h(
          'div',
          {
            ...attrs,
            style: {
              ...(attrs['style'] as object | undefined),
              left: `${left.toFixed(2)}%`,
            },
          },
          slots['default']?.() as VNode[] | undefined,
        )
      }
    },
  })

  const SliderThumbnail = defineComponent({
    name: `${namePrefix}Thumbnail`,
    inheritAttrs: false,
    props: {
      thumbnails: {
        type: Array as PropType<ThumbnailImage[]>,
        default: () => [],
      },
    },
    setup(props, { attrs }) {
      const slider = useContext()

      return () =>
        h(Thumbnail, {
          ...attrs,
          thumbnails: props.thumbnails,
          time: slider.pointer.value,
        })
    },
  })

  return {
    Track,
    Fill,
    Thumb,
    Buffer,
    Value,
    Preview,
    Thumbnail: SliderThumbnail,
  }
}

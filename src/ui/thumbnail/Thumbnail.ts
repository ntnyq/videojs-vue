import { computed, defineComponent, h, shallowRef } from 'vue'
import type {
  ComponentPublicInstance,
  HTMLAttributes,
  PropType,
  VNodeRef,
} from 'vue'
import { useMedia } from '../../player/context'

export interface ThumbnailImage {
  start?: number
  end?: number
  url: string
}

export interface ThumbnailProps extends HTMLAttributes {
  time?: number
  thumbnails?: ThumbnailImage[]
}

function findThumbnail(
  thumbnails: ThumbnailImage[],
  time: number,
): ThumbnailImage | undefined {
  return thumbnails.find(item => {
    const start = item.start ?? Number.NEGATIVE_INFINITY
    const end = item.end ?? Number.POSITIVE_INFINITY
    return time >= start && time < end
  })
}

export const Thumbnail = defineComponent({
  name: 'VideoJsThumbnail',
  inheritAttrs: false,
  props: {
    time: {
      type: Number as PropType<number>,
      default: 0,
    },
    thumbnails: {
      type: Array as PropType<ThumbnailImage[]>,
      default: () => [],
    },
  },
  setup(props, { attrs, expose }) {
    const element = shallowRef<HTMLDivElement | null>(null)
    const media = useMedia()

    const source = computed(() => {
      const active = findThumbnail(props.thumbnails, props.time)
      if (active?.url) {
        return active.url
      }

      return media.value?.getAttribute('poster') ?? ''
    })

    expose({ el: element })

    return () =>
      h('div', {
        ...attrs,
        ref: ((value: Element | ComponentPublicInstance | null) => {
          element.value = value as HTMLDivElement | null
        }) as VNodeRef,
        style: {
          ...(attrs['style'] as object | undefined),
          backgroundImage: source.value ? `url(${source.value})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
      })
  },
})

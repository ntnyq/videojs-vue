import { computed, defineComponent, h, shallowRef } from 'vue'
import type {
  ComponentPublicInstance,
  ImgHTMLAttributes,
  VNode,
  VNodeRef,
} from 'vue'
import { useMedia, useOptionalPlayer } from '../../player/context'

export interface PosterProps extends ImgHTMLAttributes {}

export const Poster = defineComponent<PosterProps>({
  name: 'VideoJsPoster',
  inheritAttrs: false,
  setup(_, { attrs, expose, slots }) {
    const element = shallowRef<HTMLImageElement | null>(null)
    const media = useMedia()
    const paused = useOptionalPlayer(state =>
      Boolean((state as { paused?: unknown }).paused ?? true),
    )
    const currentTime = useOptionalPlayer(state =>
      Number((state as { currentTime?: number }).currentTime ?? 0),
    )

    const visible = computed(() => {
      if (!paused || !currentTime) {
        return true
      }

      return paused.value && currentTime.value <= 0
    })

    const source = computed(
      () =>
        (attrs['src'] as string | undefined) ??
        media.value?.getAttribute('poster') ??
        (media.value as HTMLVideoElement | null)?.poster,
    )

    expose({
      el: element,
    })

    return () => {
      if (!source.value) {
        return null
      }

      return h(
        'img',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLImageElement | null
          }) as VNodeRef,
          src: source.value,
          'aria-hidden': !visible.value,
          hidden: !visible.value,
        },
        slots['default']?.() as VNode[] | undefined,
      )
    }
  },
})

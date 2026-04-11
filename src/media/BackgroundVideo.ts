import type { VideoHTMLAttributes } from 'vue'
import { defineComponent, h } from 'vue'
import { Video } from './Video'

// oxlint-disable-next-line typescript/no-empty-interface, typescript/no-empty-object-type
export interface BackgroundVideoProps extends VideoHTMLAttributes {}

export const BackgroundVideo = defineComponent<BackgroundVideoProps>({
  name: 'VideoJsBackgroundVideo',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        Video,
        {
          autoplay: true,
          loop: true,
          muted: true,
          playsInline: true,
          ...attrs,
        },
        slots,
      )
  },
})

import type { HlsSource } from '@videojs/hlsjs-video'
import { HlsJsVideoElement } from '@videojs/html/media/hlsjs-video'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { mediaEmits } from './events'
import { mediaProps } from './props'
import { useMediaElement } from './useMediaElement'

export type { HlsSource, HlsEngineConfig } from '@videojs/hlsjs-video'

/**
 * Optional hls.js adapter. Import this entry only when HLS is required.
 */
export const HlsVideo = defineComponent({
  name: 'HlsVideo',
  inheritAttrs: false,
  props: {
    ...mediaProps,
    source: Object as PropType<HlsSource>,
  },
  emits: mediaEmits,
  setup(props, context) {
    return useMediaElement({
      tag: 'hlsjs-video',
      props,
      context,
      emit: context.emit,
      extraProps: () =>
        props.source === undefined ? {} : { '.source': props.source },
      onUnmount(media) {
        // Cached elements will not disconnect again when Vue disposes them.
        if (media instanceof HlsJsVideoElement && !media.isConnected) {
          media.adapter.destroy()
        }
      },
    })
  },
})

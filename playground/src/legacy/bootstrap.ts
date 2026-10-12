import { HlsVideo } from 'videojs-vue/media/hls'
import { VideoPlayer } from 'videojs-vue/video/legacy'
import { createApp, defineComponent, h, shallowRef } from 'vue'
import 'videojs-vue/skins/legacy.css'

import { HLS_SOURCE, MP4_SOURCE } from '../data'

const LegacyDemo = defineComponent({
  setup() {
    const isNarrow = shallowRef(false)
    const isHls = shallowRef(false)

    return () =>
      h(
        'main',
        {
          style: {
            maxWidth: '960px',
            margin: '32px auto',
            fontFamily: 'sans-serif',
          },
        },
        [
          h('h1', 'Chrome 90+ legacy player'),
          h(
            'p',
            'Production build with opt-in polyfills and a standalone legacy stylesheet.',
          ),
          h(
            'button',
            {
              onClick: () => {
                isNarrow.value = !isNarrow.value
              },
            },
            'Toggle player width',
          ),
          h(
            'button',
            {
              onClick: () => {
                isHls.value = !isHls.value
              },
            },
            isHls.value ? 'Use MP4' : 'Use HLS',
          ),
          h(
            'div',
            {
              style: {
                width: isNarrow.value ? '320px' : '100%',
                marginTop: '16px',
              },
            },
            [
              h(VideoPlayer, {
                key: isHls.value ? 'hls' : 'mp4',
                media: isHls.value ? HlsVideo : undefined,
                src: isHls.value ? HLS_SOURCE : MP4_SOURCE,
                crossorigin: 'anonymous',
                tracks: [
                  {
                    src: '/captions.vtt',
                    kind: 'captions',
                    srclang: 'en',
                    label: 'English',
                  },
                ],
              }),
            ],
          ),
        ],
      )
  },
})

createApp(LegacyDemo).mount('#app')

import { LiveVideoPlayer } from 'videojs-vue/live'
import { HlsVideo } from 'videojs-vue/media/hls'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { Playground } from '../composables/usePlayground'

export const LiveDemo = defineComponent({
  inheritAttrs: false,
  props: { lab: { type: Object as PropType<Playground>, required: true } },
  setup(props, { attrs }) {
    return () => {
      const { playbackRate: _rate, ...media } = props.lab.mediaProps
      return (
        <LiveVideoPlayer
          {...media}
          title={props.lab.config.title}
          skin={props.lab.config.skin}
          media={HlsVideo}
          {...attrs}
        />
      )
    }
  },
})

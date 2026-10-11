import { AudioPlayer } from 'videojs-vue/audio'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { Playground } from '../composables/usePlayground'

export const AudioDemo = defineComponent({
  inheritAttrs: false,
  props: { lab: { type: Object as PropType<Playground>, required: true } },
  setup(props, { attrs }) {
    return () => {
      const { lab } = props
      const {
        poster: _poster,
        playsinline: _playsinline,
        tracks: _tracks,
        ...media
      } = lab.mediaProps
      return (
        <AudioPlayer
          {...media}
          title={lab.config.title}
          poster={lab.config.poster}
          skin={lab.config.skin}
          {...attrs}
        />
      )
    }
  },
})

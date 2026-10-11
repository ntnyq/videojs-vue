import { PlayerRoot, Video } from 'videojs-vue/core'
import { MediaContainer } from 'videojs-vue/ui/container'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Playground } from '../composables/usePlayground'
import { CustomControls } from './CustomControls'

export const CustomPlayerDemo = defineComponent({
  inheritAttrs: false,
  props: { lab: { type: Object as PropType<Playground>, required: true } },
  setup(props, { attrs }) {
    const { t: translate } = useI18n()
    return () => {
      const { lab } = props
      return (
        <PlayerRoot
          title={lab.config.title}
          poster={lab.config.poster}
          {...attrs}
        >
          <MediaContainer class='relative block aspect-video w-full bg-black text-white'>
            <Video
              {...lab.mediaProps}
              class='block size-full object-contain'
            />
            <div class='pointer-events-none absolute top-4 left-4 max-w-[80%] rounded bg-black/60 px-3 py-2 text-xs'>
              {translate('player.overlay')}
            </div>
            <CustomControls />
          </MediaContainer>
        </PlayerRoot>
      )
    }
  },
})

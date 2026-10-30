import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Playground } from '../composables/usePlayground'
import PlaylistExample from '../playlist/PlaylistExample.vue'

export const PlaylistDemo = defineComponent({
  inheritAttrs: false,
  props: { lab: { type: Object as PropType<Playground>, required: true } },
  setup(props, { attrs }) {
    const { t: translate } = useI18n()
    return () => (
      <PlaylistExample
        settings={props.lab.mediaProps}
        labels={{
          title: translate('playlist.title'),
          collection: translate('playlist.collection'),
          previous: translate('playlist.previous'),
          next: translate('playlist.next'),
          repeat: translate('playlist.repeat'),
          shuffle: translate('playlist.shuffle'),
          autoAdvance: translate('playlist.autoAdvance'),
          nowPlaying: translate('playlist.nowPlaying'),
          upNext: translate('playlist.upNext'),
          playNow: translate('playlist.playNow'),
          countdown: translate('playlist.countdown', { seconds: '{seconds}' }),
          show: translate('playlist.show'),
          hide: translate('playlist.hide'),
          loading: translate('playlist.loading'),
          retry: translate('playlist.retry'),
          cancel: translate('playlist.cancel'),
        }}
        {...attrs}
      />
    )
  },
})

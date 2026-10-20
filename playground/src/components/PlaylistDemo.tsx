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
          previous: translate('playlist.previous'),
          next: translate('playlist.next'),
          repeat: translate('playlist.repeat'),
          loading: translate('playlist.loading'),
          retry: translate('playlist.retry'),
          cancel: translate('playlist.cancel'),
        }}
        {...attrs}
      />
    )
  },
})

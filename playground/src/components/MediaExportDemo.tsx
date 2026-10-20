import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Playground } from '../composables/usePlayground'
import MediaExportExample from '../media-export/MediaExportExample.vue'

export const MediaExportDemo = defineComponent({
  inheritAttrs: false,
  props: { lab: { type: Object as PropType<Playground>, required: true } },
  setup(props, { attrs }) {
    const { t: translate } = useI18n()
    return () => (
      <MediaExportExample
        settings={props.lab.mediaProps}
        labels={{
          capture: translate('mediaExport.capture'),
          download: translate('mediaExport.download'),
          cancel: translate('mediaExport.cancel'),
          busy: translate('mediaExport.busy'),
        }}
        skin={props.lab.config.skin}
        title={props.lab.config.title}
        {...attrs}
      />
    )
  },
})

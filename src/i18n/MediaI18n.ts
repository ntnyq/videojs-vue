import '../register/i18n'
import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'

/**
 * Shares the upstream locale with all descendant players and controls.
 */
export const MediaI18n = defineComponent({
  name: 'MediaI18n',
  inheritAttrs: false,
  props: {
    lang: String as PropType<string | undefined>,
    dir: String as PropType<'ltr' | 'rtl' | 'auto' | undefined>,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'media-i18n',
        { ...attrs, lang: props.lang ?? '', dir: props.dir ?? '' },
        slots['default']?.(),
      )
  },
})

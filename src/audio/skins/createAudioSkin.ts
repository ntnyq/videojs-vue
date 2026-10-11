import { defineComponent, h, mergeProps } from 'vue'
import { withSlot } from '../../skins/withSlot'

export function createAudioSkin(name: string, tag: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      return () =>
        h(
          tag,
          mergeProps(
            {
              style: { display: 'block', width: '100%' },
            },
            attrs,
          ),
          [slots['default']?.(), withSlot(slots['poster']?.(), 'poster')],
        )
    },
  })
}

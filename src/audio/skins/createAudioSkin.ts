import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import { preservePlayerTree } from '../../player/preservePlayerTree'
import { withSlot } from '../../player/withSlot'

export function createAudioSkin(name: string, tag: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      return () => {
        const node = h(
          tag,
          mergeProps(
            {
              style: { display: 'block', width: '100%' },
            },
            attrs,
          ),
          [slots['default']?.(), withSlot(slots['poster']?.(), 'poster')],
        )
        return withDirectives(node, [[preservePlayerTree]])
      }
    },
  })
}

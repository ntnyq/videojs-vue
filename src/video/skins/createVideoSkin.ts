import { defineComponent, h, mergeProps, withDirectives } from 'vue'
import { preservePlayerTree } from '../../player/preservePlayerTree'
import { withSlot } from '../../player/withSlot'

export function createVideoSkin(name: string, tag: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      return () => {
        const node = h(
          tag,
          mergeProps(
            {
              style: {
                display: 'block',
                width: '100%',
                aspectRatio: '16 / 9',
              },
            },
            attrs,
          ),
          [
            slots['default']?.(),
            withSlot(slots['poster']?.(), 'poster'),
            withSlot(slots['thumbnail']?.(), 'thumbnail'),
          ],
        )
        return withDirectives(node, [[preservePlayerTree]])
      }
    },
  })
}

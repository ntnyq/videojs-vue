import { defineComponent, h, mergeProps } from 'vue'
import { withSlot } from './withSlot'

export function createVideoSkin(name: string, tag: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      return () =>
        h(
          tag,
          mergeProps(
            {
              style: { display: 'block', width: '100%', aspectRatio: '16 / 9' },
            },
            attrs,
          ),
          [
            slots['default']?.(),
            withSlot(slots['poster']?.(), 'poster'),
            withSlot(slots['thumbnail']?.(), 'thumbnail'),
          ],
        )
    },
  })
}

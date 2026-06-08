import '@videojs/html/video/skin'
import '@videojs/html/video/neutral-skin'
import { cloneVNode, defineComponent, h, mergeProps } from 'vue'

function createSkin(name: string, tag: string) {
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
            slots['poster']?.().map(node =>
              cloneVNode(node, { slot: 'poster' }),
            ),
            slots['thumbnail']?.().map(node =>
              cloneVNode(node, { slot: 'thumbnail' }),
            ),
          ],
        )
    },
  })
}

export const DefaultVideoSkin = createSkin('DefaultVideoSkin', 'video-skin')
export const NeutralVideoSkin = createSkin(
  'NeutralVideoSkin',
  'video-neutral-skin',
)

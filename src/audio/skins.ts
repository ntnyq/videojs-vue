import '@videojs/html/audio/skin'
import '@videojs/html/audio/neutral-skin'
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
              style: { display: 'block', width: '100%' },
            },
            attrs,
          ),
          [
            slots['default']?.(),
            slots['poster']?.().map(node =>
              cloneVNode(node, { slot: 'poster' }),
            ),
          ],
        )
    },
  })
}

export const DefaultAudioSkin = createSkin('DefaultAudioSkin', 'audio-skin')
export const NeutralAudioSkin = createSkin(
  'NeutralAudioSkin',
  'audio-neutral-skin',
)

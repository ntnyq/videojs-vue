import { defineComponent, h, mergeProps, shallowRef } from 'vue'
import { usePlayerState } from '../composables/usePlayerState'
import { MediaContainer } from '../ui/MediaContainer'
import { LegacyControls } from './legacy/LegacyControls'
import { useLegacySize } from './legacy/useLegacySize'

/** Light-DOM skin. Import videojs-vue/skins/legacy.css separately. */
export const LegacyVideoSkin = defineComponent({
  name: 'LegacyVideoSkin',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const element = shallowRef<HTMLElement | null>(null)
    const size = useLegacySize(element)
    const hasStarted = usePlayerState(state => state.started)
    return () =>
      h(
        MediaContainer,
        mergeProps(
          {
            class: 'vjs-legacy',
            style: { display: 'block', width: '100%', aspectRatio: '16 / 9' },
          },
          attrs,
          { 'data-size': size.value },
        ),
        {
          default: () =>
            h('div', { ref: element, class: 'vjs-legacy__surface' }, [
              slots['default']?.(),
              !hasStarted.value && slots['poster']
                ? h('div', { class: 'vjs-legacy__poster' }, slots['poster']())
                : null,
              h(LegacyControls),
            ]),
        },
      )
  },
})

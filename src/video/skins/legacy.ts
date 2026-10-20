import { defineComponent, h, mergeProps, shallowRef } from 'vue'
import { MediaContainer } from '../../ui/container'
import { useVideoPlayerState } from '../useVideoPlayerState'
import { LegacyControls } from './legacy/LegacyControls'
import { useLegacySize } from './legacy/useLegacySize'

/** Light-DOM skin. Import videojs-vue/video/skins/legacy.css separately. */
export const LegacyVideoSkin = defineComponent({
  name: 'LegacyVideoSkin',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const element = shallowRef<HTMLElement | null>(null)
    const size = useLegacySize(element)
    const hasStarted = useVideoPlayerState(state => state.started)
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

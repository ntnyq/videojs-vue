import { computed, defineComponent, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
} from 'vue'
import { useMedia } from '../../player/context'
import { renderElement } from '../factories/renderElement'
import { useCaptionTracks } from '../factories/useCaptionTracks'

export interface CaptionsButtonProps extends ButtonHTMLAttributes {
  onLabel?: string
  offLabel?: string
}

export const CaptionsButton = defineComponent({
  name: 'VideoJsCaptionsButton',
  inheritAttrs: false,
  props: {
    onLabel: {
      type: String as PropType<string>,
      default: 'Captions on',
    },
    offLabel: {
      type: String as PropType<string>,
      default: 'Captions off',
    },
  },
  setup(props, { attrs, slots, expose }) {
    const element = shallowRef<HTMLButtonElement | null>(null)
    const media = useMedia()
    const captionTracks = useCaptionTracks(media)

    const label = computed(() =>
      captionTracks.enabled.value ? props.onLabel : props.offLabel,
    )
    expose({ el: element })

    return () => {
      const content = slots['default']?.() ?? label.value

      return renderElement(
        'button',
        {},
        {
          state: {
            enabled: captionTracks.enabled.value,
            trackCount: captionTracks.tracks.value.length,
          },
          ref: (value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          },
          props: [
            {
              type: 'button',
              'aria-label': label.value,
              'aria-pressed': captionTracks.enabled.value,
              children: content,
              onClick: (event: MouseEvent) => {
                if (event.defaultPrevented) {
                  return
                }

                captionTracks.toggle()
              },
            },
            attrs,
          ],
        },
      )
    }
  },
})

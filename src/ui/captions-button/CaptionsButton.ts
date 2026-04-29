import { computed, defineComponent, h, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
  VNodeRef,
} from 'vue'
import { useMedia } from '../../player/context'

function getCaptionTracks(media: HTMLMediaElement | null): TextTrack[] {
  const syntheticTracks = (media as { __vjsTextTracks?: TextTrack[] } | null)
    // oxlint-disable-next-line no-underscore-dangle
    ?.__vjsTextTracks
  if (Array.isArray(syntheticTracks)) {
    return syntheticTracks.filter(
      track => track.kind === 'captions' || track.kind === 'subtitles',
    )
  }

  const tracks = media?.textTracks
  if (!tracks) {
    return []
  }

  const result: TextTrack[] = []

  // oxlint-disable-next-line typescript/prefer-for-of
  for (let index = 0; index < tracks.length; index += 1) {
    const track = tracks[index]
    if (!track) {
      continue
    }

    if (track.kind === 'captions' || track.kind === 'subtitles') {
      result.push(track)
    }
  }

  return result
}

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

    const enabled = computed(() =>
      getCaptionTracks(media.value).some(track => track.mode === 'showing'),
    )
    const label = computed(() =>
      enabled.value ? props.onLabel : props.offLabel,
    )

    function toggleCaptions() {
      const list = getCaptionTracks(media.value)
      if (list.length === 0) {
        return
      }

      const currentlyShowing = list.some(track => track.mode === 'showing')

      if (currentlyShowing) {
        for (const track of list) {
          track.mode = 'hidden'
        }
        return
      }

      if (list[0]) {
        list[0].mode = 'showing'
      }
    }

    expose({ el: element })

    return () =>
      h(
        'button',
        {
          ...attrs,
          type: attrs['type'] ?? 'button',
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          }) as VNodeRef,
          disabled: attrs['disabled'],
          'aria-label': attrs['aria-label'] ?? label.value,
          'aria-pressed': enabled.value,
          onClick: (event: MouseEvent) => {
            if (typeof attrs['onClick'] === 'function') {
              ;(attrs['onClick'] as (event: MouseEvent) => void)(event)
            }

            if (event.defaultPrevented) {
              return
            }

            toggleCaptions()
          },
        },
        slots['default']?.() ?? label.value,
      )
  },
})

import '@videojs/html/audio/player'
import { defineComponent, h, provide } from 'vue'
import type { PropType } from 'vue'
import type { MediaEventName } from '../media/events'
import { createCommonPlayerActions } from '../player/actions'
import { AUDIO_PLAYER_CONTEXT } from '../player/context'
import { createPlayerEmits } from '../player/events'
import { usePlayerRoot } from '../player/usePlayerRoot'
import type {
  AudioPlayerActions,
  AudioPlayerElement,
  AudioPlayerHandle,
  AudioPlayerStore,
} from './types'

export const audioPlayerEmits = createPlayerEmits<AudioPlayerHandle>()

const component = defineComponent({
  name: 'AudioPlayerRoot',
  inheritAttrs: false,
  props: {
    title: String as PropType<string | undefined>,
    poster: String as PropType<string | undefined>,
  },
  emits: audioPlayerEmits,
  setup(props, { attrs, slots, emit, expose }) {
    const emitMedia = emit as (name: MediaEventName, event: Event) => void
    const { element, handle } = usePlayerRoot<
      AudioPlayerStore,
      AudioPlayerElement,
      AudioPlayerActions
    >(createCommonPlayerActions, {
      onReady: () => emit('ready', handle),
      onMediaEvent: emitMedia,
      onVolume: volume => emit('update:volume', volume),
      onMuted: muted => emit('update:muted', muted),
      onPlaybackRate: rate => emit('update:playbackRate', rate),
    })
    provide(AUDIO_PLAYER_CONTEXT, handle)
    expose(handle)
    return () =>
      h(
        'audio-player',
        {
          ...attrs,
          ref: element,
          'content-title': props.title,
          poster: props.poster,
        },
        slots['default']?.(),
      )
  },
})

/**
 * Vue component ref exposes the player handle alongside the standard instance.
 */
export const AudioPlayerRoot = component as typeof component & {
  new (): InstanceType<typeof component> & AudioPlayerHandle
}

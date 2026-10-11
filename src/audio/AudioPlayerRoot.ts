import '../register/audio/player'
import { defineComponent, h, provide, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { MediaEventName } from '../media/events'
import { createCommonPlayerActions } from '../player/actions'
import { AUDIO_PLAYER_CONTEXT } from '../player/context'
import { createPlayerEmits } from '../player/events'
import { preservePlayerTree } from '../player/preservePlayerTree'
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
      withDirectives(
        h(
          'audio-player',
          {
            ...attrs,
            ref: element,
            'content-title': props.title,
            poster: props.poster,
          },
          slots['default']?.(),
        ),
        [[preservePlayerTree]],
      )
  },
})

/**
 * Vue component ref exposes the player handle alongside the standard instance.
 */
export const AudioPlayerRoot = component as typeof component & {
  new (): InstanceType<typeof component> & AudioPlayerHandle
}

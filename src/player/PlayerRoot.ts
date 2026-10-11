import '../register/video/player'
import { defineComponent, h, provide, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { MediaEventName } from '../media/events'
import { createPlayerActions } from './actions'
import { PLAYER_CONTEXT } from './context'
import { createPlayerEmits } from './events'
import { preservePlayerTree } from './preservePlayerTree'
import type {
  PlayerActions,
  PlayerElement,
  PlayerHandle,
  PlayerStore,
} from './types'
import { usePlayerRoot } from './usePlayerRoot'

export const playerEmits = createPlayerEmits<PlayerHandle>()

const component = defineComponent({
  name: 'PlayerRoot',
  inheritAttrs: false,
  props: {
    title: String as PropType<string | undefined>,
    poster: String as PropType<string | undefined>,
  },
  emits: playerEmits,
  setup(props, { attrs, slots, emit, expose }) {
    const emitMedia = emit as (name: MediaEventName, event: Event) => void
    const { element, handle } = usePlayerRoot<
      PlayerStore,
      PlayerElement,
      PlayerActions
    >(createPlayerActions, {
      onReady: () => emit('ready', handle),
      onMediaEvent: emitMedia,
      onVolume: volume => emit('update:volume', volume),
      onMuted: muted => emit('update:muted', muted),
      onPlaybackRate: rate => emit('update:playbackRate', rate),
    })
    provide(PLAYER_CONTEXT, handle)
    expose(handle)
    return () =>
      withDirectives(
        h(
          'video-player',
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
export const PlayerRoot = component as typeof component & {
  new (): InstanceType<typeof component> & PlayerHandle
}

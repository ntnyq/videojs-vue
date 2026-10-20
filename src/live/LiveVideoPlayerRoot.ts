import '../register/live/player'
import { defineComponent, h, provide, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { MediaEventName } from '../media/events'
import { createPlaybackEmits } from '../player/events'
import { preservePlayerTree } from '../player/preservePlayerTree'
import { usePlayerRoot } from '../player/usePlayerRoot'
import { createLiveVideoPlayerActions } from './actions'
import { LIVE_VIDEO_PLAYER_CONTEXT } from './context'
import type {
  LiveVideoPlayerActions,
  LiveVideoPlayerElement,
  LiveVideoPlayerHandle,
  LiveVideoPlayerStore,
} from './types'

export const liveVideoPlayerEmits = createPlaybackEmits<LiveVideoPlayerHandle>()

const component = defineComponent({
  name: 'LiveVideoPlayerRoot',
  inheritAttrs: false,
  props: {
    title: String as PropType<string | undefined>,
    poster: String as PropType<string | undefined>,
  },
  emits: liveVideoPlayerEmits,
  setup(props, { attrs, slots, emit, expose }) {
    const emitMedia = emit as (name: MediaEventName, event: Event) => void
    const { element, handle } = usePlayerRoot<
      LiveVideoPlayerStore,
      LiveVideoPlayerElement,
      LiveVideoPlayerActions
    >(createLiveVideoPlayerActions, {
      onReady: () => emit('ready', handle),
      onMediaEvent: emitMedia,
      onVolume: volume => emit('update:volume', volume),
      onMuted: muted => emit('update:muted', muted),
    })
    provide(LIVE_VIDEO_PLAYER_CONTEXT, handle)
    expose(handle)
    return () =>
      withDirectives(
        h(
          'live-video-player',
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
export const LiveVideoPlayerRoot = component as typeof component & {
  new (): InstanceType<typeof component> & LiveVideoPlayerHandle
}

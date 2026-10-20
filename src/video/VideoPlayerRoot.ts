import '../register/video/player'
import { defineComponent, h, provide, withDirectives } from 'vue'
import type { PropType } from 'vue'
import type { MediaEventName } from '../media/events'
import { createOnDemandPlayerEmits } from '../player/events'
import { preservePlayerTree } from '../player/preservePlayerTree'
import { usePlayerRoot } from '../player/usePlayerRoot'
import { createVideoPlayerActions } from './actions'
import { VIDEO_PLAYER_CONTEXT } from './context'
import type {
  VideoPlayerActions,
  VideoPlayerElement,
  VideoPlayerHandle,
  VideoPlayerStore,
} from './types'

export const videoPlayerEmits = createOnDemandPlayerEmits<VideoPlayerHandle>()

const component = defineComponent({
  name: 'VideoPlayerRoot',
  inheritAttrs: false,
  props: {
    title: String as PropType<string | undefined>,
    poster: String as PropType<string | undefined>,
  },
  emits: videoPlayerEmits,
  setup(props, { attrs, slots, emit, expose }) {
    const emitMedia = emit as (name: MediaEventName, event: Event) => void
    const { element, handle } = usePlayerRoot<
      VideoPlayerStore,
      VideoPlayerElement,
      VideoPlayerActions
    >(createVideoPlayerActions, {
      onReady: () => emit('ready', handle),
      onMediaEvent: emitMedia,
      onVolume: volume => emit('update:volume', volume),
      onMuted: muted => emit('update:muted', muted),
      onPlaybackRate: rate => emit('update:playbackRate', rate),
    })
    provide(VIDEO_PLAYER_CONTEXT, handle)
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
export const VideoPlayerRoot = component as typeof component & {
  new (): InstanceType<typeof component> & VideoPlayerHandle
}

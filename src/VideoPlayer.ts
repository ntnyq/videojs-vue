import { defineComponent, h, shallowRef } from 'vue'
import type { PropType } from 'vue'
import { MEDIA_EVENTS } from './media/events'
import type { MediaEventName } from './media/events'
import { mediaProps } from './media/props'
import { Video } from './media/Video'
import { createPlayerActions } from './player/actions'
import { PlayerRoot, playerEmits } from './player/PlayerRoot'
import type { PlayerHandle } from './player/types'
import { DefaultVideoSkin, NeutralVideoSkin } from './skins'

/**
 * Supported media components share the Video props, events and context contract.
 */
export type VideoMediaComponent = typeof Video

const component = defineComponent({
  name: 'VideoPlayer',
  inheritAttrs: false,
  props: {
    ...mediaProps,
    title: String,
    media: {
      type: Object as PropType<VideoMediaComponent>,
      default: () => Video,
    },
    skin: {
      type: String as PropType<'default' | 'neutral'>,
      default: 'default',
    },
  },
  emits: playerEmits,
  setup(props, { attrs, slots, emit, expose }) {
    const root = shallowRef<PlayerHandle | null>(null)

    const handle: PlayerHandle = {
      get element() {
        return root.value?.element ?? null
      },
      get store() {
        return root.value?.store ?? null
      },
      get media() {
        return root.value?.media ?? null
      },
      ...createPlayerActions(() => root.value?.store ?? null),
    }

    expose(handle)

    const emitMedia = emit as (name: MediaEventName, event: Event) => void

    const listeners = Object.fromEntries(
      MEDIA_EVENTS.map(name => [
        `on${name.charAt(0).toUpperCase()}${name.slice(1)}`,
        (event: Event) => emitMedia(name, event),
      ]),
    )
    return () =>
      h(
        PlayerRoot,
        {
          ...listeners,
          ref: root,
          title: props.title,
          poster: props.poster,
          onReady: () => emit('ready', handle),
          'onUpdate:volume': (volume: number) => emit('update:volume', volume),
          'onUpdate:muted': (muted: boolean) => emit('update:muted', muted),
          'onUpdate:playbackRate': (rate: number) =>
            emit('update:playbackRate', rate),
        },
        {
          default: () =>
            h(
              props.skin === 'neutral' ? NeutralVideoSkin : DefaultVideoSkin,
              attrs,
              {
                poster: slots['poster'],
                thumbnail: slots['thumbnail'],
                default: () =>
                  h(props.media, {
                    src: props.src,
                    poster: props.poster,
                    autoplay: props.autoplay,
                    loop: props.loop,
                    preload: props.preload,
                    playsinline: props.playsinline,
                    crossorigin: props.crossorigin,
                    tracks: props.tracks,
                    volume: props.volume,
                    muted: props.muted,
                    playbackRate: props.playbackRate,
                  }),
              },
            ),
        },
      )
  },
})

/**
 * Vue component ref exposes the player handle alongside the standard instance.
 */
export const VideoPlayer = component as typeof component & {
  new (): InstanceType<typeof component> & PlayerHandle
}

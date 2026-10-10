import { defineComponent, h, shallowRef } from 'vue'
import type { PropType } from 'vue'
import { MEDIA_EVENTS } from '../media/events'
import type { MediaEventName } from '../media/events'
import { commonMediaProps } from '../media/props'
import { createCommonPlayerActions } from '../player/actions'
import { Audio } from './Audio'
import { AudioPlayerRoot, audioPlayerEmits } from './AudioPlayerRoot'
import { DefaultAudioSkin, NeutralAudioSkin } from './skins'
import type { AudioPlayerHandle } from './types'

/**
 * Supported media components share the Audio props, events and context contract.
 */
export type AudioMediaComponent = typeof Audio

const component = defineComponent({
  name: 'AudioPlayer',
  inheritAttrs: false,
  props: {
    ...commonMediaProps,
    title: String,
    poster: String,
    media: {
      type: Object as PropType<AudioMediaComponent>,
      default: () => Audio,
    },
    skin: {
      type: String as PropType<'default' | 'neutral'>,
      default: 'default',
    },
  },
  emits: audioPlayerEmits,
  setup(props, { attrs, slots, emit, expose }) {
    const root = shallowRef<AudioPlayerHandle | null>(null)

    const handle: AudioPlayerHandle = {
      get element() {
        return root.value?.element ?? null
      },
      get store() {
        return root.value?.store ?? null
      },
      get media() {
        return root.value?.media ?? null
      },
      ...createCommonPlayerActions(() => root.value?.store ?? null),
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
        AudioPlayerRoot,
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
              props.skin === 'neutral' ? NeutralAudioSkin : DefaultAudioSkin,
              attrs,
              {
                poster: slots['poster'],
                default: () =>
                  h(
                    props.media,
                    {
                      src: props.src,
                      autoplay: props.autoplay,
                      loop: props.loop,
                      preload: props.preload,
                      crossorigin: props.crossorigin,
                      tracks: props.tracks,
                      volume: props.volume,
                      muted: props.muted,
                      playbackRate: props.playbackRate,
                    },
                    { default: slots['default'] },
                  ),
              },
            ),
        },
      )
  },
})

/**
 * Vue component ref exposes the player handle alongside the standard instance.
 */
export const AudioPlayer = component as typeof component & {
  new (): InstanceType<typeof component> & AudioPlayerHandle
}

import { defineComponent, h, shallowRef } from 'vue'
import type { Component, PropType } from 'vue'
import { MEDIA_EVENTS } from '../media/events'
import type { MediaEventName } from '../media/events'
import { commonMediaProps } from '../media/props'
import { createOnDemandPlayerActions } from '../player/actions'
import { Audio } from './Audio'
import { AudioPlayerRoot, audioPlayerEmits } from './AudioPlayerRoot'
import type { AudioPlayerHandle } from './types'

/**
 * Supported media components share the Audio props, events and context contract.
 */
export type AudioMediaComponent = typeof Audio

export function createAudioPlayer<Skin extends 'default' | 'neutral'>(
  componentName: string,
  skins: Record<Skin, Component>,
  initialSkin: NoInfer<Skin>,
) {
  const component = defineComponent({
    name: componentName,
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
        default: initialSkin as 'default' | 'neutral',
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
        ...createOnDemandPlayerActions(() => root.value?.store ?? null),
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
            'onUpdate:volume': (volume: number) =>
              emit('update:volume', volume),
            'onUpdate:muted': (muted: boolean) => emit('update:muted', muted),
            'onUpdate:playbackRate': (rate: number) =>
              emit('update:playbackRate', rate),
          },
          {
            default: () =>
              h(skins[props.skin as Skin] ?? skins[initialSkin], attrs, {
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
              }),
          },
        )
    },
  })

  // Vue cannot infer generic runtime props or expose() handles.
  // Replace the constructor signature so callers see only bound skin keys.
  type Instance = InstanceType<typeof component> & AudioPlayerHandle
  return component as unknown as Omit<typeof component, never> & {
    new (): Instance & { $props: { skin?: Skin } }
  }
}

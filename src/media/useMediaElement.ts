import {
  h,
  inject,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  shallowRef,
  watch,
} from 'vue'
import type { EmitFn, SetupContext } from 'vue'
import { MEDIA_CONTEXT } from '../player/context'
import { MEDIA_EVENTS } from './events'
import type { mediaEmits, MediaEventName } from './events'
import type { CommonMediaProps, MediaProps } from './props'
import type { PlayerMedia } from './types'

interface MediaElementOptions {
  tag: string
  props: CommonMediaProps & Partial<Pick<MediaProps, 'poster' | 'playsinline'>>
  context: Pick<SetupContext, 'attrs' | 'slots' | 'expose'>
  emit: EmitFn<typeof mediaEmits>
  extraProps?: () => Record<string, unknown>
  onUnmount?: (media: PlayerMedia) => void
}

export function useMediaElement({
  tag,
  props,
  context,
  emit,
  extraProps = () => ({}),
  onUnmount,
}: MediaElementOptions) {
  const emitMedia = emit as (name: MediaEventName, event: Event) => void
  const player = inject(MEDIA_CONTEXT, null)
  const element = shallowRef<PlayerMedia | null>(null)
  const isActive = shallowRef(true)
  const initialMuted = props.muted

  onActivated(() => {
    isActive.value = true
  })
  onDeactivated(() => {
    isActive.value = false
  })

  context.expose({
    get element() {
      return element.value
    },
  })

  function syncSettings(media: PlayerMedia) {
    const store = player?.handle.media === media ? player.handle.store : null
    const muteRequest = props.muted ?? media.muted
    if (props.volume !== undefined && Number.isFinite(props.volume)) {
      const volume = Math.min(1, Math.max(0, props.volume))
      if (store) {
        store.setVolume(volume)
      } else if (media.volume !== volume) {
        media.volume = volume
      }
    }
    // Upstream volume actions unmute. Preserve mute unless the caller requested it.
    if (store && (store.muted !== muteRequest || media.muted !== muteRequest)) {
      store.setMuted(muteRequest)
    } else if (media.muted !== muteRequest) {
      media.muted = muteRequest
    }
    if (
      props.playbackRate !== undefined &&
      Number.isFinite(props.playbackRate) &&
      props.playbackRate > 0
    ) {
      if (store) {
        store.setPlaybackRate(props.playbackRate)
      } else if (media.playbackRate !== props.playbackRate) {
        media.playbackRate = props.playbackRate
      }
    }
  }

  watch(
    [element, isActive],
    ([media, active], [previous], onCleanup) => {
      if (previous && previous !== media && player?.handle.media === previous) {
        player.setMedia(null)
      }
      if (!media || !active) {
        return
      }
      player?.setMedia(media)
      const listeners = MEDIA_EVENTS.map(name => {
        const listener = (event: Event) => {
          if (name === 'loadedmetadata') {
            syncSettings(media)
          }
          emitMedia(name, event)
          player?.onMediaEvent(name, event)
        }
        media.addEventListener(name, listener)
        return () => media.removeEventListener(name, listener)
      })
      onCleanup(() => {
        for (const remove of listeners) {
          remove()
        }
      })
    },
    { flush: 'sync' },
  )

  watch(
    [
      element,
      () => player?.handle.store,
      () => props.volume,
      () => props.muted,
      () => props.playbackRate,
    ],
    ([media]) => {
      if (media) {
        syncSettings(media)
      }
    },
    { flush: 'post' },
  )
  onBeforeUnmount(() => {
    const media = element.value
    media?.removeAttribute('keep-alive')
    media?.pause()
    if (media) {
      onUnmount?.(media)
    }
    if (player?.handle.media === element.value) {
      player?.setMedia(null)
    }
    element.value = null
  })

  return () =>
    h(
      tag,
      {
        ...context.attrs,
        ref: element,
        // Preserve the adapter through Vue KeepAlive; release it on actual unmount.
        ...(tag === 'video' || tag === 'audio' ? {} : { 'keep-alive': '' }),
        ...(props.src === undefined ? {} : { src: props.src }),
        poster: props.poster,
        autoplay: props.autoplay ? '' : undefined,
        loop: props.loop ? '' : undefined,
        preload: props.preload,
        playsinline: props.playsinline ? '' : undefined,
        crossorigin: props.crossorigin,
        // Keep the initial autoplay hint stable. syncSettings owns later changes.
        // Undefined relinquishes control without changing the live mute state.
        '^muted': initialMuted ? '' : undefined,
        ...extraProps(),
      },
      [
        ...(props.tracks?.map(track =>
          h('track', {
            ...track,
            key: `${track.kind}:${track.src}:${track.srclang}`,
          }),
        ) ?? []),
        context.slots['default']?.(),
      ],
    )
}

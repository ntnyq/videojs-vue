import type { AudioPlayerStore } from '@videojs/html'
import { computed, inject, toValue } from 'vue'
import type { InjectionKey, MaybeRefOrGetter } from 'vue'
import type { MediaEventName } from '../media/events'
import type { PlayerMedia } from '../media/types'

export type MediaSettingsStore = Pick<
  AudioPlayerStore,
  'volume' | 'muted' | 'setVolume' | 'setMuted'
> &
  Partial<Pick<AudioPlayerStore, 'setPlaybackRate'>>

interface MediaContext {
  handle: {
    readonly media: PlayerMedia | null
    readonly store: MediaSettingsStore | null
  }
  setMedia: (media: PlayerMedia | null) => void
  onMediaEvent: (name: MediaEventName, event: Event) => void
}
export const MEDIA_CONTEXT: InjectionKey<MediaContext> =
  Symbol('videojs-vue.media')

export function useTarget<Handle>(
  key: InjectionKey<Handle>,
  rootName: string,
  target?: MaybeRefOrGetter<Handle | null | undefined>,
) {
  if (target !== undefined) {
    return computed(() => toValue(target))
  }
  const handle = inject(key, null)
  if (!handle) {
    throw new Error(
      `[videojs-vue] Use this composable inside ${rootName} or pass a player ref.`,
    )
  }
  return computed(() => handle)
}

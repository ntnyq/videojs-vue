import { computed, inject, toValue } from 'vue'
import type { InjectionKey, MaybeRefOrGetter } from 'vue'
import type { AudioPlayerHandle } from '../audio/types'
import type { MediaEventName } from '../media/events'
import type { PlayerMedia } from '../media/types'
import type { PlayerHandle, PlayerTarget } from './types'

interface MediaContext {
  handle: Pick<AudioPlayerHandle, 'media' | 'store'>
  setMedia: (media: PlayerMedia | null) => void
  onMediaEvent: (name: MediaEventName, event: Event) => void
}
export const MEDIA_CONTEXT: InjectionKey<MediaContext> =
  Symbol('videojs-vue.media')
export const PLAYER_CONTEXT: InjectionKey<PlayerHandle> =
  Symbol('videojs-vue.player')
export const AUDIO_PLAYER_CONTEXT: InjectionKey<AudioPlayerHandle> =
  Symbol('videojs-vue.audio')

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

export function usePlayerTarget(target?: PlayerTarget) {
  return useTarget(PLAYER_CONTEXT, 'PlayerRoot', target)
}

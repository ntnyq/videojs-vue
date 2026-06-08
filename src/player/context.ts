import { computed, inject, toValue } from 'vue'
import type { InjectionKey } from 'vue'
import type { MediaEventName } from '../media/events'
import type { PlayerHandle, PlayerMedia, PlayerTarget } from './types'

export interface PlayerContext {
  handle: PlayerHandle
  setMedia: (media: PlayerMedia | null) => void
  onMediaEvent: (name: MediaEventName, event: Event) => void
}
export const PLAYER_CONTEXT: InjectionKey<PlayerContext> =
  Symbol('videojs-vue.player')

export function usePlayerTarget(target?: PlayerTarget) {
  if (target !== undefined) {
    return computed(() => toValue(target))
  }
  const context = inject(PLAYER_CONTEXT, null)
  if (!context) {
    throw new Error(
      '[videojs-vue] Use this composable inside PlayerRoot or pass a player ref.',
    )
  }
  return computed(() => context.handle)
}

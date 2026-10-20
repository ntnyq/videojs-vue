import type { InjectionKey } from 'vue'
import type { LivePlayerHandle } from './types'

export const LIVE_PLAYER_CONTEXT: InjectionKey<LivePlayerHandle> =
  Symbol('videojs-vue.live')

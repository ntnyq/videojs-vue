import type { InjectionKey } from 'vue'
import type { LiveVideoPlayerHandle } from './types'

export const LIVE_VIDEO_PLAYER_CONTEXT: InjectionKey<LiveVideoPlayerHandle> =
  Symbol('videojs-vue.live')

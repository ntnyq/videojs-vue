import type { InjectionKey } from 'vue'
import type { AudioPlayerHandle } from './types'

export const AUDIO_PLAYER_CONTEXT: InjectionKey<AudioPlayerHandle> =
  Symbol('videojs-vue.audio')

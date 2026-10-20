import type { InjectionKey } from 'vue'
import { useTarget } from '../player/context'
import type { VideoPlayerHandle, VideoPlayerTarget } from './types'

export const VIDEO_PLAYER_CONTEXT: InjectionKey<VideoPlayerHandle> =
  Symbol('videojs-vue.video')

export function useVideoPlayerTarget(target?: VideoPlayerTarget) {
  return useTarget(VIDEO_PLAYER_CONTEXT, 'VideoPlayerRoot', target)
}

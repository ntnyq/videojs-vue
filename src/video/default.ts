import { createVideoPlayer } from './createVideoPlayer'
import { DefaultVideoSkin } from './skins/default'

export type { VideoMediaComponent } from './createVideoPlayer'
export type * from './types'
export const VideoPlayer = /* @__PURE__ */ createVideoPlayer(
  'DefaultVideoPlayer',
  { default: DefaultVideoSkin },
  'default',
)

import { createVideoPlayer } from './createVideoPlayer'
import { CompatVideoSkin } from './skins/compat'

export type { VideoMediaComponent } from './createVideoPlayer'
export type * from './types'
export const VideoPlayer = /* @__PURE__ */ createVideoPlayer(
  'CompatVideoPlayer',
  { compat: CompatVideoSkin },
  'compat',
)

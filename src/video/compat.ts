import { CompatVideoSkin } from '../skins/compat'
import { createVideoPlayer } from './createVideoPlayer'

export type { VideoMediaComponent } from './createVideoPlayer'
export type * from '../player/types'
export const VideoPlayer = /* @__PURE__ */ createVideoPlayer(
  'CompatVideoPlayer',
  { compat: CompatVideoSkin },
  'compat',
)

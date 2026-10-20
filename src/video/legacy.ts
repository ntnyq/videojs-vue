import { createVideoPlayer } from './createVideoPlayer'
import { LegacyVideoSkin } from './skins/legacy'

export type { VideoMediaComponent } from './createVideoPlayer'

export type * from './types'

export const VideoPlayer = /* @__PURE__ */ createVideoPlayer(
  'LegacyVideoPlayer',
  { legacy: LegacyVideoSkin },
  'legacy',
)

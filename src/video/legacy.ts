import { LegacyVideoSkin } from '../skins/legacy'
import { createVideoPlayer } from './createVideoPlayer'

export type { VideoMediaComponent } from './createVideoPlayer'

export type * from '../player/types'

export const VideoPlayer = /* @__PURE__ */ createVideoPlayer(
  'LegacyVideoPlayer',
  { legacy: LegacyVideoSkin },
  'legacy',
)

import { createVideoPlayer } from '../createVideoPlayer'
import { NeutralVideoSkin } from '../skins/neutral'

export type { VideoMediaComponent } from '../createVideoPlayer'
export type * from '../player/types'
export const VideoPlayer = /* @__PURE__ */ createVideoPlayer(
  'NeutralVideoPlayer',
  { neutral: NeutralVideoSkin },
  'neutral',
)

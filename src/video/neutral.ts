import { NeutralVideoSkin } from '../skins/neutral'
import { createVideoPlayer } from './createVideoPlayer'

export type { VideoMediaComponent } from './createVideoPlayer'
export type * from '../player/types'
export const VideoPlayer = /* @__PURE__ */ createVideoPlayer(
  'NeutralVideoPlayer',
  { neutral: NeutralVideoSkin },
  'neutral',
)

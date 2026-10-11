import { createVideoPlayer } from './createVideoPlayer'
import { DefaultVideoSkin, NeutralVideoSkin } from './skins'

export type { VideoMediaComponent } from './createVideoPlayer'
export const VideoPlayer = /* @__PURE__ */ createVideoPlayer(
  'VideoPlayer',
  { default: DefaultVideoSkin, neutral: NeutralVideoSkin },
  'default',
)

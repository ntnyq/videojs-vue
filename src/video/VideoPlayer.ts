import { DefaultVideoSkin, NeutralVideoSkin } from '../skins'
import { createVideoPlayer } from './createVideoPlayer'

export type { VideoMediaComponent } from './createVideoPlayer'
export const VideoPlayer = /* @__PURE__ */ createVideoPlayer(
  'VideoPlayer',
  { default: DefaultVideoSkin, neutral: NeutralVideoSkin },
  'default',
)

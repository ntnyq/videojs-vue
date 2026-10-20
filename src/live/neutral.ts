import { createLiveVideoPlayer } from './createLiveVideoPlayer'
import { NeutralLiveVideoSkin } from './skins/neutral'

export type { LiveVideoMediaComponent } from './createLiveVideoPlayer'
export type * from './types'
export const LiveVideoPlayer = /* @__PURE__ */ createLiveVideoPlayer(
  'NeutralLiveVideoPlayer',
  { neutral: NeutralLiveVideoSkin },
  'neutral',
)

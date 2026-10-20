import { createLiveVideoPlayer } from './createLiveVideoPlayer'
import { LiveVideoSkin } from './skins/default'
import { NeutralLiveVideoSkin } from './skins/neutral'

export type { LiveVideoMediaComponent } from './createLiveVideoPlayer'
export const LiveVideoPlayer = /* @__PURE__ */ createLiveVideoPlayer(
  'LiveVideoPlayer',
  { default: LiveVideoSkin, neutral: NeutralLiveVideoSkin },
  'default',
)

import { createLiveVideoPlayer } from './createLiveVideoPlayer'
import { LiveVideoSkin } from './skins/default'

export type { LiveVideoMediaComponent } from './createLiveVideoPlayer'
export type * from './types'
export const LiveVideoPlayer = /* @__PURE__ */ createLiveVideoPlayer(
  'DefaultLiveVideoPlayer',
  { default: LiveVideoSkin },
  'default',
)

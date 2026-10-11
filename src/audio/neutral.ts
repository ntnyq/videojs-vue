import { createAudioPlayer } from './createAudioPlayer'
import { NeutralAudioSkin } from './skins/neutral'

export type { AudioMediaComponent } from './createAudioPlayer'
export type * from './types'
export const AudioPlayer = /* @__PURE__ */ createAudioPlayer(
  'NeutralAudioPlayer',
  { neutral: NeutralAudioSkin },
  'neutral',
)

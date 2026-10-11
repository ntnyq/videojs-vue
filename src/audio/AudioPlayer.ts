import { createAudioPlayer } from './createAudioPlayer'
import { DefaultAudioSkin, NeutralAudioSkin } from './skins'

export type { AudioMediaComponent } from './createAudioPlayer'
export const AudioPlayer = /* @__PURE__ */ createAudioPlayer(
  'AudioPlayer',
  { default: DefaultAudioSkin, neutral: NeutralAudioSkin },
  'default',
)

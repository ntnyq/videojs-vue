import { createAudioPlayer } from './createAudioPlayer'
import { DefaultAudioSkin } from './skins/default'

export type { AudioMediaComponent } from './createAudioPlayer'
export type * from './types'
export const AudioPlayer = /* @__PURE__ */ createAudioPlayer(
  'DefaultAudioPlayer',
  { default: DefaultAudioSkin },
  'default',
)

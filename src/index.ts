import './register/video/player'
import './register/video/skin'
import './register/video/neutral-skin'

export { VideoPlayer } from './video/VideoPlayer'
export type { VideoMediaComponent } from './video/VideoPlayer'
export { PlayerRoot } from './player/PlayerRoot'
export { Video } from './media/Video'
export { DefaultVideoSkin, NeutralVideoSkin } from './skins'
export { usePlayerState } from './composables/usePlayerState'
export { usePlayerActions } from './composables/usePlayerActions'
export type { MediaEventName } from './media/events'
export type { MediaProps } from './media/props'
export type { MediaTrack, PlayerMedia } from './media/types'
export type {
  PlayerActions,
  PlayerHandle,
  PlayerElement,
  PlayerState,
  PlayerStore,
  PlayerTarget,
} from './player/types'

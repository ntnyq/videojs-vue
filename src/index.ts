import './register/video/player'
import './register/video/skin'
import './register/video/neutral-skin'

export { VideoPlayer } from './VideoPlayer'
export type { VideoMediaComponent } from './VideoPlayer'
export { PlayerRoot } from './player/PlayerRoot'
export { Video } from './media/Video'
export { DefaultVideoSkin, NeutralVideoSkin } from './skins'
export { usePlayerState } from './composables/usePlayerState'
export { usePlayerActions } from './composables/usePlayerActions'
export type { MediaEventName } from './media/events'
export type { MediaProps } from './media/props'
export type {
  MediaTrack,
  PlayerActions,
  PlayerHandle,
  PlayerElement,
  PlayerMedia,
  PlayerState,
  PlayerStore,
  PlayerTarget,
} from './player/types'

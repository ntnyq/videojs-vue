import './register/video/player'
import './register/video/skin'
import './register/video/neutral-skin'

export { VideoPlayer } from './video/VideoPlayer'
export type { VideoMediaComponent } from './video/VideoPlayer'
export { VideoPlayerRoot } from './video/VideoPlayerRoot'
export { Video } from './media/Video'
export { DefaultVideoSkin, NeutralVideoSkin } from './video/skins'
export { useVideoPlayerState } from './video/useVideoPlayerState'
export { useVideoPlayerActions } from './video/useVideoPlayerActions'
export type { MediaEventName } from './media/events'
export type { VideoMediaProps } from './media/props'
export type { MediaTrack, PlayerMedia } from './media/types'
export type {
  VideoPlayerActions,
  VideoPlayerHandle,
  VideoPlayerElement,
  VideoPlayerState,
  VideoPlayerStore,
  VideoPlayerTarget,
} from './video/types'

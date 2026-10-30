import '../register/ui/playback-rate-button'
import { createElementComponent } from './createElementComponent'
import { buttonProps } from './props'

export const PlaybackRateButton = /* @__PURE__ */ createElementComponent(
  'PlaybackRateButton',
  'media-playback-rate-button',
  {
    ...buttonProps,
    commandfor: String,
  },
)

import '../register/ui/seek-button'
import { createElementComponent } from './createElementComponent'
import { buttonProps } from './props'

export const SeekButton = /* @__PURE__ */ createElementComponent(
  'SeekButton',
  'media-seek-button',
  { ...buttonProps, seconds: Number },
)

import '../register/ui/tooltip'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean, positionProps } from './props'

export const Tooltip = /* @__PURE__ */ createElementComponent(
  'Tooltip',
  'media-tooltip',
  {
    ...positionProps,
    delay: Number,
    closeDelay: Number,
    disableHoverablePopup: optionalBoolean,
    disabled: optionalBoolean,
    sticky: optionalBoolean,
    trigger: String,
  },
)

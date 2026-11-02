import '../register/ui/menu-item-indicator'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const MediaMenuItemIndicator = /* @__PURE__ */ createElementComponent(
  'MediaMenuItemIndicator',
  'media-menu-item-indicator',
  { checked: optionalBoolean, forceMount: optionalBoolean },
)

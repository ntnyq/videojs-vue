import '../register/ui/menu-item'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const MediaMenuItem = /* @__PURE__ */ createElementComponent(
  'MediaMenuItem',
  'media-menu-item',
  { disabled: optionalBoolean, commandfor: String },
)

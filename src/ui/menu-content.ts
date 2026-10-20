import '../register/ui/menu-content'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const MediaMenuContent = /* @__PURE__ */ createElementComponent(
  'MediaMenuContent',
  'media-menu-content',
  {
    open: optionalBoolean,
    defaultOpen: optionalBoolean,
  },
)

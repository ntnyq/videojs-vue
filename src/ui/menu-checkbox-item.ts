import '../register/ui/menu-checkbox-item'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const MediaMenuCheckboxItem = /* @__PURE__ */ createElementComponent(
  'MediaMenuCheckboxItem',
  'media-menu-checkbox-item',
  { checked: optionalBoolean, disabled: optionalBoolean },
)

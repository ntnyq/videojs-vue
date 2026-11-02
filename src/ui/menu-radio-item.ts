import '../register/ui/menu-radio-item'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const MediaMenuRadioItem = /* @__PURE__ */ createElementComponent(
  'MediaMenuRadioItem',
  'media-menu-radio-item',
  { value: String, disabled: optionalBoolean },
)

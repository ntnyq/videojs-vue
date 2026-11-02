import '../register/ui/tooltip-group'
import { createElementComponent } from './createElementComponent'

export const TooltipGroup = /* @__PURE__ */ createElementComponent(
  'TooltipGroup',
  'media-tooltip-group',
  { delay: Number, closeDelay: Number, timeout: Number },
)

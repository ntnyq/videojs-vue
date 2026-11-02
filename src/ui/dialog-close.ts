import '../register/ui/dialog-close'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const MediaDialogClose = /* @__PURE__ */ createElementComponent(
  'MediaDialogClose',
  'media-dialog-close',
  { disabled: optionalBoolean },
)

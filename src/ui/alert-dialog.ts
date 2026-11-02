import '../register/ui/alert-dialog'
import { createElementComponent } from './createElementComponent'
import { dialogProps } from './props'

export const AlertDialog = /* @__PURE__ */ createElementComponent(
  'AlertDialog',
  'media-alert-dialog',
  dialogProps,
)

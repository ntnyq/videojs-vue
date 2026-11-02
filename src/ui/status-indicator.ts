import '../register/ui/status-indicator'
import type { StatusIndicatorElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'

export const StatusIndicator = /* @__PURE__ */ createElementComponent(
  'StatusIndicator',
  'media-status-indicator',
  {
    actions: String,
    closeDelay: Number,
    deriveCustomStatus: Function as PropType<
      StatusIndicatorElement['deriveCustomStatus']
    >,
  },
)

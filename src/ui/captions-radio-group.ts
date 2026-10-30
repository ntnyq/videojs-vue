import '../register/ui/captions-radio-group'
import type { CaptionsRadioGroupElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'
import { buttonProps } from './props'

export const CaptionsRadioGroup = /* @__PURE__ */ createElementComponent(
  'CaptionsRadioGroup',
  'media-captions-radio-group',
  {
    ...buttonProps,
    formatTrack: Function as PropType<CaptionsRadioGroupElement['formatTrack']>,
  },
)

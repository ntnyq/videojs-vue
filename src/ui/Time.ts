import '../register/ui/time'
import type { TimeElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const Time = /* @__PURE__ */ createElementComponent(
  'Time',
  'media-time',
  {
    type: String as PropType<TimeElement['type']>,
    toggle: optionalBoolean,
    negativeSign: String,
    label: String,
  },
)

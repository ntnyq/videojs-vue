import '../register/ui/gesture'
import type { GestureElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const MediaGesture = /* @__PURE__ */ createElementComponent(
  'MediaGesture',
  'media-gesture',
  {
    type: String as PropType<GestureElement['type']>,
    action: String as PropType<GestureElement['action']>,
    value: Number,
    pointer: String as PropType<GestureElement['pointer']>,
    region: String as PropType<GestureElement['region']>,
    disabled: optionalBoolean,
  },
)

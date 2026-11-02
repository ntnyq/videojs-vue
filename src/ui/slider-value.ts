import '../register/ui/slider-value'
import type { SliderValueElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'

export const SliderValue = /* @__PURE__ */ createElementComponent(
  'SliderValue',
  'media-slider-value',
  { type: String as PropType<SliderValueElement['type']> },
)

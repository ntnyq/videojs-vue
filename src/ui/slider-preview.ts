import '../register/ui/slider-preview'
import type { SliderPreviewElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'

export const SliderPreview = /* @__PURE__ */ createElementComponent(
  'SliderPreview',
  'media-slider-preview',
  { overflow: String as PropType<SliderPreviewElement['overflow']> },
)

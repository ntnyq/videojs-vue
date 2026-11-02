import '../register/ui/slider'
import { createElementComponent } from './createElementComponent'
import { sliderProps } from './props'

export const MediaSlider = /* @__PURE__ */ createElementComponent(
  'MediaSlider',
  'media-slider',
  { ...sliderProps, value: Number, min: Number, max: Number },
)

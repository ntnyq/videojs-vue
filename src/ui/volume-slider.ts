import '../register/ui/volume-slider'
import { createElementComponent } from './createElementComponent'
import { sliderProps } from './props'

export const VolumeSlider = /* @__PURE__ */ createElementComponent(
  'VolumeSlider',
  'media-volume-slider',
  sliderProps,
)

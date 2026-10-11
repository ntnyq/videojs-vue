import '../register/ui/time-slider'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean, sliderProps } from './props'

export const TimeSlider = /* @__PURE__ */ createElementComponent(
  'TimeSlider',
  'media-time-slider',
  { ...sliderProps, pauseOnDrag: optionalBoolean, changeThrottle: Number },
)

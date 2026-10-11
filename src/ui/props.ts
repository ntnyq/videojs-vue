import type { TimeSliderElement } from '@videojs/html'
import type { PropType } from 'vue'

export const optionalBoolean = {
  type: Boolean,
  default: undefined,
} as const
export const buttonProps = {
  disabled: optionalBoolean,
  label: String,
}
export const sliderProps = {
  ...buttonProps,
  step: Number,
  largeStep: Number,
  orientation: String as PropType<TimeSliderElement['orientation']>,
}

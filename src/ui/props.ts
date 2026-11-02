import type {
  PlayButtonElement,
  PopoverElement,
  ThumbnailElement,
  TimeSliderElement,
} from '@videojs/html'
import type { PropType } from 'vue'

export const optionalBoolean = {
  type: Boolean,
  default: undefined,
} as const
export const buttonProps = {
  disabled: optionalBoolean,
  label: [String, Object] as PropType<PlayButtonElement['label']>,
}
export const sliderProps = {
  ...buttonProps,
  step: Number,
  largeStep: Number,
  orientation: String as PropType<TimeSliderElement['orientation']>,
  thumbAlignment: String as PropType<TimeSliderElement['thumbAlignment']>,
}

export const positionProps = {
  open: optionalBoolean,
  defaultOpen: optionalBoolean,
  side: String as PropType<PopoverElement['side']>,
  align: String as PropType<PopoverElement['align']>,
  boundary: [String, Object] as PropType<PopoverElement['boundary']>,
}
export const popoverProps = {
  ...positionProps,
  modal: optionalBoolean,
  closeOnEscape: optionalBoolean,
  closeOnOutsideClick: optionalBoolean,
  openOnHover: optionalBoolean,
  delay: Number,
  closeDelay: Number,
}
export const dialogProps = {
  open: optionalBoolean,
  defaultOpen: optionalBoolean,
  closeOnEscape: optionalBoolean,
}
export const thumbnailProps = {
  time: Number,
  thumbnails: Array as PropType<ThumbnailElement['thumbnails']>,
  crossOrigin: String as PropType<ThumbnailElement['crossOrigin']>,
  loading: String as PropType<ThumbnailElement['loading']>,
  fetchPriority: String as PropType<ThumbnailElement['fetchPriority']>,
}

import '@videojs/html/ui/container'
import '@videojs/html/ui/controls'
import '@videojs/html/ui/controls-content'
import '@videojs/html/ui/controls-group'
import '@videojs/html/ui/play-button'
import '@videojs/html/ui/mute-button'
import '@videojs/html/ui/fullscreen-button'
import '@videojs/html/ui/pip-button'
import '@videojs/html/ui/captions-button'
import '@videojs/html/ui/seek-button'
import '@videojs/html/ui/time'
import '@videojs/html/ui/time-slider'
import '@videojs/html/ui/volume-slider'
import '@videojs/html/ui/slider-track'
import '@videojs/html/ui/slider-fill'
import '@videojs/html/ui/slider-buffer'
import '@videojs/html/ui/slider-thumb'
import '@videojs/html/ui/hotkey'
import '@videojs/html/ui/poster'
import '@videojs/html/ui/status-announcer'
import type {
  HotkeyElement,
  TimeElement,
  TimeSliderElement,
  ControlsElement,
} from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'

const optionalBoolean = {
  type: Boolean,
  default: undefined,
} as const
const buttonProps = {
  disabled: optionalBoolean,
  label: String,
}
const sliderProps = {
  ...buttonProps,
  step: Number,
  largeStep: Number,
  orientation: String as PropType<TimeSliderElement['orientation']>,
}

export const MediaContainer = createElementComponent(
  'MediaContainer',
  'media-container',
  {},
)

export const MediaControls = createElementComponent(
  'MediaControls',
  'media-controls',
  { visibility: String as PropType<ControlsElement['visibility']> },
)

export const MediaControlsContent = createElementComponent(
  'MediaControlsContent',
  'media-controls-content',
  {},
)

export const MediaControlsGroup = createElementComponent(
  'MediaControlsGroup',
  'media-controls-group',
  {},
)

export const PlayButton = createElementComponent(
  'PlayButton',
  'media-play-button',
  buttonProps,
)

export const MuteButton = createElementComponent(
  'MuteButton',
  'media-mute-button',
  buttonProps,
)

export const FullscreenButton = createElementComponent(
  'FullscreenButton',
  'media-fullscreen-button',
  buttonProps,
)

export const PiPButton = createElementComponent(
  'PiPButton',
  'media-pip-button',
  buttonProps,
)

export const CaptionsButton = createElementComponent(
  'CaptionsButton',
  'media-captions-button',
  buttonProps,
)

export const SeekButton = createElementComponent(
  'SeekButton',
  'media-seek-button',
  { ...buttonProps, seconds: Number },
)

export const Time = createElementComponent('Time', 'media-time', {
  type: String as PropType<TimeElement['type']>,
  toggle: optionalBoolean,
  negativeSign: String,
  label: String,
})

export const TimeSlider = createElementComponent(
  'TimeSlider',
  'media-time-slider',
  { ...sliderProps, pauseOnDrag: optionalBoolean, changeThrottle: Number },
)

export const VolumeSlider = createElementComponent(
  'VolumeSlider',
  'media-volume-slider',
  sliderProps,
)

export const SliderTrack = createElementComponent(
  'SliderTrack',
  'media-slider-track',
  {},
)

export const SliderFill = createElementComponent(
  'SliderFill',
  'media-slider-fill',
  {},
)

export const SliderBuffer = createElementComponent(
  'SliderBuffer',
  'media-slider-buffer',
  {},
)

export const SliderThumb = createElementComponent(
  'SliderThumb',
  'media-slider-thumb',
  {},
)

export const Poster = createElementComponent('Poster', 'media-poster', {})

export const StatusAnnouncer = createElementComponent(
  'StatusAnnouncer',
  'media-status-announcer',
  {},
)

export const Hotkey = createElementComponent('Hotkey', 'media-hotkey', {
  keys: String,
  action: String as PropType<HotkeyElement['action']>,
  value: Number,
  disabled: optionalBoolean,
  target: String as PropType<HotkeyElement['target']>,
})

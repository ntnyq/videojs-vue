export * from '@videojs/core/dom'

// Store
export type { Comparator, Selector } from '@videojs/store'
export { createSelector, shallowEqual } from '@videojs/store'

// Player API
export {
  Container,
  type ContainerProps,
  type PlayerContextValue,
  useContainer,
  useContainerAttach,
  useMedia,
  useMediaAttach,
  useOptionalPlayer,
  usePlayer,
  usePlayerContext,
} from './player/context'
export {
  type CreatePlayerConfig,
  type CreatePlayerResult,
  createPlayer,
  type PlayerRuntimePlugin,
  type ProviderProps,
  type RuntimeAttachContext,
  type RuntimePluginTarget,
  type RuntimeProviderContext,
  type UsePlayerHook,
} from './player/createPlayer'

// UI
export {
  FullscreenButton,
  type FullscreenButtonProps,
} from './ui/full-screen-button'
export {
  PlaybackRateButton,
  type PlaybackRateButtonProps,
} from './ui/playback-rate-button'
export { Poster, type PosterProps } from './ui/poster'
export {
  Time,
  type TimeGroupProps,
  type TimeParts,
  type TimeSeparatorProps,
  type TimeValueProps,
} from './ui/time'
export { PlayButton, type PlayButtonProps } from './ui/play-button'
export { MuteButton, type MuteButtonProps } from './ui/mute-button'
export { PiPButton, type PiPButtonProps } from './ui/pip-button'
export { SeekButton, type SeekButtonProps } from './ui/seek-button'
export {
  VolumeSlider,
  type SliderFillProps as VolumeSliderFillProps,
  type SliderPreviewProps as VolumeSliderPreviewProps,
  type SliderThumbProps as VolumeSliderThumbProps,
  type SliderTrackProps as VolumeSliderTrackProps,
  type SliderValueProps as VolumeSliderValueProps,
  type VolumeSliderParts,
  type VolumeSliderRootProps,
} from './ui/volume-slider'
export {
  TimeSlider,
  type SliderBufferProps as TimeSliderBufferProps,
  type SliderFillProps as TimeSliderFillProps,
  type SliderPreviewProps as TimeSliderPreviewProps,
  type SliderThumbProps as TimeSliderThumbProps,
  type SliderTrackProps as TimeSliderTrackProps,
  type SliderValueProps as TimeSliderValueProps,
  type TimeSliderParts,
  type TimeSliderRootProps,
} from './ui/time-slider'
export {
  Controls,
  type ControlsGroupProps,
  type ControlsParts,
  type ControlsRootProps,
} from './ui/controls'
export {
  Tooltip,
  type TooltipArrowProps,
  type TooltipContextValue,
  type TooltipParts,
  type TooltipPopupProps,
  type TooltipProviderProps,
  type TooltipRootProps,
  type TooltipTriggerProps,
  useOptionalTooltipContext,
  useTooltipContext,
} from './ui/tooltip'
export {
  Popover,
  type PopoverArrowProps,
  type PopoverContextValue,
  type PopoverParts,
  type PopoverPopupProps,
  type PopoverRootProps,
  type PopoverTriggerProps,
  usePopoverContext,
} from './ui/popover'
export { CaptionsButton, type CaptionsButtonProps } from './ui/captions-button'
export { CastButton, type CastButtonProps } from './ui/cast-button'
export {
  BufferingIndicator,
  type BufferingIndicatorProps,
} from './ui/buffering-indicator'
export {
  AlertDialog,
  type AlertDialogCloseProps,
  type AlertDialogContextValue,
  type AlertDialogDescriptionProps,
  type AlertDialogParts,
  type AlertDialogPopupProps,
  type AlertDialogRootProps,
  type AlertDialogTitleProps,
  useAlertDialogContext,
} from './ui/alert-dialog'
export {
  ErrorDialog,
  type ErrorDialogContextValue,
  type ErrorDialogDescriptionProps,
  type ErrorDialogParts,
  type ErrorDialogRootProps,
  useErrorDialogContext,
} from './ui/error-dialog'
export {
  Hotkey,
  type HotkeyProps,
  MediaHotkey,
  type MediaHotkeyProps,
} from './ui/hotkey'
export {
  Gesture,
  type GestureProps,
  MediaGesture,
  type MediaGestureProps,
} from './ui/gesture'
export {
  Thumbnail,
  type ThumbnailImage,
  type ThumbnailProps,
} from './ui/thumbnail'
export {
  Slider,
  type SliderBufferProps,
  type SliderFillProps,
  type SliderParts,
  type SliderPreviewProps,
  type SliderRootProps,
  type SliderThumbnailProps,
  type SliderThumbProps,
  type SliderTrackProps,
  type SliderValueProps,
} from './ui/slider'

// Utilities
export { mergeProps } from './ui/factories/mergeProps'
export { renderElement } from './ui/factories/renderElement'

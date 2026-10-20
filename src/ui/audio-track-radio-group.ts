import '../register/ui/audio-track-radio-group'
import type { AudioTrackRadioGroupElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'
import { buttonProps } from './props'

export const AudioTrackRadioGroup = /* @__PURE__ */ createElementComponent(
  'AudioTrackRadioGroup',
  'media-audio-track-radio-group',
  {
    ...buttonProps,
    formatTrack: Function as PropType<
      AudioTrackRadioGroupElement['formatTrack']
    >,
  },
)

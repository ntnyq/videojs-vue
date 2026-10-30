import '../register/ui/playback-rate-radio-group'
import type { PlaybackRateRadioGroupElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const PlaybackRateRadioGroup = /* @__PURE__ */ createElementComponent(
  'PlaybackRateRadioGroup',
  'media-playback-rate-radio-group',
  {
    disabled: optionalBoolean,
    formatRate: Function as PropType<
      PlaybackRateRadioGroupElement['formatRate']
    >,
  },
)

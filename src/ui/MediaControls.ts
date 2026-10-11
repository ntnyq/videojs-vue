import '../register/ui/controls'
import type { ControlsElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'

export const MediaControls = /* @__PURE__ */ createElementComponent(
  'MediaControls',
  'media-controls',
  { visibility: String as PropType<ControlsElement['visibility']> },
)

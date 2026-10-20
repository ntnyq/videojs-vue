import '../register/ui/quality-radio-group'
import type { QualityRadioGroupElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'
import { buttonProps } from './props'

export const QualityRadioGroup = /* @__PURE__ */ createElementComponent(
  'QualityRadioGroup',
  'media-quality-radio-group',
  {
    ...buttonProps,
    formatRendition: Function as PropType<
      QualityRadioGroupElement['formatRendition']
    >,
  },
)

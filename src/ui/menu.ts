import '../register/ui/menu'
import type { MenuElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const MediaMenu = /* @__PURE__ */ createElementComponent(
  'MediaMenu',
  'media-menu',
  {
    open: optionalBoolean,
    defaultOpen: optionalBoolean,
    side: String as PropType<MenuElement['side']>,
    align: String as PropType<MenuElement['align']>,
    closeOnEscape: optionalBoolean,
    closeOnOutsideClick: optionalBoolean,
    boundary: [String, Object] as PropType<MenuElement['boundary']>,
  },
)

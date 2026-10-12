import '../register/ui/hotkey'
import type { HotkeyElement } from '@videojs/html'
import type { PropType } from 'vue'
import { createElementComponent } from './createElementComponent'
import { optionalBoolean } from './props'

export const Hotkey = /* @__PURE__ */ createElementComponent(
  'Hotkey',
  'media-hotkey',
  {
    keys: String,
    action: String as PropType<HotkeyElement['action']>,
    value: Number,
    disabled: optionalBoolean,
    target: String as PropType<HotkeyElement['target']>,
  },
)

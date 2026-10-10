import '@videojs/html/i18n'
import type { MediaTextElement } from '@videojs/html/i18n'
import {
  Comment,
  defineComponent,
  h,
  isVNode,
  onMounted,
  shallowRef,
} from 'vue'
import type { PropType } from 'vue'

function getSlotText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(child => getSlotText(child)).join('')
  }
  if (isVNode(value) && value.type !== Comment) {
    return getSlotText(value.children)
  }
  return ''
}

/**
 * Translates a token using plain text from the default slot as its fallback.
 */
export const MediaText = defineComponent({
  name: 'MediaText',
  inheritAttrs: false,
  props: {
    token: String as PropType<string | undefined>,
  },
  setup(props, { attrs, slots }) {
    const element = shallowRef<MediaTextElement | null>(null)
    // Hydration can restore the fallback after an element has already translated.
    onMounted(() => element.value?.requestUpdate())
    return () => {
      const fallback = getSlotText(slots['default']?.()).trim()
      return h(
        'media-text',
        {
          'data-allow-mismatch': 'text',
          ...attrs,
          ref: element,
          // The upstream element captures its fallback only when first connected.
          key: fallback,
          token: props.token ?? '',
        },
        fallback,
      )
    }
  },
})

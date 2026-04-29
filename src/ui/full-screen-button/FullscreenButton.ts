import { computed, defineComponent, h, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
  VNodeRef,
} from 'vue'
import { useContainer, useMedia, useOptionalPlayer } from '../../player/context'

export interface FullscreenButtonProps extends ButtonHTMLAttributes {
  enterLabel?: string
  exitLabel?: string
}

export const FullscreenButton = defineComponent({
  name: 'VideoJsFullscreenButton',
  inheritAttrs: false,
  props: {
    enterLabel: {
      type: String as PropType<string>,
      default: 'Enter fullscreen',
    },
    exitLabel: {
      type: String as PropType<string>,
      default: 'Exit fullscreen',
    },
  },
  setup(props, { attrs, expose, slots }) {
    const element = shallowRef<HTMLButtonElement | null>(null)
    const playerFullscreen = useOptionalPlayer(state =>
      Boolean((state as { fullscreen?: unknown }).fullscreen),
    )
    const media = useMedia()
    const container = useContainer()

    const isFullscreen = computed(() => {
      if (playerFullscreen) {
        return playerFullscreen.value
      }

      return Boolean(document.fullscreenElement)
    })

    async function toggleFullscreen() {
      const target = container.value ?? media.value ?? null

      if (document.fullscreenElement) {
        await document.exitFullscreen?.()
        return
      }

      if (target) {
        await target.requestFullscreen?.()
      }
    }

    expose({
      el: element,
    })

    return () => {
      const label = isFullscreen.value ? props.exitLabel : props.enterLabel

      return h(
        'button',
        {
          ...attrs,
          type: attrs['type'] ?? 'button',
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          }) as VNodeRef,
          'aria-label': attrs['aria-label'] ?? label,
          'aria-pressed': isFullscreen.value,
          onClick: async (event: MouseEvent) => {
            if (typeof attrs['onClick'] === 'function') {
              ;(attrs['onClick'] as (event: MouseEvent) => void)(event)
            }

            if (event.defaultPrevented) {
              return
            }

            await toggleFullscreen()
          },
        },
        slots['default']?.() ?? label,
      )
    }
  },
})

import { defineComponent, onBeforeUnmount, watchEffect } from 'vue'
import type { PropType } from 'vue'
import { useContainer, useMedia } from '../../player/context'
import { performMediaAction } from '../factories/mediaActions'

function matchesHotkey(event: KeyboardEvent, keys: string): boolean {
  const parts = keys
    .toLowerCase()
    .split('+')
    .map(part => part.trim())
  const wanted = parts.at(-1)
  const key = event.key.toLowerCase()

  if (parts.includes('ctrl') !== event.ctrlKey) {
    return false
  }
  if (parts.includes('alt') !== event.altKey) {
    return false
  }
  if (parts.includes('shift') !== event.shiftKey) {
    return false
  }
  if (parts.includes('meta') !== event.metaKey) {
    return false
  }

  return key === wanted
}

export interface HotkeyProps {
  keys: string
  action: string
  value?: number
  disabled?: boolean
  target?: 'player' | 'document'
}

export const Hotkey = defineComponent({
  name: 'VideoJsHotkey',
  props: {
    keys: {
      type: String as PropType<string>,
      required: true,
    },
    action: {
      type: String as PropType<string>,
      required: true,
    },
    value: {
      type: Number as PropType<number>,
      default: undefined,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    target: {
      type: String as PropType<'player' | 'document'>,
      default: 'player',
    },
  },
  setup(props) {
    const container = useContainer()
    const media = useMedia()

    let cleanup: (() => void) | null = null

    watchEffect(() => {
      cleanup?.()
      cleanup = null

      if (props.disabled || !props.keys || !props.action) {
        return
      }

      const target = props.target === 'document' ? document : container.value
      if (!target) {
        return
      }

      const onKeydown = (event: Event) => {
        if (!(event instanceof KeyboardEvent)) {
          return
        }

        if (!matchesHotkey(event, props.keys)) {
          return
        }

        event.preventDefault()
        performMediaAction(props.action, {
          media: media.value,
          container: container.value,
          value: props.value,
        })
      }

      target.addEventListener('keydown', onKeydown)
      cleanup = () => target.removeEventListener('keydown', onKeydown)
    })

    onBeforeUnmount(() => {
      cleanup?.()
      cleanup = null
    })

    return () => null
  },
})

/** @deprecated Use Hotkey instead. */
export const MediaHotkey = Hotkey
export type MediaHotkeyProps = HotkeyProps

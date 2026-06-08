import { computed, defineComponent, shallowRef } from 'vue'
import type {
  ButtonHTMLAttributes,
  ComponentPublicInstance,
  PropType,
} from 'vue'
import { useMedia } from '../../player/context'
import { renderElement } from '../factories/renderElement'

export interface PiPButtonProps extends ButtonHTMLAttributes {
  enterLabel?: string
  exitLabel?: string
}

export const PiPButton = defineComponent({
  name: 'VideoJsPiPButton',
  inheritAttrs: false,
  props: {
    enterLabel: {
      type: String as PropType<string>,
      default: 'Enter picture in picture',
    },
    exitLabel: {
      type: String as PropType<string>,
      default: 'Exit picture in picture',
    },
  },
  setup(props, { attrs, expose, slots }) {
    const element = shallowRef<HTMLButtonElement | null>(null)
    const media = useMedia()

    const active = computed(
      () => document.pictureInPictureElement === media.value,
    )

    const supported = computed(
      () =>
        typeof document !== 'undefined' &&
        'pictureInPictureEnabled' in document,
    )

    const label = computed(() =>
      active.value ? props.exitLabel : props.enterLabel,
    )

    expose({
      el: element,
    })

    return () => {
      const content = slots['default']?.() ?? label.value

      return renderElement(
        'button',
        {},
        {
          state: {
            active: active.value,
            supported: supported.value,
          },
          ref: (value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          },
          props: [
            {
              type: 'button',
              disabled: !supported.value,
              'aria-label': label.value,
              'aria-pressed': active.value,
              children: content,
              onClick: async (event: MouseEvent) => {
                if (
                  event.defaultPrevented ||
                  !media.value ||
                  !supported.value
                ) {
                  return
                }

                if (document.pictureInPictureElement === media.value) {
                  await document.exitPictureInPicture?.()
                  return
                }

                await (
                  media.value as HTMLVideoElement
                ).requestPictureInPicture?.()
              },
            },
            attrs,
          ],
        },
      )
    }
  },
})

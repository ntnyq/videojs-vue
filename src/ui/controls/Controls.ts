import { defineComponent, h, shallowRef } from 'vue'
import type {
  ComponentPublicInstance,
  HTMLAttributes,
  VNode,
  VNodeRef,
} from 'vue'

export interface ControlsRootProps extends HTMLAttributes {}

const Root = defineComponent<ControlsRootProps>({
  name: 'VideoJsControlsRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    const element = shallowRef<HTMLDivElement | null>(null)

    expose({ el: element })

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLDivElement | null
          }) as VNodeRef,
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

export interface ControlsGroupProps extends HTMLAttributes {}

const Group = defineComponent<ControlsGroupProps>({
  name: 'VideoJsControlsGroup',
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    const element = shallowRef<HTMLDivElement | null>(null)

    expose({ el: element })

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLDivElement | null
          }) as VNodeRef,
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

export const Controls = {
  Root,
  Group,
}

export type ControlsParts = typeof Controls

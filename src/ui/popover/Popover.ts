import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  shallowRef,
  watch,
} from 'vue'
import type {
  ComponentPublicInstance,
  HTMLAttributes,
  InjectionKey,
  PropType,
  Ref,
  VNode,
  VNodeRef,
} from 'vue'

export interface PopoverContextValue {
  open: Ref<boolean>
  setOpen: (open: boolean) => void
}

const POPOVER_CONTEXT_KEY: InjectionKey<PopoverContextValue> = Symbol(
  'videojs-popover-context',
)

export function usePopoverContext(): PopoverContextValue {
  const context = inject(POPOVER_CONTEXT_KEY, null)

  if (!context) {
    throw new Error('Popover parts must be used inside Popover.Root')
  }

  return context
}

export interface PopoverRootProps extends HTMLAttributes {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const Root = defineComponent({
  name: 'VideoJsPopoverRoot',
  inheritAttrs: false,
  props: {
    open: {
      type: Boolean as PropType<boolean>,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    onOpenChange: {
      type: Function as PropType<(open: boolean) => void>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const innerOpen = shallowRef(Boolean(props.defaultOpen))
    const controlled = computed(() => props.open !== undefined)
    const open = computed(() =>
      controlled.value ? Boolean(props.open) : innerOpen.value,
    )

    function setOpen(nextOpen: boolean) {
      if (!controlled.value) {
        innerOpen.value = nextOpen
      }
      props.onOpenChange?.(nextOpen)
    }

    watch(
      () => props.open,
      next => {
        if (controlled.value && typeof next === 'boolean') {
          innerOpen.value = next
        }
      },
      { immediate: true },
    )

    provide(POPOVER_CONTEXT_KEY, {
      open,
      setOpen,
    })

    return () =>
      h('div', { ...attrs }, slots['default']?.() as VNode[] | undefined)
  },
})

export interface PopoverTriggerProps extends HTMLAttributes {}

const Trigger = defineComponent<PopoverTriggerProps>({
  name: 'VideoJsPopoverTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    const element = shallowRef<HTMLElement | null>(null)
    const popover = usePopoverContext()

    expose({ el: element })

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLElement | null
          }) as VNodeRef,
          onClick: (event: MouseEvent) => {
            if (typeof attrs['onClick'] === 'function') {
              ;(attrs['onClick'] as (event: MouseEvent) => void)(event)
            }

            if (event.defaultPrevented) {
              return
            }

            popover.setOpen(!popover.open.value)
          },
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

export interface PopoverPopupProps extends HTMLAttributes {}

const Popup = defineComponent<PopoverPopupProps>({
  name: 'VideoJsPopoverPopup',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const popover = usePopoverContext()

    return () => {
      if (!popover.open.value) {
        return null
      }

      return h('div', { ...attrs }, slots['default']?.() as VNode[] | undefined)
    }
  },
})

export interface PopoverArrowProps extends HTMLAttributes {}

const Arrow = defineComponent<PopoverArrowProps>({
  name: 'VideoJsPopoverArrow',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        'span',
        { ...attrs, 'aria-hidden': 'true' },
        slots['default']?.() ?? '◆',
      )
  },
})

export const Popover = {
  Root,
  Trigger,
  Popup,
  Arrow,
}

export type PopoverParts = typeof Popover

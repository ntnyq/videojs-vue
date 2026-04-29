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

export interface TooltipContextValue {
  open: Ref<boolean>
  setOpen: (open: boolean) => void
  disabled: Ref<boolean>
}

const TOOLTIP_CONTEXT_KEY: InjectionKey<TooltipContextValue> = Symbol(
  'videojs-tooltip-context',
)

export function useTooltipContext(): TooltipContextValue {
  const context = inject(TOOLTIP_CONTEXT_KEY, null)
  if (!context) {
    throw new Error('Tooltip parts must be used inside Tooltip.Root')
  }

  return context
}

export function useOptionalTooltipContext(): TooltipContextValue | undefined {
  return inject(TOOLTIP_CONTEXT_KEY, null) ?? undefined
}

export interface TooltipProviderProps extends HTMLAttributes {}

const Provider = defineComponent<TooltipProviderProps>({
  name: 'VideoJsTooltipProvider',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h('div', { ...attrs }, slots['default']?.() as VNode[] | undefined)
  },
})

export interface TooltipRootProps extends HTMLAttributes {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
}

const Root = defineComponent({
  name: 'VideoJsTooltipRoot',
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
    disabled: {
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
    const disabled = computed(() => Boolean(props.disabled))
    const controlled = computed(() => props.open !== undefined)
    const open = computed(() =>
      controlled.value ? Boolean(props.open) : innerOpen.value,
    )

    function setOpen(nextOpen: boolean) {
      if (disabled.value) {
        return
      }

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

    provide(TOOLTIP_CONTEXT_KEY, {
      open,
      setOpen,
      disabled,
    })

    return () =>
      h('div', { ...attrs }, slots['default']?.() as VNode[] | undefined)
  },
})

export interface TooltipTriggerProps extends HTMLAttributes {}

const Trigger = defineComponent<TooltipTriggerProps>({
  name: 'VideoJsTooltipTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    const element = shallowRef<HTMLElement | null>(null)
    const tooltip = useTooltipContext()

    expose({ el: element })

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLElement | null
          }) as VNodeRef,
          onMouseenter: (event: MouseEvent) => {
            if (typeof attrs['onMouseenter'] === 'function') {
              ;(attrs['onMouseenter'] as (event: MouseEvent) => void)(event)
            }
            tooltip.setOpen(true)
          },
          onMouseleave: (event: MouseEvent) => {
            if (typeof attrs['onMouseleave'] === 'function') {
              ;(attrs['onMouseleave'] as (event: MouseEvent) => void)(event)
            }
            tooltip.setOpen(false)
          },
          onFocus: (event: FocusEvent) => {
            if (typeof attrs['onFocus'] === 'function') {
              ;(attrs['onFocus'] as (event: FocusEvent) => void)(event)
            }
            tooltip.setOpen(true)
          },
          onBlur: (event: FocusEvent) => {
            if (typeof attrs['onBlur'] === 'function') {
              ;(attrs['onBlur'] as (event: FocusEvent) => void)(event)
            }
            tooltip.setOpen(false)
          },
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

export interface TooltipPopupProps extends HTMLAttributes {}

const Popup = defineComponent<TooltipPopupProps>({
  name: 'VideoJsTooltipPopup',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const tooltip = useTooltipContext()

    return () => {
      if (!tooltip.open.value) {
        return null
      }

      return h(
        'div',
        { ...attrs, role: 'tooltip' },
        slots['default']?.() as VNode[] | undefined,
      )
    }
  },
})

export interface TooltipArrowProps extends HTMLAttributes {}

const Arrow = defineComponent<TooltipArrowProps>({
  name: 'VideoJsTooltipArrow',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        'span',
        { ...attrs, 'aria-hidden': 'true' },
        slots['default']?.() ?? '▲',
      )
  },
})

export const Tooltip = {
  Provider,
  Root,
  Trigger,
  Popup,
  Arrow,
}

export type TooltipParts = typeof Tooltip

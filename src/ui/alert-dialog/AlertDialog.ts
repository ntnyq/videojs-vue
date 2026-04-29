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

export interface AlertDialogContextValue {
  open: Ref<boolean>
  setOpen: (open: boolean) => void
}

const ALERT_DIALOG_KEY: InjectionKey<AlertDialogContextValue> = Symbol(
  'videojs-alert-dialog',
)

export function useAlertDialogContext(): AlertDialogContextValue {
  const context = inject(ALERT_DIALOG_KEY, null)
  if (!context) {
    throw new Error('AlertDialog parts must be used within AlertDialog.Root')
  }

  return context
}

export interface AlertDialogRootProps extends HTMLAttributes {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onOpenChangeComplete?: (open: boolean) => void
}

const Root = defineComponent({
  name: 'VideoJsAlertDialogRoot',
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
    onOpenChangeComplete: {
      type: Function as PropType<(open: boolean) => void>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const internalOpen = shallowRef(Boolean(props.defaultOpen))
    const controlled = computed(() => props.open !== undefined)
    const open = computed(() =>
      controlled.value ? Boolean(props.open) : internalOpen.value,
    )

    function setOpen(nextOpen: boolean) {
      if (!controlled.value) {
        internalOpen.value = nextOpen
      }

      props.onOpenChange?.(nextOpen)
      props.onOpenChangeComplete?.(nextOpen)
    }

    watch(
      () => props.open,
      value => {
        if (controlled.value && typeof value === 'boolean') {
          internalOpen.value = value
        }
      },
      { immediate: true },
    )

    provide(ALERT_DIALOG_KEY, {
      open,
      setOpen,
    })

    return () =>
      h('div', { ...attrs }, slots['default']?.() as VNode[] | undefined)
  },
})

export interface AlertDialogPopupProps extends HTMLAttributes {}

const Popup = defineComponent<AlertDialogPopupProps>({
  name: 'VideoJsAlertDialogPopup',
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    const element = shallowRef<HTMLDivElement | null>(null)
    const dialog = useAlertDialogContext()

    expose({ el: element })

    return () => {
      if (!dialog.open.value) {
        return null
      }

      return h(
        'div',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLDivElement | null
          }) as VNodeRef,
          role: 'alertdialog',
          'aria-modal': 'true',
        },
        slots['default']?.() as VNode[] | undefined,
      )
    }
  },
})

export interface AlertDialogTitleProps extends HTMLAttributes {}

const Title = defineComponent<AlertDialogTitleProps>({
  name: 'VideoJsAlertDialogTitle',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h('h2', { ...attrs }, slots['default']?.() as VNode[] | undefined)
  },
})

export interface AlertDialogDescriptionProps extends HTMLAttributes {}

const Description = defineComponent<AlertDialogDescriptionProps>({
  name: 'VideoJsAlertDialogDescription',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h('p', { ...attrs }, slots['default']?.() as VNode[] | undefined)
  },
})

export interface AlertDialogCloseProps extends HTMLAttributes {}

const Close = defineComponent<AlertDialogCloseProps>({
  name: 'VideoJsAlertDialogClose',
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    const element = shallowRef<HTMLButtonElement | null>(null)
    const dialog = useAlertDialogContext()

    expose({ el: element })

    return () =>
      h(
        'button',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLButtonElement | null
          }) as VNodeRef,
          type: attrs['type'] ?? 'button',
          onClick: (event: MouseEvent) => {
            if (typeof attrs['onClick'] === 'function') {
              ;(attrs['onClick'] as (event: MouseEvent) => void)(event)
            }

            if (!event.defaultPrevented) {
              dialog.setOpen(false)
            }
          },
        },
        slots['default']?.() ?? 'Close',
      )
  },
})

export const AlertDialog = {
  Root,
  Popup,
  Title,
  Description,
  Close,
}

export type AlertDialogParts = typeof AlertDialog

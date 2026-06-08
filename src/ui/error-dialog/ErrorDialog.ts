import { computed, defineComponent, h, inject, provide, shallowRef } from 'vue'
import type { HTMLAttributes, InjectionKey, Ref } from 'vue'
import { useMedia } from '../../player/context'
import { AlertDialog } from '../alert-dialog'
import { useMediaEvents } from '../factories/useMediaEvents'

export interface ErrorDialogContextValue {
  lastError: Ref<MediaError | null>
}

const ERROR_DIALOG_KEY: InjectionKey<ErrorDialogContextValue> = Symbol(
  'videojs-error-dialog',
)

export function useErrorDialogContext(): ErrorDialogContextValue {
  const context = inject(ERROR_DIALOG_KEY, null)
  if (!context) {
    throw new Error('ErrorDialog parts must be used within ErrorDialog.Root')
  }

  return context
}

export interface ErrorDialogRootProps extends HTMLAttributes {}

const Root = defineComponent<ErrorDialogRootProps>({
  name: 'VideoJsErrorDialogRoot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const media = useMedia()
    const lastError = shallowRef<MediaError | null>(null)

    const sync = () => {
      const node = media.value
      lastError.value = node
        ? ((node.error as MediaError | null) ?? null)
        : null
    }

    const clear = () => {
      lastError.value = null
    }

    useMediaEvents(media, {
      onAttach: sync,
      onDetach: clear,
      bindings: () => [
        { type: 'error', listener: sync },
        { type: 'loadeddata', listener: clear },
      ],
    })

    const open = computed(() => Boolean(lastError.value))

    provide(ERROR_DIALOG_KEY, { lastError })

    return () =>
      h(
        AlertDialog.Root,
        {
          ...attrs,
          open: open.value,
        },
        slots,
      )
  },
})

export interface ErrorDialogDescriptionProps extends HTMLAttributes {}

const Description = defineComponent<ErrorDialogDescriptionProps>({
  name: 'VideoJsErrorDialogDescription',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const { lastError } = useErrorDialogContext()

    return () =>
      h(
        'p',
        { ...attrs },
        slots['default']?.() ?? lastError.value?.message ?? 'Playback error',
      )
  },
})

export const ErrorDialog = {
  Root,
  Popup: AlertDialog.Popup,
  Title: AlertDialog.Title,
  Description,
  Close: AlertDialog.Close,
}

export type ErrorDialogParts = typeof ErrorDialog

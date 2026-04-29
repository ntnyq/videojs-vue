import type { AnyPlayerStore, Media, MediaContainer } from '@videojs/core/dom'
import type {
  Comparator,
  Selector,
  UnknownState,
  UnknownStore,
} from '@videojs/store'
import { shallowEqual } from '@videojs/store'
import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onScopeDispose,
  shallowRef,
  watch,
} from 'vue'
import type {
  ComponentPublicInstance,
  HTMLAttributes,
  InjectionKey,
  PropType,
  ShallowRef,
  VNodeRef,
  VNode,
} from 'vue'

export type PlayerMediaElement = Media & HTMLMediaElement

export interface PlayerContextValue<
  Store = AnyPlayerStore,
  CurrentMedia extends PlayerMediaElement = PlayerMediaElement,
> {
  store: Store
  media: ShallowRef<CurrentMedia | null>
  setMedia: (media: CurrentMedia | null) => void
  container: ShallowRef<MediaContainer | null>
  setContainer: (container: MediaContainer | null) => void
}

export const PLAYER_CONTEXT_KEY: InjectionKey<PlayerContextValue> = Symbol(
  'videojs-player-context',
)

export function usePlayerContext(): PlayerContextValue {
  const ctx = inject(PLAYER_CONTEXT_KEY, null)

  if (!ctx) {
    throw new Error('usePlayerContext must be used within a Player Provider')
  }

  return ctx
}

function useSelectedStoreValue<State extends object, Result>(
  store: {
    state: State
    subscribe: (callback: () => void) => () => void
  },
  selector: Selector<State, Result>,
  isEqual: Comparator<Result> = shallowEqual,
): Readonly<ShallowRef<Result>> {
  const selected = shallowRef(
    selector(store.state as State),
  ) as ShallowRef<Result>
  const unsubscribe = store.subscribe(() => {
    const next = selector(store.state as State)

    if (!isEqual(selected.value, next)) {
      selected.value = next
    }
  })

  onScopeDispose(unsubscribe)

  return selected as Readonly<ShallowRef<Result>>
}

export function usePlayer(): UnknownStore
export function usePlayer<Result>(
  selector: Selector<UnknownState, Result>,
  isEqual?: Comparator<Result>,
): Readonly<ShallowRef<Result>>
export function usePlayer<Result>(
  selector?: Selector<UnknownState, Result>,
  isEqual?: Comparator<Result>,
): UnknownStore | Readonly<ShallowRef<Result>> {
  const { store } = usePlayerContext()

  if (!selector) {
    return store as UnknownStore
  }

  return useSelectedStoreValue(
    store as {
      state: UnknownState
      subscribe: (callback: () => void) => () => void
    },
    selector,
    isEqual,
  )
}

export function useOptionalPlayer(): UnknownStore | undefined
export function useOptionalPlayer<Result>(
  selector: Selector<UnknownState, Result>,
  isEqual?: Comparator<Result>,
): Readonly<ShallowRef<Result>> | undefined
export function useOptionalPlayer<Result>(
  selector?: Selector<UnknownState, Result>,
  isEqual?: Comparator<Result>,
): UnknownStore | Readonly<ShallowRef<Result>> | undefined {
  const ctx = inject(PLAYER_CONTEXT_KEY, null)

  if (!ctx) {
    return undefined
  }

  if (!selector) {
    return ctx.store as UnknownStore
  }

  return useSelectedStoreValue(
    ctx.store as {
      state: UnknownState
      subscribe: (callback: () => void) => () => void
    },
    selector,
    isEqual,
  )
}

export function useMedia(): Readonly<ShallowRef<PlayerMediaElement | null>> {
  return usePlayerContext().media as Readonly<
    ShallowRef<PlayerMediaElement | null>
  >
}

export function useContainer(): Readonly<ShallowRef<MediaContainer | null>> {
  return usePlayerContext().container as Readonly<
    ShallowRef<MediaContainer | null>
  >
}

export function useMediaAttach(): PlayerContextValue['setMedia'] | undefined {
  return inject(PLAYER_CONTEXT_KEY, null)?.setMedia
}

export function useContainerAttach():
  | PlayerContextValue['setContainer']
  | undefined {
  return inject(PLAYER_CONTEXT_KEY, null)?.setContainer
}

export interface ContainerProps extends HTMLAttributes {
  tabIndex?: number
}

function callPointerHandler(handler: unknown, event: PointerEvent) {
  if (typeof handler === 'function') {
    handler(event)
    return
  }

  if (Array.isArray(handler)) {
    for (const listener of handler) {
      if (typeof listener === 'function') {
        listener(event)
      }
    }
  }
}

export const Container = defineComponent({
  name: 'VideoJsContainer',
  inheritAttrs: false,
  props: {
    tabIndex: {
      type: Number as PropType<number>,
      default: 0,
    },
  },
  setup(props, { attrs, expose, slots }) {
    const setContainer = useContainerAttach()
    const element = shallowRef<HTMLDivElement | null>(null)

    watch(
      element,
      value => {
        setContainer?.(value)
      },
      { immediate: true },
    )

    onBeforeUnmount(() => {
      setContainer?.(null)
    })

    expose({
      el: element,
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: ((value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLDivElement | null
          }) as VNodeRef,
          tabIndex: props.tabIndex,
          onPointerup: (event: PointerEvent) => {
            callPointerHandler(
              attrs['onPointerup'] ?? attrs['onPointerUp'],
              event,
            )

            const current = element.value

            if (!current) {
              return
            }

            if (
              !current.contains(document.activeElement) ||
              document.activeElement === document.body
            ) {
              current.focus({ preventScroll: true })
            }
          },
        },
        slots['default']?.() as VNode[] | undefined,
      )
  },
})

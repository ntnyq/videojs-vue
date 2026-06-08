import type {
  AnyPlayerFeature,
  AnyPlayerStore,
  AudioFeatures,
  AudioPlayerStore,
  PlayerStore,
  PlayerTarget,
  VideoFeatures,
  VideoPlayerStore,
} from '@videojs/core/dom'
import type { Comparator, InferStoreState, Selector } from '@videojs/store'
import { combine, createStore } from '@videojs/store'
import {
  defineComponent,
  onBeforeUnmount,
  provide,
  shallowRef,
  watch,
} from 'vue'
import type { ShallowRef } from 'vue'
import {
  Container,
  PLAYER_CONTEXT_KEY,
  useMedia,
  usePlayer as useContextPlayer,
} from './context'
import type { MediaUpdate, PlayerMediaElement } from './context'

export interface CreatePlayerConfig<Features extends AnyPlayerFeature[]> {
  features: Features
  displayName?: string
  plugins?: PlayerRuntimePlugin[]
}

export interface RuntimePluginTarget {
  media: PlayerMediaElement
  container: HTMLElement | null
}

export interface RuntimeProviderContext {
  store: AnyPlayerStore
  media: Readonly<ShallowRef<PlayerMediaElement | null>>
  container: Readonly<ShallowRef<HTMLElement | null>>
}

export interface RuntimeAttachContext extends RuntimeProviderContext {
  target: RuntimePluginTarget
}

type RuntimePluginCleanup = (() => void) | undefined

export interface PlayerRuntimePlugin {
  onProviderSetup?: (context: RuntimeProviderContext) => RuntimePluginCleanup
  onProviderDestroy?: ((context: RuntimeProviderContext) => void) | undefined
  onAttach?: (context: RuntimeAttachContext) => RuntimePluginCleanup
  onDetach?: ((context: RuntimeAttachContext) => void) | undefined
}

// oxlint-disable-next-line typescript/no-empty-interface, typescript/no-empty-object-type
export interface ProviderProps {}

export interface CreatePlayerResult<
  Store extends PlayerStore = AnyPlayerStore,
> {
  Provider: ReturnType<typeof defineComponent>
  Container: typeof Container
  usePlayer: UsePlayerHook<Store>
  useMedia: () => Readonly<ShallowRef<PlayerMediaElement | null>>
}

export interface UsePlayerHook<Store extends PlayerStore> {
  (): Store
  <Result>(
    selector: Selector<InferStoreState<Store>, Result>,
    isEqual?: Comparator<Result>,
  ): Readonly<ShallowRef<Result>>
}

export function createPlayer(
  config: CreatePlayerConfig<VideoFeatures>,
): CreatePlayerResult<VideoPlayerStore>
export function createPlayer(
  config: CreatePlayerConfig<AudioFeatures>,
): CreatePlayerResult<AudioPlayerStore>
export function createPlayer<const Features extends AnyPlayerFeature[]>(
  config: CreatePlayerConfig<Features>,
): CreatePlayerResult<PlayerStore<Features>>
export function createPlayer(
  config: CreatePlayerConfig<AnyPlayerFeature[]>,
): CreatePlayerResult<AnyPlayerStore> {
  const slice = combine<PlayerTarget, AnyPlayerFeature[]>(...config.features)
  const plugins = config.plugins ?? []

  const Provider = defineComponent({
    name: config.displayName
      ? `${config.displayName}.Provider`
      : 'VideoJsProvider',
    setup(props, { slots }) {
      const store = createStore<PlayerTarget>()(slice)
      const media = shallowRef<PlayerMediaElement | null>(null)
      const container = shallowRef<HTMLElement | null>(null)
      const providerContext: RuntimeProviderContext = {
        store,
        media,
        container,
      }

      const providerCleanups: (() => void)[] = []

      for (const plugin of plugins) {
        const cleanup = plugin.onProviderSetup?.(providerContext)
        if (typeof cleanup === 'function') {
          providerCleanups.push(cleanup)
        }
      }

      provide(PLAYER_CONTEXT_KEY, {
        store,
        media,
        container,
        setMedia: (value: MediaUpdate<PlayerMediaElement>) => {
          media.value = typeof value === 'function' ? value(media.value) : value
        },
        setContainer: (value: HTMLElement | null) => {
          container.value = value
        },
      })

      watch(
        [media, container],
        ([currentMedia, currentContainer], _, onCleanup) => {
          if (!currentMedia) {
            return
          }

          const attachContext: RuntimeAttachContext = {
            ...providerContext,
            target: {
              media: currentMedia,
              container: currentContainer,
            },
          }

          const attachCleanups: (() => void)[] = []

          for (const plugin of plugins) {
            const cleanup = plugin.onAttach?.(attachContext)
            if (typeof cleanup === 'function') {
              attachCleanups.push(cleanup)
            }
          }

          const detach = store.attach({
            media: currentMedia,
            container: currentContainer,
          })

          onCleanup(() => {
            for (const cleanup of attachCleanups) {
              cleanup()
            }

            for (const plugin of plugins) {
              plugin.onDetach?.(attachContext)
            }

            detach()
          })
        },
        { immediate: true },
      )

      onBeforeUnmount(() => {
        for (const cleanup of providerCleanups) {
          cleanup()
        }

        for (const plugin of plugins) {
          plugin.onProviderDestroy?.(providerContext)
        }

        store.destroy()
      })

      return () => slots['default']?.()
    },
  })

  // oxlint-disable-next-line unicorn/consistent-function-scoping
  function usePlayer<Result>(
    selector?: Selector<object, Result>,
    isEqual?: Comparator<Result>,
  ): AnyPlayerStore | Readonly<ShallowRef<Result>> {
    if (!selector) {
      return useContextPlayer() as AnyPlayerStore
    }

    return useContextPlayer(selector, isEqual)
  }

  return {
    Provider,
    Container,
    useMedia,
    usePlayer: usePlayer as UsePlayerHook<AnyPlayerStore>,
  }
}

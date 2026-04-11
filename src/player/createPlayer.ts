import type {
  AnyPlayerFeature,
  AnyPlayerStore,
  AudioFeatures,
  AudioPlayerStore,
  Media,
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

export interface CreatePlayerConfig<Features extends AnyPlayerFeature[]> {
  features: Features
  displayName?: string
}

// oxlint-disable-next-line typescript/no-empty-interface, typescript/no-empty-object-type
export interface ProviderProps {}

export interface CreatePlayerResult<
  Store extends PlayerStore = AnyPlayerStore,
> {
  Provider: ReturnType<typeof defineComponent>
  Container: typeof Container
  usePlayer: UsePlayerHook<Store>
  useMedia: () => Readonly<ShallowRef<Media | null>>
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

  const Provider = defineComponent({
    name: config.displayName
      ? `${config.displayName}.Provider`
      : 'VideoJsProvider',
    setup(props, { slots }) {
      const store = createStore<PlayerTarget>()(slice)
      const media = shallowRef<Media | null>(null)
      const container = shallowRef<HTMLElement | null>(null)

      provide(PLAYER_CONTEXT_KEY, {
        store,
        media,
        container,
        setMedia: (value: Media | null) => {
          media.value = value
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

          const detach = store.attach({
            media: currentMedia,
            container: currentContainer,
          })

          onCleanup(detach)
        },
        { immediate: true },
      )

      onBeforeUnmount(() => {
        store.destroy()
      })

      return () => slots['default']?.()
    },
  })

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

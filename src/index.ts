export * from '@videojs/core/dom'

// Store
export type { Comparator, Selector } from '@videojs/store'
export { createSelector, shallowEqual } from '@videojs/store'

// Player API
export {
  Container,
  type ContainerProps,
  type PlayerContextValue,
  useContainer,
  useContainerAttach,
  useMedia,
  useMediaAttach,
  useOptionalPlayer,
  usePlayer,
  usePlayerContext,
} from './player/context'
export {
  type CreatePlayerConfig,
  type CreatePlayerResult,
  createPlayer,
  type ProviderProps,
  type UsePlayerHook,
} from './player/createPlayer'

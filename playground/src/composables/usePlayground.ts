import type { VideoPlayerActions, VideoPlayerHandle } from 'videojs-vue'
import type { AudioPlayerHandle } from 'videojs-vue/audio'
import {
  useAudioPlayerActions,
  useAudioPlayerState,
} from 'videojs-vue/audio/composables'
import {
  useLiveVideoPlayerActions,
  useLiveVideoPlayerState,
} from 'videojs-vue/live/composables'
import type { LiveVideoPlayerHandle } from 'videojs-vue/live/core'
import {
  useVideoPlayerActions,
  useVideoPlayerState,
} from 'videojs-vue/video/composables'
import { computed, reactive, shallowRef } from 'vue'
import { createConfig, MEDIA_EVENTS } from '../data'
import type { ExampleId, PlaygroundConfig, PlayerType } from '../data'
import { createExampleCode } from '../lib/createExampleCode'
import { useEventLog } from './useEventLog'

export function usePlayground() {
  const example = shallowRef<ExampleId>('basic')
  const lastVideoExample = shallowRef<Exclude<ExampleId, 'audio'>>('basic')
  const playerType = computed<PlayerType>(() =>
    example.value === 'audio' ? 'audio' : 'video',
  )
  const config = reactive(createConfig())
  const player = shallowRef<
    VideoPlayerHandle | AudioPlayerHandle | LiveVideoPlayerHandle | null
  >(null)
  const isMounted = shallowRef(true)
  const generation = shallowRef(0)
  const failure = shallowRef('')
  const view = shallowRef('preview')
  const inspectorTab = shallowRef('props')
  const actionTarget = shallowRef('composable')
  const seekTime = shallowRef(10)
  const log = reactive(useEventLog())
  const videoPlayer = computed(() => {
    const handle = player.value
    return handle && 'selectVideoRendition' in handle ? handle : null
  })
  const audioPlayer = computed(() => {
    const handle = player.value
    return handle && !('requestFullscreen' in handle) ? handle : null
  })
  const livePlayer = computed(() => {
    const handle = player.value
    return handle &&
      'requestFullscreen' in handle &&
      !('selectVideoRendition' in handle)
      ? handle
      : null
  })
  const liveActions = useLiveVideoPlayerActions(livePlayer)
  const liveSnapshot = useLiveVideoPlayerState(state => state, livePlayer)
  const actions = useVideoPlayerActions(videoPlayer)
  const audioActions = useAudioPlayerActions(audioPlayer)
  const videoSnapshot = useVideoPlayerState(state => state, videoPlayer)
  const audioSnapshot = useAudioPlayerState(state => state, audioPlayer)
  const snapshot = computed(() => {
    if (example.value === 'audio') {
      return audioSnapshot.value
    }
    if (example.value === 'live') {
      return liveSnapshot.value
    }
    return videoSnapshot.value
  })
  const videoCapabilities = computed(
    () => liveSnapshot.value ?? videoSnapshot.value,
  )
  const isReady = computed(() => Boolean(player.value?.store))
  const canFullscreen = computed(
    () =>
      isReady.value &&
      videoCapabilities.value?.fullscreenAvailability === 'available',
  )
  const canPip = computed(
    () =>
      isReady.value &&
      videoCapabilities.value?.pictureInPictureAvailability === 'available',
  )
  const mediaProps = computed(() => {
    const {
      skin: _skin,
      title: _title,
      hasCaptions,
      trackSrc,
      trackLanguage,
      trackLabel,
      ...media
    } = config
    return {
      ...media,
      tracks: hasCaptions
        ? [
            {
              src: trackSrc,
              kind: 'captions' as const,
              srclang: trackLanguage,
              label: trackLabel,
              default: true,
            },
          ]
        : [],
    }
  })
  const code = computed(() =>
    createExampleCode(example.value, config, actionTarget.value),
  )
  function setPlayer(
    handle:
      | VideoPlayerHandle
      | AudioPlayerHandle
      | LiveVideoPlayerHandle
      | null,
  ) {
    player.value = handle
  }
  function reset() {
    Object.assign(config, createConfig(example.value))
    failure.value = ''
    isMounted.value = true
    player.value = null
    generation.value++
    log.record('lifecycle', 'reset', { example: example.value })
  }
  function selectExample(next: ExampleId) {
    if (example.value === next) {
      return
    }
    example.value = next
    if (next !== 'audio') {
      lastVideoExample.value = next
    }
    view.value = next === 'state' ? 'state' : 'preview'
    inspectorTab.value = next === 'actions' ? 'actions' : 'props'
    reset()
  }
  function selectPlayerType(type: PlayerType) {
    selectExample(type === 'audio' ? 'audio' : lastVideoExample.value)
  }
  function toggleMount() {
    isMounted.value = !isMounted.value
    if (!isMounted.value) {
      player.value = null
    }
    failure.value = ''
    log.record('lifecycle', isMounted.value ? 'mount' : 'unmount')
  }
  function retry() {
    failure.value = ''
    player.value = null
    generation.value++
    log.record('lifecycle', 'remount')
  }
  function updateConfig<Key extends keyof PlaygroundConfig>(
    key: Key,
    value: PlaygroundConfig[Key],
  ) {
    config[key] = value
    if (key === 'src') {
      failure.value = ''
    }
    log.record('model', `prop:${key}`, { value })
  }
  function syncModel<Key extends 'volume' | 'muted' | 'playbackRate'>(
    key: Key,
    value: PlaygroundConfig[Key],
  ) {
    config[key] = value
    log.record('model', `update:${key}`, { value })
  }
  async function run<Name extends keyof VideoPlayerActions>(
    name: Name,
    ...args: Parameters<VideoPlayerActions[Name]>
  ) {
    const instance = player.value
    const token = generation.value
    let currentActions: Partial<VideoPlayerActions> = actions
    if (example.value === 'audio') {
      currentActions = audioActions
    }
    if (example.value === 'live') {
      currentActions = liveActions
    }
    const target: Partial<VideoPlayerActions> | null =
      actionTarget.value === 'ref' ? instance : currentActions
    log.record('action', `${name}()`, { args, target: actionTarget.value })
    function fail(error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      log.record('error', name, { message })
      if (player.value === instance && generation.value === token) {
        failure.value = message
      }
    }
    try {
      failure.value = ''
      if (!target) {
        throw new Error('Player is not ready.')
      }
      // Invoke synchronously to preserve browser user activation for fullscreen/PiP.
      const command = target[name]
      if (!command) {
        throw new Error(`The current player does not support ${name}.`)
      }
      const result = Reflect.apply(command, target, args)
      await result
    } catch (error) {
      fail(error)
    }
  }
  const listeners = Object.fromEntries(
    MEDIA_EVENTS.map(name => [
      `on${name.charAt(0).toUpperCase()}${name.slice(1)}`,
      () => {
        const media = player.value?.media
        const payload = {
          currentTime: media?.currentTime,
          paused: media?.paused,
          volume: media?.volume,
          muted: media?.muted,
          playbackRate: media?.playbackRate,
          ...(name === 'error'
            ? { code: media?.error?.code, message: media?.error?.message }
            : {}),
        }
        if (name === 'error') {
          failure.value = media?.error?.message || 'media-error'
        }
        log.record(name === 'error' ? 'error' : 'event', name, payload)
      },
    ]),
  )
  return reactive({
    example,
    playerType,
    config,
    player,
    isMounted,
    generation,
    failure,
    view,
    inspectorTab,
    actionTarget,
    seekTime,
    log,
    snapshot,
    isReady,
    canFullscreen,
    canPip,
    mediaProps,
    code,
    listeners,
    setPlayer,
    reset,
    selectExample,
    selectPlayerType,
    toggleMount,
    retry,
    updateConfig,
    syncModel,
    run,
  })
}
export type Playground = ReturnType<typeof usePlayground>

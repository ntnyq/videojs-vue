import type { ExampleId, PlaygroundConfig } from '../data'
import mediaExportExample from '../media-export/MediaExportExample.vue?raw'
import playlistExample from '../playlist/PlaylistExample.vue?raw'

const EXAMPLE_APIS = {
  video: {
    entry: 'videojs-vue',
    imports: 'VideoPlayer, useVideoPlayerActions, useVideoPlayerState',
    handleType: 'VideoPlayerHandle',
    actionsHook: 'useVideoPlayerActions',
    stateHook: 'useVideoPlayerState',
    componentName: 'VideoPlayer',
  },
  audio: {
    entry: 'videojs-vue/audio',
    imports: 'AudioPlayer, useAudioPlayerActions, useAudioPlayerState',
    handleType: 'AudioPlayerHandle',
    actionsHook: 'useAudioPlayerActions',
    stateHook: 'useAudioPlayerState',
    componentName: 'AudioPlayer',
  },
  live: {
    entry: 'videojs-vue/live',
    imports:
      'LiveVideoPlayer, useLiveVideoPlayerActions, useLiveVideoPlayerState',
    handleType: 'LiveVideoPlayerHandle',
    actionsHook: 'useLiveVideoPlayerActions',
    stateHook: 'useLiveVideoPlayerState',
    componentName: 'LiveVideoPlayer',
  },
} as const

function resolveExampleMode(example: ExampleId) {
  if (example === 'audio' || example === 'live') {
    return example
  }
  return 'video'
}

function createExampleOptions(example: ExampleId, config: PlaygroundConfig) {
  const { hasCaptions, trackSrc, trackLanguage, trackLabel, ...options } =
    config
  const isLive = example === 'live'
  const isAudio = example === 'audio'
  const { playsinline, ...audioOptions } = options
  const { playbackRate: _rate, ...liveOptions } = audioOptions
  const props = {
    ...(isAudio ? {} : { playsinline }),
    ...(isLive ? liveOptions : audioOptions),
    tracks:
      !isAudio && hasCaptions
        ? [
            {
              src: trackSrc,
              kind: 'captions',
              srclang: trackLanguage,
              label: trackLabel,
              default: true,
            },
            ...(example === 'captions'
              ? [
                  {
                    src: '/captions.zh-CN.vtt',
                    kind: 'subtitles',
                    srclang: 'zh-CN',
                    label: '简体中文',
                  },
                ]
              : []),
          ]
        : [],
  }
  return props
}

export function createExampleCode(
  example: ExampleId,
  config: PlaygroundConfig,
  actionTarget: string,
) {
  if (example === 'playlist') {
    return playlistExample
  }
  if (example === 'media-export') {
    return mediaExportExample
  }
  const isLive = example === 'live'
  const props = createExampleOptions(example, config)
  // Escape HTML delimiters so arbitrary URLs cannot terminate a copied SFC script.
  const serialized = JSON.stringify(props, null, 2).replaceAll(
    '<',
    String.raw`\u003c`,
  )
  const isCustom = example === 'custom' || example === 'captions'
  const api = EXAMPLE_APIS[resolveExampleMode(example)]
  const { entry, handleType, actionsHook, stateHook, componentName } = api
  const imports = isCustom
    ? 'VideoPlayerRoot, Video, useVideoPlayerActions, useVideoPlayerState'
    : api.imports
  const methodTarget = actionTarget === 'ref' ? 'player.value?' : 'actions'
  return `<script setup lang="ts">
import { ref, shallowRef, useId } from 'vue'
import { ${imports} } from '${entry}'
import type { ${handleType} } from '${entry}'
${example === 'hls' || isLive ? "import { HlsVideo } from 'videojs-vue/media/hls'\n" : ''}${isCustom ? "import { MediaContainer, PlayButton, MuteButton, Time, FullscreenButton, CaptionsRadioGroup, PlaybackRateButton, PlaybackRateRadioGroup, MediaMenu, MediaMenuContent } from 'videojs-vue/ui'\n" : ''}
const player = shallowRef<${handleType} | null>(null)
const isMounted = ref(true)
const options = ${serialized} as const
${
  isCustom
    ? ''
    : `const volume = ref<number>(options.volume)
const muted = ref<boolean>(options.muted)
${isLive ? '' : 'const playbackRate = ref<number>(options.playbackRate)'}
`
}
const actions = ${actionsHook}(player)
const currentTime = ${stateHook}(state => state.currentTime, player)
${isCustom ? 'const paused = useVideoPlayerState(state => state.paused, player)\nconst rate = useVideoPlayerState(state => state.playbackRate, player)\nconst captionsId = useId()\nconst speedId = useId()' : ''}
const failure = ref('')

async function play() {
  try {
    failure.value = ''
    await ${methodTarget}.play()
  } catch (error) {
    failure.value = String(error)
  }
}
${
  example === 'actions'
    ? `
const commands = {
  play: () => ${methodTarget}.play(),
  pause: () => ${methodTarget}.pause(),
  seek: () => ${methodTarget}.seek(10),
  setVolume: () => ${methodTarget}.setVolume(0.5),
  setMuted: () => ${methodTarget}.setMuted(true),
  setPlaybackRate: () => ${methodTarget}.setPlaybackRate(1.5),
  requestFullscreen: () => ${methodTarget}.requestFullscreen(),
  exitFullscreen: () => ${methodTarget}.exitFullscreen(),
  requestPictureInPicture: () => ${methodTarget}.requestPictureInPicture(),
  exitPictureInPicture: () => ${methodTarget}.exitPictureInPicture(),
}
async function run(command: keyof typeof commands) {
  try {
    failure.value = ''
    await commands[command]()
  } catch (error) {
    failure.value = String(error)
  }
}
`
    : ''
}
</script>

<template>
${
  isCustom
    ? `  <VideoPlayerRoot v-if="isMounted" ref="player" :title="options.title">
    <MediaContainer class="relative block aspect-video bg-black text-white">
      <Video v-bind="options" class="h-full w-full" />
      <div class="absolute inset-x-0 bottom-0 flex items-center gap-4 bg-black/70 p-4">
        <PlayButton>{{ paused ? 'Play' : 'Pause' }}</PlayButton>
        <Time type="current" />
        <MuteButton>Mute</MuteButton>
        <button type="button" :commandfor="captionsId">Captions</button>
        <MediaMenu :id="captionsId" side="top" align="end">
          <MediaMenuContent aria-label="Captions"><CaptionsRadioGroup /></MediaMenuContent>
        </MediaMenu>
        <PlaybackRateButton :commandfor="speedId">{{ rate ?? 1 }}×</PlaybackRateButton>
        <MediaMenu :id="speedId" side="top" align="end">
          <MediaMenuContent aria-label="Playback speed"><PlaybackRateRadioGroup /></MediaMenuContent>
        </MediaMenu>
        <FullscreenButton>Fullscreen</FullscreenButton>
      </div>
    </MediaContainer>
  </VideoPlayerRoot>`
    : `  <${componentName}
    v-if="isMounted"
    ref="player"
    v-bind="options"${example === 'hls' || isLive ? '\n    :media="HlsVideo"' : ''}
    v-model:volume="volume"
    v-model:muted="muted"
${isLive ? '' : '    v-model:playback-rate="playbackRate"'}
    @ready="() => console.log('ready')"
    @play="() => console.log('play')"
  />`
}
  <p>currentTime: {{ currentTime ?? '—' }}</p>
  <button :disabled="!player?.store" @click="play">Play</button>
${example === 'actions' ? `  <button v-for="(_, name) in commands" :key="name" :disabled="!player?.store" @click="run(name)">{{ name }}</button>\n` : ''}  <button @click="isMounted = !isMounted">Mount / unmount</button>
  <p v-if="failure" role="alert">{{ failure }}</p>
</template>${
    isCustom
      ? `

<style scoped>
media-menu { z-index: 20; width: 220px; max-height: 240px; overflow-y: auto; border: 1px solid #ffffff26; border-radius: 20px; padding: 8px; color: white; background: #202326ed; backdrop-filter: blur(20px); }
media-menu:not([data-open]) { display: none; }
media-menu :deep(media-menu-radio-item) { display: flex; min-height: 44px; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 12px; cursor: pointer; }
media-menu :deep([aria-checked='true']) { background: #ffffff12; }
media-menu :deep([aria-checked='true'])::after { content: '✓'; }
media-menu :deep([data-highlighted]) { outline: 2px solid white; outline-offset: -2px; }
</style>`
      : ''
  }`
}

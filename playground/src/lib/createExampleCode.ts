import type { ExampleId, PlaygroundConfig } from '../data'

export function createExampleCode(
  example: ExampleId,
  config: PlaygroundConfig,
  actionTarget: string,
) {
  const { hasCaptions, trackSrc, trackLanguage, trackLabel, ...options } =
    config
  const isAudio = example === 'audio'
  const { playsinline, ...audioOptions } = options
  const props = {
    ...(isAudio ? {} : { playsinline }),
    ...audioOptions,
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
          ]
        : [],
  }
  // Escape HTML delimiters so arbitrary URLs cannot terminate a copied SFC script.
  const serialized = JSON.stringify(props, null, 2).replaceAll(
    '<',
    String.raw`\u003c`,
  )
  const isCustom = example === 'custom'
  let imports = 'VideoPlayer, usePlayerActions, usePlayerState'
  if (isCustom) {
    imports = 'PlayerRoot, Video, usePlayerActions, usePlayerState'
  } else if (isAudio) {
    imports = 'AudioPlayer, useAudioPlayerActions, useAudioPlayerState'
  }
  const entry = isAudio ? 'videojs-vue/audio' : 'videojs-vue'
  const handleType = isAudio ? 'AudioPlayerHandle' : 'PlayerHandle'
  const actionsHook = isAudio ? 'useAudioPlayerActions' : 'usePlayerActions'
  const stateHook = isAudio ? 'useAudioPlayerState' : 'usePlayerState'
  const methodTarget = actionTarget === 'ref' ? 'player.value?' : 'actions'
  return `<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { ${imports} } from '${entry}'
import type { ${handleType} } from '${entry}'
${example === 'hls' ? "import { HlsVideo } from 'videojs-vue/media/hls'\n" : ''}${isCustom ? "import { MediaContainer, PlayButton, MuteButton, Time, FullscreenButton } from 'videojs-vue/ui'\n" : ''}
const player = shallowRef<${handleType} | null>(null)
const isMounted = ref(true)
const options = ${serialized} as const
${
  isCustom
    ? ''
    : `const volume = ref<number>(options.volume)
const muted = ref<boolean>(options.muted)
const playbackRate = ref<number>(options.playbackRate)
`
}
const actions = ${actionsHook}(player)
const currentTime = ${stateHook}(state => state.currentTime, player)
${isCustom ? 'const paused = usePlayerState(state => state.paused, player)' : ''}
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
    ? `  <PlayerRoot v-if="isMounted" ref="player" :title="options.title">
    <MediaContainer class="relative block aspect-video bg-black text-white">
      <Video v-bind="options" class="h-full w-full" />
      <div class="absolute inset-x-0 bottom-0 flex items-center gap-4 bg-black/70 p-4">
        <PlayButton>{{ paused ? 'Play' : 'Pause' }}</PlayButton>
        <Time type="current" />
        <MuteButton>Mute</MuteButton>
        <FullscreenButton>Fullscreen</FullscreenButton>
      </div>
    </MediaContainer>
  </PlayerRoot>`
    : `  <${isAudio ? 'AudioPlayer' : 'VideoPlayer'}
    v-if="isMounted"
    ref="player"
    v-bind="options"${example === 'hls' ? '\n    :media="HlsVideo"' : ''}
    v-model:volume="volume"
    v-model:muted="muted"
    v-model:playback-rate="playbackRate"
    @ready="() => console.log('ready')"
    @play="() => console.log('play')"
  />`
}
  <p>currentTime: {{ currentTime ?? '—' }}</p>
  <button :disabled="!player?.store" @click="play">Play</button>
${example === 'actions' ? `  <button v-for="(_, name) in commands" :key="name" :disabled="!player?.store" @click="run(name)">{{ name }}</button>\n` : ''}  <button @click="isMounted = !isMounted">Mount / unmount</button>
  <p v-if="failure" role="alert">{{ failure }}</p>
</template>`
}

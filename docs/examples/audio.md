---
description: Play native audio with an audio skin, reactive settings, and custom controls.
---

# Native audio

Serve an audio file at `/episode.mp3`, then use the independent audio entry:

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { AudioPlayer, useAudioPlayerState } from 'videojs-vue/audio'
import type { AudioPlayerHandle } from 'videojs-vue/audio'

const player = shallowRef<AudioPlayerHandle | null>(null)
const volume = shallowRef(0.7)
const currentTime = useAudioPlayerState(state => state.currentTime, player)
</script>

<template>
  <AudioPlayer
    ref="player"
    v-model:volume="volume"
    src="/episode.mp3"
    title="Episode one"
    preload="metadata"
    skin="neutral"
  />
  <p>Played {{ currentTime?.toFixed(1) ?? '0.0' }} seconds</p>
</template>
```

Use `skin="default"` for the other packaged skin. Both use natural height. Try the audio example in the [playground](https://videojs-vue-playground.ntnyq.dev).

## Native controls and source candidates

Compose a root and native audio when you want browser controls or multiple source formats:

```vue
<script setup lang="ts">
import { AudioPlayerRoot, Audio } from 'videojs-vue/audio'
</script>

<template>
  <AudioPlayerRoot title="Episode one">
    <Audio
      controls
      preload="metadata"
    >
      <source
        src="/episode.ogg"
        type="audio/ogg"
      />
      <source
        src="/episode.mp3"
        type="audio/mpeg"
      />
    </Audio>
  </AudioPlayerRoot>
</template>
```

For a custom interface, use shared playback controls from `videojs-vue/ui` inside a `MediaContainer`, or your own Vue buttons with `useAudioPlayerActions`. Descendant components can omit the composable target to use the root's audio context. Handle `play()` rejections when calling it from application controls, as shown in the [state and actions guide](../guide/state-and-actions.md).

This entry supports native on-demand audio. The existing `HlsVideo` adapter remains video-only. See the [audio API](../api/audio.md) for props, events, refs, and lifecycle behavior.

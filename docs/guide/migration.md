---
description: Migrate to explicit video and live video API names and namespaced video imports.
---

# Migrate player API names

This breaking change makes player-specific APIs match their component names: `VideoPlayer`, `AudioPlayer`, and `LiveVideoPlayer`. Historical names and video import paths are removed without compatibility aliases. Playback behavior, method signatures, and lifecycle contracts stay the same.

## Video names

Update imports, type annotations, Vue templates, and template refs with these replacements:

| Previous name      | Current name            |
| ------------------ | ----------------------- |
| `PlayerRoot`       | `VideoPlayerRoot`       |
| `PlayerHandle`     | `VideoPlayerHandle`     |
| `PlayerStore`      | `VideoPlayerStore`      |
| `PlayerState`      | `VideoPlayerState`      |
| `PlayerActions`    | `VideoPlayerActions`    |
| `PlayerElement`    | `VideoPlayerElement`    |
| `PlayerTarget`     | `VideoPlayerTarget`     |
| `usePlayerState`   | `useVideoPlayerState`   |
| `usePlayerActions` | `useVideoPlayerActions` |
| `MediaProps`       | `VideoMediaProps`       |

`VideoPlayerHandle` continues to describe the on-demand video preset. It is not a union of audio, video, and live handles. The root package still exports the video API as a convenient aggregate entry.

## Video import paths

| Previous import                | Current import                       |
| ------------------------------ | ------------------------------------ |
| `videojs-vue/core`             | `videojs-vue/video/core`             |
| `videojs-vue/composables`      | `videojs-vue/video/composables`      |
| `videojs-vue/skins/compat`     | `videojs-vue/video/skins/compat`     |
| `videojs-vue/skins/default`    | `videojs-vue/video/skins/default`    |
| `videojs-vue/skins/neutral`    | `videojs-vue/video/skins/neutral`    |
| `videojs-vue/skins/legacy`     | `videojs-vue/video/skins/legacy`     |
| `videojs-vue/skins/legacy.css` | `videojs-vue/video/skins/legacy.css` |

Update the legacy stylesheet import as well as JavaScript and type imports. Fixed player entries such as `videojs-vue/video/default` and `videojs-vue/video/legacy` keep their paths.

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { VideoPlayerRoot, Video } from 'videojs-vue/video/core'
import type { VideoPlayerHandle } from 'videojs-vue/video/core'
import {
  useVideoPlayerActions,
  useVideoPlayerState,
} from 'videojs-vue/video/composables'
import { DefaultVideoSkin } from 'videojs-vue/video/skins/default'

const player = useTemplateRef<VideoPlayerHandle>('player')
const paused = useVideoPlayerState(state => state.paused, player)
const actions = useVideoPlayerActions(player)
</script>

<template>
  <VideoPlayerRoot ref="player">
    <DefaultVideoSkin>
      <Video src="/video.mp4" />
    </DefaultVideoSkin>
  </VideoPlayerRoot>
  <button @click="actions.play()">Play (paused: {{ paused }})</button>
</template>
```

Replace `/video.mp4` with your media URL. See [composition](./composition.md) for context injection and custom controls.

## Live video names

Live APIs use the complete `LiveVideoPlayer` prefix. Their `videojs-vue/live/*` import paths stay the same.

| Previous name          | Current name                |
| ---------------------- | --------------------------- |
| `LivePlayerHandle`     | `LiveVideoPlayerHandle`     |
| `LivePlayerState`      | `LiveVideoPlayerState`      |
| `LivePlayerActions`    | `LiveVideoPlayerActions`    |
| `LivePlayerElement`    | `LiveVideoPlayerElement`    |
| `LivePlayerTarget`     | `LiveVideoPlayerTarget`     |
| `useLivePlayerState`   | `useLiveVideoPlayerState`   |
| `useLivePlayerActions` | `useLiveVideoPlayerActions` |
| `LiveMediaProps`       | `LiveVideoMediaProps`       |
| `LiveVideoSkin`        | `DefaultLiveVideoSkin`      |

`LiveVideoPlayer`, `LiveVideoPlayerRoot`, `LiveVideoPlayerStore`, `LiveVideoMediaComponent`, and `NeutralLiveVideoSkin` retain their names. See the [live video API](../api/live.md) for supported actions and state.

## Shared and audio APIs

Audio API names and paths stay the same. Shared media types such as `PlayerMedia`, `MediaTrack`, and `MediaEventName`, along with the shared UI and i18n entries, also retain their names.

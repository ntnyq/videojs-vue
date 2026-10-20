---
description: Build a player with a media adapter, custom controls, and fullscreen overlays.
---

# Compose a player

`VideoPlayerRoot` provides both the upstream player and Vue context. No separate Provider is required. Render exactly one media component per root.

```vue
<script setup lang="ts">
import { VideoPlayerRoot, Video } from 'videojs-vue/video/core'
import { MediaContainer } from 'videojs-vue/ui/container'
import { MediaControls } from 'videojs-vue/ui/controls'
import { MediaControlsContent } from 'videojs-vue/ui/controls-content'
import { PlayButton } from 'videojs-vue/ui/play-button'
import { MuteButton } from 'videojs-vue/ui/mute-button'
import { FullscreenButton } from 'videojs-vue/ui/fullscreen-button'
</script>

<template>
  <VideoPlayerRoot
    title="Lesson"
    poster="/poster.webp"
  >
    <MediaContainer class="surface">
      <Video
        class="media"
        src="/lesson.mp4"
      />
      <MediaControls visibility="always">
        <MediaControlsContent class="controls">
          <PlayButton>Play / pause</PlayButton>
          <MuteButton>Mute / unmute</MuteButton>
          <FullscreenButton>Fullscreen</FullscreenButton>
        </MediaControlsContent>
      </MediaControls>
      <div class="lesson-overlay">Lesson 1</div>
    </MediaContainer>
  </VideoPlayerRoot>
</template>

<style scoped>
.surface {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
}
.media {
  display: block;
  width: 100%;
  height: 100%;
}
.controls {
  position: absolute;
  bottom: 0;
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #172a3b;
  color: white;
}
.lesson-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
}
</style>
```

Controls are unstyled upstream components. They retain upstream keyboard behavior, accessibility labels and state attributes. Supply their content and CSS; use `Hotkey` and `StatusAnnouncer` when building a complete custom skin. The [Playground](https://videojs-vue-playground.vercel.app) includes a time slider assembled from `SliderTrack`, `SliderBuffer`, `SliderFill`, and `SliderThumb`.

Business overlays must be descendants of `MediaContainer` to remain visible in fullscreen.

## State inside a child component

```ts
import {
  useVideoPlayerState,
  useVideoPlayerActions,
} from 'videojs-vue/video/composables'

const paused = useVideoPlayerState(state => state.paused)
const actions = useVideoPlayerActions()

async function start() {
  try {
    await actions.play()
  } catch (error) {
    console.error('Playback request failed', error)
  }
}
```

Use these in a descendant component's setup, not in the component that creates the root. Missing context throws a descriptive error. Outside the Root, pass a [component ref](./state-and-actions.md).

## Packaged skins

`DefaultVideoSkin` and `NeutralVideoSkin` can also be placed inside `VideoPlayerRoot` with `Video` or `HlsVideo` as their default content. Their named `poster` and `thumbnail` slots map to the upstream slots. `VideoPlayer` exposes those same two named slots. It does not offer arbitrary controls or overlay slots inside packaged skins.

Use the [official CSS variables](https://videojs.org/docs/framework/html/guides/customize-skins) for skin styling. Deep control layout changes belong in composition mode.

See [UI controls](../api/ui.md) for all supported control props and [skins and styling](./styling.md) for sizing and attribute destinations.

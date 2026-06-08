# Compose a player

`PlayerRoot` provides both the upstream player and Vue context. No separate Provider is required. Render exactly one media component per Root.

```vue
<script setup lang="ts">
import { PlayerRoot, Video } from 'videojs-vue'
import {
  MediaContainer,
  MediaControls,
  MediaControlsContent,
  PlayButton,
  MuteButton,
  FullscreenButton,
} from 'videojs-vue/ui'
</script>

<template>
  <PlayerRoot
    title="Lesson"
    poster="/poster.webp"
  >
    <MediaContainer class="surface">
      <Video src="/lesson.mp4" />
      <MediaControls visibility="always">
        <MediaControlsContent class="controls">
          <PlayButton>Play / pause</PlayButton>
          <MuteButton>Mute / unmute</MuteButton>
          <FullscreenButton>Fullscreen</FullscreenButton>
        </MediaControlsContent>
      </MediaControls>
      <div class="lesson-overlay">Lesson 1</div>
    </MediaContainer>
  </PlayerRoot>
</template>

<style scoped>
.surface {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
}
.surface video {
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

Controls are unstyled upstream components. They retain upstream keyboard behavior, accessibility labels and state attributes. Supply their content and CSS; use `Hotkey` and `StatusAnnouncer` when building a complete custom skin. The playground includes a time slider assembled from `SliderTrack`, `SliderBuffer`, `SliderFill`, and `SliderThumb`.

Business overlays must be descendants of `MediaContainer` to remain visible in fullscreen.

## State inside a child component

```ts
import { usePlayerState, usePlayerActions } from 'videojs-vue'

const paused = usePlayerState(state => state.paused)
const actions = usePlayerActions()

async function start() {
  try {
    await actions.play()
  } catch (error) {
    console.error('Playback request failed', error)
  }
}
```

Use these in a descendant component's setup, not in the component that creates the Root. Missing context throws a descriptive error. Outside the Root, pass a [component ref](../api/overview.md#state-and-actions).

## Packaged skins

`DefaultVideoSkin` and `NeutralVideoSkin` can also be placed inside `PlayerRoot` with `Video` or `HlsVideo` as their default content. Their named `poster` and `thumbnail` slots map to the upstream slots. `VideoPlayer` exposes those same two named slots. It does not offer arbitrary controls or overlay slots inside packaged skins.

Use the [official CSS variables](https://videojs.org/docs/framework/html/guides/customize-skins) for skin styling. Deep control layout changes belong in composition mode.

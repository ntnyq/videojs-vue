---
description: Play HLS live video, configure its engine, and compose a return-to-live control.
---

# HLS Live

Install the optional adapter alongside the base package:

```sh
pnpm add videojs-vue vue @videojs/hlsjs-video@10.0.1
```

## Packaged player

```vue
<script setup lang="ts">
import { LiveVideoPlayer } from 'videojs-vue/live'
import { HlsVideo } from 'videojs-vue/media/hls'
</script>

<template>
  <LiveVideoPlayer
    :media="HlsVideo"
    src="/live.m3u8"
    title="Live event"
    muted
  />
</template>
```

Replace `/live.m3u8` with an accessible live manifest. Segments, keys, and cross-origin requests must also be accessible. Use the HLS Live example in the [Playground](https://videojs-vue-playground.ntnyq.dev) to inspect the live store, pause playback, and return to the edge with the Live button. Its public demo stream can be replaced with your own URL.

Use `skin="neutral"` for the alternative packaged skin. Playback starts through user interaction unless you opt into `autoplay`; browser policy may still reject playback.

## Structured HLS options

The high-level player forwards shared media props. Configure engine options by composing the root, skin, and media adapter:

```vue
<script setup lang="ts">
import { LiveVideoPlayerRoot } from 'videojs-vue/live/core'
import { DefaultLiveVideoSkin } from 'videojs-vue/live/skins/default'
import { HlsVideo } from 'videojs-vue/media/hls'
import type { HlsSource } from 'videojs-vue/media/hls'

const source: HlsSource = {
  src: '/live.m3u8',
  preferPlayback: 'mse',
  engine: {
    hlsJs: {
      lowLatencyMode: true,
    },
  },
}
</script>

<template>
  <LiveVideoPlayerRoot title="Live event">
    <DefaultLiveVideoSkin>
      <HlsVideo
        :source="source"
        muted
      />
    </DefaultLiveVideoSkin>
  </LiveVideoPlayerRoot>
</template>
```

The wrapper passes `source` as a DOM property. Replace the source object when changing configuration. Native HLS reads `engine.nativeHls` instead; support and latency depend on the browser, adapter, and stream.

## Custom live controls

```vue
<script setup lang="ts">
import { LiveVideoPlayerRoot } from 'videojs-vue/live/core'
import { HlsVideo } from 'videojs-vue/media/hls'
import { MediaContainer } from 'videojs-vue/ui/container'
import { LiveButton } from 'videojs-vue/ui/live-button'
import { PlayButton } from 'videojs-vue/ui/play-button'
</script>

<template>
  <LiveVideoPlayerRoot>
    <MediaContainer class="live-player">
      <HlsVideo src="/live.m3u8" />
      <div class="live-controls">
        <PlayButton>Play / pause</PlayButton>
        <LiveButton />
      </div>
    </MediaContainer>
  </LiveVideoPlayerRoot>
</template>

<style scoped>
.live-player {
  display: block;
  position: relative;
  aspect-ratio: 16 / 9;
}
.live-controls {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #000a;
  color: white;
}
</style>
```

The live button chooses the latest finite seekable end at activation. Do not seek to `Infinity` or infer live status from an infinite duration. For a future DVR timeline, read every seekable interval and validate the destination again as the window moves. Basic live playback does not add a DVR slider.

See the [live API](../api/live.md) for selectors, actions, available entries, and lifecycle details, and the [upstream live guide](https://videojs.org/docs/framework/html/guides/live-streams) for engine constraints.

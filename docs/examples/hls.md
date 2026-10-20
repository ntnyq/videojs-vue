---
description: Install the optional HLS adapter, play a stream, and configure typed engine options.
---

# HLS

For independent quality/audio menus and programmatic selection, see [quality and audio selection](./media-selection.md).

Use the optional `HlsVideo` adapter to play an HLS source. Try it in the [Playground](https://videojs-vue-playground.vercel.app).

## Install the adapter

Start with the [base package](../guide/getting-started.md), then add its optional HLS peer dependency. The base entry does not load hls.js.

```sh
pnpm add @videojs/hlsjs-video@10.0.1
```

## Render an HLS player

```vue
<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue'
import { HlsVideo } from 'videojs-vue/media/hls'
</script>

<template>
  <VideoPlayer
    :media="HlsVideo"
    src="/stream.m3u8"
  />
</template>
```

Replace `/stream.m3u8` with an accessible HLS manifest URL. Its referenced segments and any cross-origin requests must also be accessible to the browser.

## Adapter configuration

`VideoPlayer` forwards shared media props only. Use composition for typed engine options. The wrapper writes `source` as a DOM property, never a serialized HTML attribute.

```vue
<script setup lang="ts">
import { PlayerRoot, DefaultVideoSkin } from 'videojs-vue'
import { HlsVideo } from 'videojs-vue/media/hls'
import type { HlsSource } from 'videojs-vue/media/hls'

const source: HlsSource = {
  src: '/stream.m3u8',
  preferPlayback: 'mse',
  engine: {
    hlsJs: {
      capLevelToPlayerSize: true,
    },
  },
}
</script>

<template>
  <PlayerRoot>
    <DefaultVideoSkin>
      <HlsVideo :source="source" />
    </DefaultVideoSkin>
  </PlayerRoot>
</template>
```

Use `engine.hlsJs` for hls.js options and `engine.nativeHls` for native HLS options. Each playback path reads only its own options.

The upstream adapter decides native/MSE playback support and handles adaptive streaming. Autoplay and fullscreen remain subject to browser policy. For live streams, use the dedicated [HLS Live player](./live.md) with live-edge tracking and a return-to-live button.

Replace the `source` object to update its options. Avoid providing both `src` and `source.src` on `HlsVideo`.

## Handle failures

Listen for the media `error` event for loading failures and catch rejected player actions separately. Module resolution errors usually indicate that the optional dependency is missing or mismatched; see [troubleshooting](../guide/troubleshooting.md#hls-dependency-or-configuration-errors).

See the [media adapter reference](../api/media.md#hlsvideo) for props and exported types, and [lifecycle](../guide/lifecycle.md) for adapter cleanup and KeepAlive behavior.

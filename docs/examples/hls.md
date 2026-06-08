# HLS

HLS is an explicit, optional import. The base package does not load hls.js.

```sh
pnpm add @videojs/hlsjs-video@10.0.1
```

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

## Adapter configuration

Use composition for typed engine options. The wrapper writes `source` as a DOM property, never a serialized HTML attribute.

```vue
<script setup lang="ts">
import { PlayerRoot, DefaultVideoSkin } from 'videojs-vue'
import { HlsVideo } from 'videojs-vue/media/hls'
import type { HlsSource } from 'videojs-vue/media/hls'

const source: HlsSource = {
  src: '/stream.m3u8',
  preferPlayback: 'mse',
  engine: { capLevelToPlayerSize: true },
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

The upstream adapter decides native/MSE playback support and handles adaptive streaming. Autoplay and fullscreen remain subject to browser policy. A live URL may play, but this wrapper's preset and UI are for on-demand video; dedicated live APIs are outside this release.

# Getting started

Requires Vue 3.5+. The wrapper uses `@videojs/html@10.0.1` and registers its custom elements automatically. Only direct use of upstream HTML tags requires a Vue `isCustomElement` compiler configuration.

```sh
pnpm add videojs-vue vue
```

```vue
<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue'
</script>

<template>
  <VideoPlayer
    src="/demo.mp4"
    poster="/poster.webp"
    title="Product demo"
    @ended="console.log('ended')"
  />
</template>
```

The default skin supplies controls and keyboard interaction. Set `skin="neutral"` for the neutral skin. `class`, `style`, and other fallthrough attributes target the visible skin, not the outer state provider. Its default size is full width with a 16:9 aspect ratio.

## Two-way settings

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VideoPlayer } from 'videojs-vue'

const volume = shallowRef(0.7)
const muted = shallowRef(false)
const playbackRate = shallowRef(1)
</script>

<template>
  <VideoPlayer
    src="/demo.mp4"
    v-model:volume="volume"
    v-model:muted="muted"
    v-model:playback-rate="playbackRate"
  />
</template>
```

Changing a value requests a media property update. Media confirmation events emit the actual settings. Unbound settings remain under player control. Volume is clamped to 0-1; non-finite volume and non-positive/non-finite rates are ignored. Valid rates may still be rejected by the browser. Use actions when you need to handle command failures explicitly.

There is no `v-model:currentTime` or `v-model:playing`: read state and call `seek`, `play`, or `pause` instead.

Continue with [API contracts](../api/overview.md), [HLS](../examples/hls.md), or [composition](./composition.md).

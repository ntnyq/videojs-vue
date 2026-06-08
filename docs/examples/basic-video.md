# Native video

<script setup>
import { VideoPlayer } from 'videojs-vue'
</script>

<VideoPlayer
  src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"
  poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.jpg"
  title="Video.js demo"
/>

This example is rendered by the workspace library during the VitePress server build and hydrated in the browser.

```vue
<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue'
</script>

<template>
  <VideoPlayer
    src="/demo.mp4"
    poster="/poster.webp"
    title="Demo"
    crossorigin="anonymous"
    :tracks="[
      {
        src: '/captions.vtt',
        kind: 'captions',
        srclang: 'en',
        label: 'English',
      },
    ]"
  />
</template>
```

To replace the poster, use `#poster` with one image element. For a custom control layout, see [composition](../guide/composition.md).

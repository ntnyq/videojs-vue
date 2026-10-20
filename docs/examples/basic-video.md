---
description: Play native video, add WebVTT captions, and customize the poster and skin.
---

# Native video and captions

<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue'
</script>

<VideoPlayer
  src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"
  poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.jpg"
  title="Video.js demo"
/>

This player uses a public demo source. For source switching, settings, and event inspection, open the [Playground](https://videojs-vue-playground.ntnyq.dev).

## Add captions

After [installation](../guide/getting-started.md), use the following component in your application. Serve `demo.mp4`, `poster.webp`, and `captions.vtt` from your public directory, or replace the URLs with your own assets.

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
        default: true,
      },
    ]"
  />
</template>
```

Create `public/captions.vtt` with a cue that overlaps your video:

```text
WEBVTT

00:00:00.000 --> 00:00:04.000
Welcome to the demo.
```

Start playback and select the English caption track in the player controls. The `default` flag marks it as a default candidate; the browser and user preferences determine the initial selection. Cross-origin media and tracks require compatible server CORS headers.

## Customize the example

- Change `src` to load another video using upstream source-change behavior.
- Set `skin="neutral"` to try the other packaged skin.
- Use the [poster slot](../guide/styling.md#replace-the-poster) for custom poster content.
- Use [composition](../guide/composition.md) for a custom control layout.

See [MediaTrack](../api/media.md#mediatrack) for track fields and [events](../api/events.md) for playback notifications.

---
description: Choose a packaged skin, customize sizing and poster content, or switch to composed controls.
---

# Skins and styling

Use a packaged skin when its control layout fits your application. Use [composition](./composition.md) when you need to choose the controls or place overlays inside the player.

## Set the player size

`VideoPlayer` forwards `class` and `style` to its visible skin. Both packaged skins default to full width and a 16:9 aspect ratio.

```vue
<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue'
</script>

<template>
  <VideoPlayer
    src="/demo.mp4"
    skin="neutral"
    :style="{ maxWidth: '960px', aspectRatio: '4 / 3' }"
  />
</template>
```

Inline styles can override the wrapper's default aspect ratio. For colors and other supported design tokens, use the [Video.js skin CSS variables](https://videojs.org/docs/framework/html/guides/customize-skins).

## Replace the poster

Use the named `poster` slot for custom poster content:

```vue
<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue'
</script>

<template>
  <VideoPlayer
    src="/demo.mp4"
    title="Lesson"
  >
    <template #poster>
      <img
        src="/poster.webp"
        alt="Lesson preview"
        :style="{ width: '100%', height: '100%', objectFit: 'cover' }"
      />
    </template>
  </VideoPlayer>
</template>
```

`VideoPlayer`, `DefaultVideoSkin`, and `NeutralVideoSkin` also forward a named `thumbnail` slot. Named slot nodes receive the corresponding upstream `slot` attribute; the slots do not supply scoped data.

## Place attributes on the right element

| Component                              | Attribute destination          |
| -------------------------------------- | ------------------------------ |
| `VideoPlayer`                          | Visible skin element.          |
| `PlayerRoot`                           | Outer `video-player` element.  |
| `DefaultVideoSkin`, `NeutralVideoSkin` | Skin element.                  |
| `Video`, `HlsVideo`                    | Media element.                 |
| Components from `videojs-vue/ui`       | Corresponding control element. |

Use `PlayerRoot` with a media component when you need media-specific attributes not declared by `VideoPlayer`. Arbitrary controls and overlays are not slots on `VideoPlayer`; place them inside `MediaContainer` in a composed player so they remain in the fullscreen container.

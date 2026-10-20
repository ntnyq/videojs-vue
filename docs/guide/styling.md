---
description: Choose a packaged skin, customize sizing and poster content, or switch to composed controls.
---

# Skins and styling

Use a packaged skin when its control layout fits your application. Use [composition](./composition.md) when you need to choose the controls or place overlays inside the player.

## Set the player size

`VideoPlayer` forwards `class` and `style` to its visible skin. All packaged video skins default to full width and a 16:9 aspect ratio.

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

## Compat skin

Use the dedicated entry to load the upstream [Compat skin](https://videojs.org/docs/framework/html/reference/components/video-compat-skin):

```vue
<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue/video/compat'
</script>

<template>
  <VideoPlayer
    src="/demo.mp4"
    poster="/poster.webp"
    title="Demo"
  />
</template>
```

The entry registers `video-compat-skin` and shares the other fixed players' props, events, slots, exposed handle, and optional HLS adapter. Omit `skin`; if supplied, it must be `'compat'`. The aggregate `videojs-vue` player still selects only default or neutral.

For composition, import the standalone wrapper with `VideoPlayerRoot` and `Video`:

```vue
<script setup lang="ts">
import { VideoPlayerRoot, Video } from 'videojs-vue/video/core'
import { CompatVideoSkin } from 'videojs-vue/video/skins/compat'
</script>

<template>
  <VideoPlayerRoot>
    <CompatVideoSkin>
      <Video src="/demo.mp4" />
    </CompatVideoSkin>
  </VideoPlayerRoot>
</template>
```

Compat provides basic controls and plain surfaces with broader compatibility as its design goal. This wrapper uses the packaged `@videojs/html@10.0.1` skin without CSS rewrites or JS polyfills. That skin still contains `@layer`, `@container`, and `:has()`, so this entry does not establish support for Chrome 90 or another lower browser baseline. Test playback and controls in your target browsers. See the upstream [browser support guide](https://videojs.org/docs/framework/html/guides/browser-support) for build and polyfill considerations; skin CSS embedded in JS is not processed by an application's ordinary CSS pipeline.

## Legacy skin

For a Chrome 90 target, use the separate [legacy mode](./legacy.md), including its stylesheet, polyfills, and consumer build configuration. `LegacyVideoSkin` uses light DOM and a simplified control layout.

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

`VideoPlayer`, `DefaultVideoSkin`, `NeutralVideoSkin`, and `CompatVideoSkin` also forward a named `thumbnail` slot. Named slot nodes receive the corresponding upstream `slot` attribute; the slots do not supply scoped data.

## Place attributes on the right element

| Component                                                 | Attribute destination          |
| --------------------------------------------------------- | ------------------------------ |
| `VideoPlayer`                                             | Visible skin element.          |
| `VideoPlayerRoot`                                         | Outer `video-player` element.  |
| `DefaultVideoSkin`, `NeutralVideoSkin`, `CompatVideoSkin` | Skin element.                  |
| `Video`, `HlsVideo`                                       | Media element.                 |
| Components from `videojs-vue/ui`                          | Corresponding control element. |

Use `VideoPlayerRoot` with a media component when you need media-specific attributes not declared by `VideoPlayer`. Arbitrary controls and overlays are not slots on `VideoPlayer`; place them inside `MediaContainer` in a composed player so they remain in the fullscreen container.

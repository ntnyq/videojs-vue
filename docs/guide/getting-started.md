---
description: Install videojs-vue and render your first player in a Vue 3 application.
---

# Getting started

This guide assumes an existing Vue 3.5+ application with a build tool that supports Vue single-file components.

## Install

```sh
pnpm add videojs-vue vue
```

`@videojs/html@10.0.1` is included as a dependency. Install the [optional HLS adapter](../examples/hls.md) only when you need it.

## Render a player

Add this to a Vue component:

```vue
<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue/video/default'
</script>

<template>
  <VideoPlayer
    src="/demo.mp4"
    poster="/poster.webp"
    title="Product demo"
  />
</template>
```

Place `demo.mp4` and `poster.webp` in your application's public directory, or replace the paths with accessible media URLs. The player displays a poster and packaged controls; start playback with the play button.

Registration and skin styles are included. No plugin installation or Vue `isCustomElement` configuration is needed when using these Vue components. Direct use of upstream HTML custom element tags requires separate compiler configuration.

## Choose a skin

The default skin supplies controls and keyboard interaction. For a fixed neutral skin, import `VideoPlayer` from `videojs-vue/video/neutral`. To switch skins with a prop, import `VideoPlayer` from the aggregate `videojs-vue` entry (which includes both skins):

```vue
<VideoPlayer src="/demo.mp4" skin="neutral" />
```

Both skins default to full width and a 16:9 aspect ratio. `class`, `style`, and other fallthrough attributes target the visible skin. See [skins and styling](./styling.md) to change sizing or slot content.

## Two-way settings

Bind the settings your application needs to control:

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VideoPlayer } from 'videojs-vue/video/default'

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

Changing a bound value requests a media setting update. Media confirmation events emit the actual value. Unbound settings remain under player control.

Volume is clamped to 0–1. Non-finite volume and non-positive or non-finite playback rates are ignored. The browser may reject otherwise valid rates; use [actions](./state-and-actions.md) to handle command failures explicitly.

There is no `v-model:currentTime` or `v-model:playing`. Read state and call `seek()`, `play()`, or `pause()` instead.

For lightweight core, composable, and control imports, see [bundle size and imports](./bundle-size.md).

## Next steps

- Try native video, HLS, and custom controls in the [Playground](https://videojs-vue-playground.vercel.app).
- Add [captions and a poster](../examples/basic-video.md).
- Connect application UI with [state and actions](./state-and-actions.md).
- Look up all [VideoPlayer props, events, and slots](../api/video-player.md).

## Audio playback

Import `AudioPlayer` from `videojs-vue/audio/default` for native audio with packaged skins. See the [audio example](../examples/audio.md) and [API](../api/audio.md).

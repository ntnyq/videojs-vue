# videojs-vue

[![CI](https://github.com/ntnyq/videojs-vue/workflows/CI/badge.svg)](https://github.com/ntnyq/videojs-vue/actions)
[![NPM VERSION](https://img.shields.io/npm/v/videojs-vue.svg)](https://www.npmjs.com/package/videojs-vue)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/videojs-vue.svg)](https://www.npmjs.com/package/videojs-vue)
[![LICENSE](https://img.shields.io/github/license/ntnyq/videojs-vue.svg)](https://github.com/ntnyq/videojs-vue/blob/main/LICENSE)

Vue 3 components and composables for Video.js 10, with video and audio players, packaged skins, reactive playback state, and optional HLS support.

[Documentation](https://videojs-vue-docs.vercel.app) · [Playground](https://videojs-vue-playground.vercel.app)

## Installation

Requires Vue 3.5 or later.

```sh
pnpm add videojs-vue vue
```

## Usage

```vue
<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue/video/default'
</script>

<template>
  <VideoPlayer
    src="/demo.mp4"
    poster="/poster.webp"
    title="Demo"
  />
</template>
```

Serve your video and poster at the URLs above. Component registration and skin styles are included; no Vue `isCustomElement` configuration is needed.

See the [documentation](https://videojs-vue-docs.vercel.app) for HLS, custom controls, internationalization, and the API reference. Try the [playground](https://videojs-vue-playground.vercel.app) for interactive examples.

## Audio

```vue
<script setup lang="ts">
import { AudioPlayer } from 'videojs-vue/audio/default'
</script>

<template>
  <AudioPlayer
    src="/episode.mp3"
    title="Episode one"
  />
</template>
```

The fixed audio entry loads only the default audio skin. Use `videojs-vue/audio` when switching between both skins at runtime. Lightweight `core`, `composables`, and individual control entries are also available; see [bundle size and imports](https://videojs-vue-docs.vercel.app/guide/bundle-size). See the [audio API](https://videojs-vue-docs.vercel.app/api/audio).

## Credits

Built on [Video.js](https://videojs.org), which provides the player, media adapters, and controls. Thanks to the [Video.js contributors](https://github.com/videojs/video.js).

## License

[MIT](LICENSE)

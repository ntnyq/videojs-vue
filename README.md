# videojs-vue

[![CI](https://github.com/ntnyq/videojs-vue/workflows/CI/badge.svg)](https://github.com/ntnyq/videojs-vue/actions)
[![NPM VERSION](https://img.shields.io/npm/v/videojs-vue.svg)](https://www.npmjs.com/package/videojs-vue)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/videojs-vue.svg)](https://www.npmjs.com/package/videojs-vue)
[![LICENSE](https://img.shields.io/github/license/ntnyq/videojs-vue.svg)](https://github.com/ntnyq/videojs-vue/blob/main/LICENSE)

Vue 3 components and composables for Video.js 10, with video and audio players, packaged skins, reactive playback state, and optional HLS support.

Upgrading from the previous player API? See the [breaking change migration guide](https://videojs-vue.ntnyq.dev/guide/migration) for renamed APIs and video import paths.

[Documentation](https://videojs-vue.ntnyq.dev) · [Playground](https://videojs-vue-playground.ntnyq.dev)

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

To use the upstream Compat skin, change the import to `videojs-vue/video/compat`. This entry loads only that skin and keeps the same player API. It does not include polyfills or guarantee a lower minimum browser version; see [Compat skin](https://videojs-vue.ntnyq.dev/guide/styling#compat-skin).

For Chrome 90+, use `videojs-vue/video/legacy` with `videojs-vue/video/skins/legacy.css`, opt-in `videojs-vue/polyfills`, and a consumer build targeting `chrome90`. See [legacy mode](https://videojs-vue.ntnyq.dev/guide/legacy) for setup and validation limits.

`core-js` is an optional peer dependency. Install it with `pnpm add core-js@^3.50.0` before importing `videojs-vue/polyfills`. Other entries do not require it. If your target browsers or application already provide `Array.prototype.at` and `Object.hasOwn`, omit both the polyfill import and the `core-js` installation, including when using the legacy skin.

See the [documentation](https://videojs-vue.ntnyq.dev) for HLS, custom controls, internationalization, and the API reference. Try the [playground](https://videojs-vue-playground.ntnyq.dev) for interactive examples.

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

The fixed audio entry loads only the default audio skin. Use `videojs-vue/audio` when switching between both skins at runtime. Lightweight `core`, `composables`, and individual control entries are also available; see [bundle size and imports](https://videojs-vue.ntnyq.dev/guide/bundle-size). See the [audio API](https://videojs-vue.ntnyq.dev/api/audio).

## HLS Live

Use the independent live preset with the optional HLS adapter:

```vue
<script setup lang="ts">
import { LiveVideoPlayer } from 'videojs-vue/live'
import { HlsVideo } from 'videojs-vue/media/hls'
</script>

<template>
  <LiveVideoPlayer
    :media="HlsVideo"
    src="/live.m3u8"
  />
</template>
```

Install `@videojs/hlsjs-video@10.0.1` separately. The live preset provides default and neutral skins, live-state composables, and a return-to-live button. See the [live API](https://videojs-vue.ntnyq.dev/api/live) and [HLS Live example](https://videojs-vue.ntnyq.dev/examples/live). A dedicated DVR timeline is outside this initial live release.

## Credits

Built on [Video.js](https://videojs.org), which provides the player, media adapters, and controls. Thanks to the [Video.js contributors](https://github.com/videojs/video.js).

## License

[MIT](LICENSE)

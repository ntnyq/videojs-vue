---
description: Build a simplified video player targeting Chrome 90 and later.
---

# Chrome 90+ legacy mode

The opt-in legacy entry targets Chrome 90+ with a separate light-DOM skin. It uses the same Video.js store, media adapters, props, events, exposed handle, and lifecycle as the other fixed players.

Legacy refers to browser compatibility. Its purpose is to avoid newer browser requirements, not to recreate the Video.js 8 appearance or API. The layout is assembled from Video.js 10 controls with a standalone stylesheet; playback behavior still comes from Video.js 10.

Three pieces are required: the legacy skin, runtime polyfills, and a production build that lowers **all** player dependencies to Chrome 90. Importing the entry alone does not lower upstream JavaScript syntax.

## Load the polyfills first

`core-js` is an optional peer dependency and is only required when importing `videojs-vue/polyfills`. Install it explicitly:

```sh
pnpm add core-js@^3.50.0
```

Other entries, including `videojs-vue/video/legacy`, do not require `core-js`. If your target browsers or application already provide `Array.prototype.at` and `Object.hasOwn`, skip this installation and the polyfill import below.

```ts
// main.ts — load global patches before the application module graph
import 'videojs-vue/polyfills'

void import('./bootstrap')
```

Move your usual `createApp(...).mount(...)` and application imports into `bootstrap.ts`. The polyfill entry uses `core-js` to supply `Array.prototype.at` and `Object.hasOwn`, which the pinned Video.js dependencies use. It is marked as side-effectful so bundlers preserve it. It does not register player elements. Other entries do not install global patches automatically; applications already providing these APIs can omit this entry.

## Configure the consumer build

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'chrome90',
    cssTarget: 'chrome90',
  },
})
```

The library targets Chrome 90 syntax but keeps `@videojs/*` external. Your bundler must include and transform those dependencies, including the optional HLS adapter. Do not externalize them to an untransformed CDN module. `target` transforms syntax; it does not install runtime polyfills. Test the **production build**: a development server may serve untransformed dependencies.

## Use the player

```vue
<script setup lang="ts">
import { VideoPlayer } from 'videojs-vue/video/legacy'
import 'videojs-vue/video/skins/legacy.css'
</script>

<template>
  <VideoPlayer
    src="/movie.mp4"
    poster="/poster.jpg"
    title="Demo"
  />
</template>
```

Omit `skin`, or set it to `'legacy'`. The aggregate `videojs-vue` entry continues to offer default and neutral skins. The legacy entry does not import any upstream packaged skin or the HLS engine.

For HLS, install the optional adapter and pass it as usual:

```ts
import { HlsVideo } from 'videojs-vue/media/hls'
// <VideoPlayer :media="HlsVideo" src="/stream.m3u8" />
```

For composition, use `VideoPlayerRoot` and `Video` from `videojs-vue/video/core`, and `LegacyVideoSkin` from `videojs-vue/video/skins/legacy`. Place the skin inside `VideoPlayerRoot` and the media inside the skin. Import the same legacy stylesheet.

## Controls and styling

The skin includes play/pause, seeking with buffer display, current time and duration, mute, volume, playback speed, captions toggle, picture-in-picture and fullscreen. Space/K toggle playback and Left/Right seek. Buttons and sliders reuse upstream keyboard and accessibility behavior; speed uses a native select. The control bar stays visible.

Controls use the standard Video.js 10 inline SVG icons, including state changes for playback, volume, captions, picture-in-picture, and fullscreen. They inherit `currentColor`, need no icon font or additional request, and do not import the packaged skin CSS. Decorative SVGs are hidden from assistive technology; the upstream buttons provide accessible labels.

`ResizeObserver` measures the player container. Below 480px the volume slider and picture-in-picture button are hidden; mute remains available. The layout wraps in narrow players and disconnects its observer while cached or unmounted.

The stylesheet uses ordinary selectors, RGB/RGBA colors, flex layout, and CSS variables. It does not depend on `@layer`, `@container`, `:has()`, CSS nesting, modern color functions, Popover, or anchor positioning. Customize it with:

```css
.my-player {
  --vjs-legacy-background: #000;
  --vjs-legacy-foreground: #fff;
  --vjs-legacy-controls: rgba(0, 0, 0, 0.8);
  --vjs-legacy-accent: #409eff;
}
```

`class` and `style` reach the fullscreen `media-container`; the default aspect ratio is 16:9. The `poster` slot overlays the media until playback starts. The simplified skin does not implement the `thumbnail` slot, quality or track-selection menus, or the default skin's animation and auto-hide behavior. Captions toggle the last selected or first suitable track. Speed's native select has an English accessible label; upstream controls retain their own localization.

## Validation and example

Run the isolated example without the main playground's modern CSS:

```sh
pnpm build
pnpm play:legacy:build
pnpm -C playground legacy:preview
```

Open `/legacy.html` on the preview server. It includes MP4/HLS switching, captions, and a player-width toggle. The demo media requires network access.

Automated tests cover player behavior, HLS binding, observer cleanup, KeepAlive, SSR, polyfill execution when the APIs are missing, and the consumer bundle's dependency isolation. Chrome 90 is the implementation target; these tests do not replace playback testing on a real Chrome 90 installation. Before production rollout, verify MP4/HLS playback, seeking, volume, captions, speed, fullscreen, and narrow layouts on your supported browser/device matrix. No compatibility claim is made for older Chrome versions, Safari, Firefox, or embedded WebViews.

See [Video.js browser support](https://videojs.org/docs/framework/html/guides/browser-support) and [Vite build targets](https://vite.dev/config/build-options#build-target) for the upstream constraints. The official Compat skin still uses newer CSS; it is separate from this legacy mode.

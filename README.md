# videojs-vue

Vue 3 components and composables for Video.js 10. Start with a complete player, then compose your own interface using the same upstream store and media capabilities.

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
    title="Demo"
  />
</template>
```

No `isCustomElement` configuration is needed when using the Vue components. Registration and packaged skin styles are included. Vue 3.5+ is required.

## Entry points

| Import                  | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `videojs-vue`           | `VideoPlayer`, `PlayerRoot`, `Video`, skins, state and actions |
| `videojs-vue/media/hls` | Optional `HlsVideo` adapter and HLS source types               |
| `videojs-vue/ui`        | Composable upstream controls and layout components             |

For HLS, install `@videojs/hlsjs-video@10.0.1` and pass `HlsVideo` to the `media` prop. The basic entry does not import hls.js.

See [getting started](docs/guide/getting-started.md), [API contracts](docs/api/overview.md), [composition](docs/guide/composition.md), and [lifecycle / SSR](docs/guide/lifecycle.md).

## Workspace

The root is the publishable package. Both `playground` and `docs` are private pnpm workspace packages consuming `videojs-vue` through `workspace:*`. Docs use VitePress **2.0.0-alpha.20** (the current v2 prerelease).

```sh
pnpm install
pnpm build
pnpm play:dev        # localhost:5174
pnpm docs:dev        # localhost:5173
pnpm release:check   # format, lint, types, tests, package and both sites
```

Run `pnpm dev` in another terminal while changing library source. Both sites consume the built package. See [playground scenarios](docs/playground.md).

## Scope

This version focuses on on-demand native video and HLS. Packaged default/neutral skins and a small set of upstream control bindings share one player store. It does not recreate Video.js internals, maintain a second playback state machine, or introduce a plugin framework. Audio, dedicated live presets, YouTube/Mux adapters and persistence remain future work.

The previous provider/controller API and experimental component entrypoints have been removed. Migrate to `VideoPlayer` or `PlayerRoot` and the two composables described in the docs.

## License

[MIT](LICENSE)

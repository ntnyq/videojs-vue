---
description: Choose lightweight entries and measure the production code your application downloads.
---

# Bundle size and import paths

Choose the smallest entry that supplies the components you use. Every component registers its own upstream elements. The existing `videojs-vue`, `videojs-vue/audio`, and `videojs-vue/ui` aggregate entries remain available, including their registration side effects.

| Use case                 | Import path                                                            | Exports                                                                   |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Video without a skin     | `videojs-vue/core`                                                     | `PlayerRoot`, `Video`, video types                                        |
| Video state and commands | `videojs-vue/composables`                                              | `usePlayerState`, `usePlayerActions`, handle/state/action types           |
| Audio without a skin     | `videojs-vue/audio/core`                                               | `AudioPlayerRoot`, `Audio`, audio types                                   |
| Audio state and commands | `videojs-vue/audio/composables`                                        | `useAudioPlayerState`, `useAudioPlayerActions`, handle/state/action types |
| Default video player     | `videojs-vue/video/default`                                            | `VideoPlayer`, video types, `VideoMediaComponent`                         |
| Neutral video player     | `videojs-vue/video/neutral`                                            | `VideoPlayer`, video types, `VideoMediaComponent`                         |
| Compat video player      | `videojs-vue/video/compat`                                             | `VideoPlayer`, video types, `VideoMediaComponent`                         |
| Compat video skin        | `videojs-vue/skins/compat`                                             | `CompatVideoSkin`                                                         |
| Default audio player     | `videojs-vue/audio/default`                                            | `AudioPlayer`, audio types, `AudioMediaComponent`                         |
| Neutral audio player     | `videojs-vue/audio/neutral`                                            | `AudioPlayer`, audio types, `AudioMediaComponent`                         |
| One video skin           | `videojs-vue/skins/default` or `videojs-vue/skins/neutral`             | `DefaultVideoSkin` or `NeutralVideoSkin`                                  |
| One audio skin           | `videojs-vue/audio/skins/default` or `videojs-vue/audio/skins/neutral` | `DefaultAudioSkin` or `NeutralAudioSkin`                                  |
| One control              | `videojs-vue/ui/play-button`, etc.                                     | The corresponding [UI component](../api/ui.md)                            |

The fixed player entries share the aggregate players' media props, events, exposed handles, slots, and lifecycle. Their optional `skin` prop accepts only the skin bound by that entry; omit it in normal use. To switch between default and neutral skins at runtime, use `VideoPlayer` from `videojs-vue` or `AudioPlayer` from `videojs-vue/audio`. These aggregate players load those two skins. Compat is available through its dedicated entries; see [Compat skin](./styling.md#compat-skin) for usage and browser requirements.

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VideoPlayer } from 'videojs-vue/video/default'
import type { PlayerHandle } from 'videojs-vue/core'
import { usePlayerState } from 'videojs-vue/composables'

const player = shallowRef<PlayerHandle | null>(null)
const paused = usePlayerState(state => state.paused, player)
</script>

<template>
  <VideoPlayer
    ref="player"
    src="/demo.mp4"
  />
  <p>Paused: {{ paused }}</p>
</template>
```

All entries share the same internal injection keys. Composables imported from their lightweight entry work under a root or complete player imported from any compatible video or audio entry.

## Optional downloads

HLS remains separate at `videojs-vue/media/hls`. A static import includes its engine in the initial dependency graph. Use `defineAsyncComponent(() => import('videojs-vue/media/hls').then(module => module.HlsVideo))` when it should load only when rendered; install the optional adapter dependency first.

Video skins and i18n can emit lazy locale chunks. Emitted files are not all initial downloads: the active locale determines which language pack loads at runtime. The size report separates initial static imports from asynchronous chunks.

## Reproduce measurements

From the repository root:

```sh
pnpm build
pnpm size
pnpm size:check
pnpm test:package
pnpm play:build
pnpm size:play
```

`size` bundles production consumers of the actual package exports in `dist`, includes upstream dependencies, externalizes Vue, and reports gzip bytes for the initial graph, asynchronous chunks, and their total. Full module and chunk graphs are written to `.cache/bundle-size/report.json`. It does not override dependency side-effect metadata.

`benchmarks/baseline.json` records the pre-optimization consumer measurements. `benchmarks/budgets.json` fixes per-scenario budgets with approximately 5% headroom. `size:check` also checks required registrations and rejects unwanted skins, audio/video dependencies, or HLS in lightweight entries. Budget changes need a measured explanation; they are not updated automatically.

The Compat entry measured 77,616 initial gzip bytes and 61,889 asynchronous gzip bytes (139,505 total) with `@videojs/html@10.0.1`, excluding Vue. Its new budget allows approximately 5% headroom. The dependency graph check requires Compat registration and excludes default/neutral skins; existing entry checks also reject accidental Compat imports.

`test:package` checks isolated entry registration, cross-entry injection, media binding, events, slots, KeepAlive, cleanup, and SSR. `size:play` follows the Vite manifest's static imports for the default page and confirms that audio, live video, custom controls, and HLS remain asynchronous. Unlike library measurements, the playground report includes Vue and the demo UI.

Live video has matching granular entries: `videojs-vue/live/core`, `videojs-vue/live/composables`, `videojs-vue/live/default`, and `videojs-vue/live/neutral`. Size checks verify that live imports exclude hls.js and on-demand presets, and that existing video/audio entries exclude the live preset. Live state selectors load no upstream runtime; the HLS engine is loaded only through `videojs-vue/media/hls`.

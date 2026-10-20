---
description: Live video players, skins, typed state, actions, and live-edge controls.
---

# Live video

Import live video APIs from `videojs-vue/live`. This preset uses Video.js 10's live video store and packaged live skins. HLS remains an optional adapter imported separately from `videojs-vue/media/hls`.

## LiveVideoPlayer

```vue
<script setup lang="ts">
import { LiveVideoPlayer } from 'videojs-vue/live'
import { HlsVideo } from 'videojs-vue/media/hls'
</script>

<template>
  <LiveVideoPlayer
    :media="HlsVideo"
    src="/live.m3u8"
    title="Live event"
  />
</template>
```

Shared props match [VideoPlayer](./video-player.md), except `playbackRate` is omitted. `media` defaults to `Video`; use a live-capable adapter such as `HlsVideo` to provide live-edge state. A plain native video element does not provide that state, even if its duration is infinite.

`skin` accepts `default` or `neutral`. Both skins replace the time slider and time displays with a Live button. Attributes and styles target the skin, and the `poster` and `thumbnail` slots follow the existing video skin contract.

The component forwards [media events](./events.md), emits `ready` with a `LiveVideoPlayerHandle`, and supports `v-model:volume` and `v-model:muted`. `ready` means the store is available; media metadata may still be loading.

## Composition and imports

| Entry                            | Exports                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `videojs-vue/live`               | `LiveVideoPlayer`, `LiveVideoPlayerRoot`, `DefaultLiveVideoSkin`, `NeutralLiveVideoSkin`, `LiveButton`, `Video`, live composables and types |
| `videojs-vue/live/core`          | `LiveVideoPlayerRoot`, `Video`, live types                                                                                                  |
| `videojs-vue/live/composables`   | `useLiveVideoPlayerState`, `useLiveVideoPlayerActions`, live types                                                                          |
| `videojs-vue/live/default`       | `LiveVideoPlayer` with only the default skin                                                                                                |
| `videojs-vue/live/neutral`       | `LiveVideoPlayer` with only the neutral skin                                                                                                |
| `videojs-vue/live/skins/default` | `DefaultLiveVideoSkin`                                                                                                                      |
| `videojs-vue/live/skins/neutral` | `NeutralLiveVideoSkin`                                                                                                                      |
| `videojs-vue/ui/live-button`     | `LiveButton`                                                                                                                                |

`LiveVideoPlayerRoot` accepts `title` and `poster`, and wraps composed media and controls in `<live-video-player>`. Root events match the high-level player. For structured HLS configuration, compose `HlsVideo` with its typed `source` prop; see the [live example](../examples/live.md).

The base, audio, and live entries stay independent. Live composables register no elements. Importing a live entry does not load hls.js.

## State and actions

```ts
import {
  useLiveVideoPlayerActions,
  useLiveVideoPlayerState,
} from 'videojs-vue/live/composables'
import type { LiveVideoPlayerHandle } from 'videojs-vue/live/core'
import { shallowRef } from 'vue'

const player = shallowRef<LiveVideoPlayerHandle | null>(null)
const liveEdgeStart = useLiveVideoPlayerState(
  state => state.liveEdgeStart,
  player,
)
const targetLiveWindow = useLiveVideoPlayerState(
  state => state.targetLiveWindow,
  player,
)
const seekable = useLiveVideoPlayerState(state => state.seekable, player)
const actions = useLiveVideoPlayerActions(player)
```

Omit the target inside `LiveVideoPlayerRoot` descendants to use its injected context. The selector reads the immutable upstream `LiveVideoPlayerState`; values become `undefined` while the target is unavailable. Selectors release their subscriptions on target changes, deactivation, and unmount.

| Field              | Meaning                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `liveEdgeStart`    | Position where the live edge begins; `NaN` when unavailable                                                                            |
| `targetLiveWindow` | `0` for a sliding live window, `Infinity` for an event retaining history, `NaN` for on-demand or unknown media; this is not a duration |
| `seekable`         | Available `[start, end]` pairs; bounds can move as a live window advances                                                              |

Check `targetLiveWindow` after readiness to identify live content. `duration` can be the finite seekable end even when the browser reports `Infinity`.

`LiveVideoPlayerActions` and `LiveVideoPlayerHandle` expose `play`, `pause`, `seek`, `setVolume`, `setMuted`, `requestFullscreen`, `exitFullscreen`, `requestPictureInPicture`, and `exitPictureInPicture`, with the upstream return types. The live preset omits playback speed, quality selection, and audio-track selection.

The handle also exposes `element`, `store`, and `media` getters. These return `null` while inactive or unmounted. Commands resolve the current store on every call, reject or throw when unavailable, and preserve original rejection causes. Fullscreen, PiP, and autoplay remain subject to browser policy.

## LiveButton

`LiveButton` wraps `<media-live-button>` and accepts `disabled` and `label` props, attributes, events, and default slot content. Without custom content, the upstream button supplies translated Live text.

The button reads the live, time, and buffer features together. When behind the edge, it seeks to the end of the latest available seekable range. It becomes disabled for non-live content or a missing finite seekable end, and inactive when already at the edge. The `data-live`, `data-live-edge`, and `data-disabled` attributes are available for styling.

Use it within `LiveVideoPlayerRoot` and a media container. The packaged live skins already include it. The wrapper delegates live-edge tolerance and accessibility behavior to the upstream button.

## Lifecycle and scope

SSR and KeepAlive follow the [shared lifecycle contract](../guide/lifecycle.md). Deactivation pauses playback and clears exposed getters; reactivation emits `ready` again without resuming playback automatically. The HLS adapter survives caching and is released on unmount.

This release provides basic live video with a return-to-live control. A dedicated DVR timeline, live audio preset, and automatic network recovery are separate work. The on-demand `TimeSlider` starts at zero and is unsuitable for a sliding live window whose start has advanced.

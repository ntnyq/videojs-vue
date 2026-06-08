# API

## Components

| Export                                  | Responsibility                                                 |
| --------------------------------------- | -------------------------------------------------------------- |
| `VideoPlayer`                           | Complete on-demand player with native media by default         |
| `PlayerRoot`                            | Upstream video preset, Vue context, media events and lifecycle |
| `Video`                                 | Native video, reactive props, tracks and media events          |
| `DefaultVideoSkin`, `NeutralVideoSkin`  | Upstream packaged skins                                        |
| `HlsVideo` from `videojs-vue/media/hls` | Optional hls.js media adapter                                  |

### VideoPlayer props

| Prop                              | Type / default                             |
| --------------------------------- | ------------------------------------------ |
| `src`, `poster`, `title`          | `string`                                   |
| `media`                           | `Video` (default) or `HlsVideo`            |
| `skin`                            | `'default'` (default), `'neutral'`         |
| `autoplay`, `loop`                | `boolean`, false                           |
| `playsinline`                     | `boolean`, true                            |
| `preload`                         | `'none'`, `'metadata'` (default), `'auto'` |
| `crossorigin`                     | `''`, `'anonymous'`, `'use-credentials'`   |
| `tracks`                          | readonly `MediaTrack[]`                    |
| `volume`, `muted`, `playbackRate` | Optional settings with `update:*` events   |

`Video` and `HlsVideo` accept the media props; `HlsVideo` additionally accepts a typed upstream `HlsSource` via `source`. Replace the source object to update configuration; avoid specifying both `src` and `source.src`. `PlayerRoot` accepts `title` and `poster`. Its attrs target `video-player`; media attrs belong on the media component. Skin attrs target the skin element. UI component attrs and listeners target their upstream element.

`MediaTrack`: `src`, optional `kind`, `srclang`, `label`, `default`. Keys combine kind, source and language so replacement updates native tracks.

### Events

`VideoPlayer` and `PlayerRoot` emit `ready(handle)`, `update:volume(number)`, `update:muted(boolean)`, and `update:playbackRate(number)`.

They also forward these original media events, as do `Video` and `HlsVideo`:

`abort`, `canplay`, `canplaythrough`, `durationchange`, `emptied`, `ended`, `error`, `loadeddata`, `loadedmetadata`, `loadstart`, `pause`, `play`, `playing`, `progress`, `ratechange`, `seeked`, `seeking`, `stalled`, `suspend`, `timeupdate`, `volumechange`, `waiting`, `enterpictureinpicture`, `leavepictureinpicture`.

There is no whole-state change event. Subscribe to the fields your UI needs.

## State and actions

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { VideoPlayer, usePlayerState, usePlayerActions } from 'videojs-vue'
import type { PlayerHandle } from 'videojs-vue'

const player = useTemplateRef<PlayerHandle>('player')
const paused = usePlayerState(state => state.paused, player)
const actions = usePlayerActions(player)
</script>

<template>
  <VideoPlayer
    ref="player"
    src="/demo.mp4"
  />
  <p>
    {{ paused === undefined ? 'Not ready' : paused ? 'Paused' : 'Playing' }}
  </p>
</template>
```

`usePlayerState(selector, target?)` returns a readonly computed ref. Its selection updates only when `Object.is` detects a change. Primitive selectors are recommended; object selectors should keep a stable reference when their selected fields have not changed. The state is the upstream snapshot. Ref/store replacement and scope disposal clean up old subscriptions.

`usePlayerActions(target?)` and the exposed component ref provide:

| Action                                                | Result                              |
| ----------------------------------------------------- | ----------------------------------- |
| `play()`                                              | `Promise<void>`                     |
| `pause()`                                             | `void`                              |
| `seek(seconds)`                                       | `Promise<number>` (actual position) |
| `setVolume(volume)`                                   | `number`                            |
| `setMuted(muted)`                                     | `boolean`                           |
| `setPlaybackRate(rate)`                               | `void`                              |
| `requestFullscreen()`, `exitFullscreen()`             | `Promise<void>`                     |
| `requestPictureInPicture()`, `exitPictureInPicture()` | `Promise<void>`                     |

Refs expose advanced live getters `element`, `store`, and `media`, each null when inactive. `store` is the Video.js video preset store. `media` is a common media surface; narrow to an adapter element when using adapter-specific APIs.

## UI entry

Import controls from `videojs-vue/ui`:

`MediaContainer`, `MediaControls`, `MediaControlsContent`, `MediaControlsGroup`, `PlayButton`, `MuteButton`, `FullscreenButton`, `PiPButton`, `CaptionsButton`, `SeekButton`, `Time`, `TimeSlider`, `VolumeSlider`, `SliderTrack`, `SliderBuffer`, `SliderFill`, `SliderThumb`, `Poster`, `Hotkey`, `StatusAnnouncer`.

Buttons accept `disabled` and `label`. `SeekButton` adds `seconds`. `Time` accepts `type`, `toggle`, `negativeSign`, and `label`. Sliders accept `disabled`, `label`, `step`, `largeStep`, and `orientation`; `TimeSlider` adds `pauseOnDrag` and `changeThrottle`. `MediaControls` accepts `visibility`. `Hotkey` accepts `keys`, `action`, `value`, `disabled`, and `target` using upstream types.

Control events and default slots are passed to the upstream element. For example, `@drag-start` / `@drag-end` on `TimeSlider` preserve its native custom events. See [official control documentation](https://videojs.org/docs/framework/html/guides/ui-components) for state attributes and styling.

---
description: AudioPlayer, AudioPlayerRoot, Audio, skins, and audio composables.
---

See [bundle size and imports](../guide/bundle-size.md) for lightweight core/composable entries, fixed skins, and individual controls. Existing aggregate imports remain supported.

# Audio players

```ts
import {
  AudioPlayer,
  AudioPlayerRoot,
  Audio,
  DefaultAudioSkin,
  NeutralAudioSkin,
  useAudioPlayerState,
  useAudioPlayerActions,
} from 'videojs-vue/audio'
```

The audio entry registers the upstream audio preset and both audio skins. It does not import the video preset, video skins, or an HLS engine. Native audio formats depend on browser codec support. No additional dependency is required.

## AudioPlayer

A complete on-demand audio player built from `AudioPlayerRoot`, a skin, and `Audio`.

| Prop           | Type                                     | Default      | Description                                                           |
| -------------- | ---------------------------------------- | ------------ | --------------------------------------------------------------------- |
| `src`          | `string`                                 | `undefined`  | Audio URL.                                                            |
| `title`        | `string`                                 | `undefined`  | Player metadata, mapped to `content-title`.                           |
| `poster`       | `string`                                 | `undefined`  | Cover URL for player metadata; not applied to native audio.           |
| `skin`         | `'default' \| 'neutral'`                 | `'default'`  | Audio skin.                                                           |
| `media`        | `AudioMediaComponent`                    | `Audio`      | Component implementing the Audio props, events, and context contract. |
| `autoplay`     | `boolean`                                | `false`      | Request autoplay, subject to browser policy.                          |
| `loop`         | `boolean`                                | `false`      | Repeat playback.                                                      |
| `preload`      | `'none' \| 'metadata' \| 'auto'`         | `'metadata'` | Native preload hint.                                                  |
| `crossorigin`  | `'' \| 'anonymous' \| 'use-credentials'` | `undefined`  | Media CORS mode.                                                      |
| `tracks`       | `readonly MediaTrack[]`                  | `undefined`  | Native track children, such as chapters or metadata.                  |
| `volume`       | `number`                                 | `undefined`  | Optional volume, clamped to 0–1.                                      |
| `muted`        | `boolean`                                | `undefined`  | Optional mute setting.                                                |
| `playbackRate` | `number`                                 | `undefined`  | Optional positive, finite playback rate.                              |

Use `v-model:volume`, `v-model:muted`, and `v-model:playback-rate` for confirmed setting updates. `undefined` leaves a setting under player control.

The default slot is forwarded to `Audio`, for example for native `<source>` children. The `poster` slot is forwarded to the skin. Other fallthrough attributes and listeners target the skin; use composition to set native audio attributes such as `controls`.

Audio skins use `display: block` and `width: 100%`, with natural height. They do not impose a video aspect ratio.

## AudioPlayerRoot and Audio

`AudioPlayerRoot` renders `<audio-player>`, accepts `title` and `poster`, and provides audio context to descendants. Its default slot contains the skin or custom layout. Attributes target the root. Each root must contain exactly one media component.

`Audio` renders native `<audio>`. It accepts the shared media props above, excluding `title`, `poster`, `skin`, and `media`. It has no `playsinline` prop. Its default slot and fallthrough attributes target the native media element. Its component ref exposes `element`.

`DefaultAudioSkin` and `NeutralAudioSkin` render `<audio-skin>` and `<audio-neutral-skin>`. They accept default media content and a `poster` slot, and forward attributes to the skin. They require an ancestor `AudioPlayerRoot`.

## Events and lifecycle

Both player components emit `ready(handle)`, the three setting updates, and original native [media events](./events.md#media-events). Audio does not generate video picture-in-picture events. `Audio` forwards native events both to its own listeners and its root.

`ready` means the store is available, not that metadata has loaded. Within Vue `KeepAlive`, deactivation pauses playback, detaches media listeners, and clears the exposed getters. Reactivation reconnects and emits `ready` again without automatically resuming playback. Unmounting pauses the media and releases subscriptions and listeners. Imports and initial markup are SSR-safe.

## State, actions, and types

`useAudioPlayerState(selector, target?)` returns a readonly computed selection from `AudioPlayerState`, or `undefined` while unavailable. `useAudioPlayerActions(target?)` resolves the active store on every call. Pass a ref/getter/handle, or omit the target in a descendant of `AudioPlayerRoot`. Video composables continue to use video context.

`AudioPlayerHandle` exposes live `element`, `store`, and `media` getters plus these actions:

| Action                   | Return          |
| ------------------------ | --------------- |
| `play()`                 | `Promise<void>` |
| `pause()`                | `void`          |
| `seek(seconds)`          | `Promise<void>` |
| `setVolume(value)`       | `void`          |
| `setMuted(value)`        | `void`          |
| `setPlaybackRate(value)` | `void`          |

There are no fullscreen or picture-in-picture actions. Unavailable actions fail immediately or reject, and are never queued. Playback failures preserve the original rejection reason.

The entry exports `AudioPlayerHandle`, `AudioPlayerActions`, `AudioPlayerStore`, `AudioPlayerState`, `AudioPlayerElement`, `AudioPlayerTarget`, `AudioMediaComponent`, `AudioMediaProps`, `MediaEventName`, `MediaTrack`, and `PlayerMedia`. Audio store and state types follow the upstream audio preset.

See the [audio example](../examples/audio.md) for complete usage.

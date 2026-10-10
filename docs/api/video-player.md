---
description: VideoPlayer props, defaults, slots, attribute forwarding, events, and exposed handle.
---

See [bundle size and imports](../guide/bundle-size.md) for lightweight core/composable entries, fixed skins, and individual controls. Existing aggregate imports remain supported.

# VideoPlayer

A complete on-demand player with a media adapter and packaged skin.

```ts
import { VideoPlayer } from 'videojs-vue'
```

## Props

All props are optional. Provide a media source to play video.

| Prop           | Type                                     | Default      | Description                                           |
| -------------- | ---------------------------------------- | ------------ | ----------------------------------------------------- |
| `src`          | `string`                                 | `undefined`  | Media URL.                                            |
| `poster`       | `string`                                 | `undefined`  | Poster URL, passed to the player and media.           |
| `title`        | `string`                                 | `undefined`  | Player metadata title, mapped to `content-title`.     |
| `media`        | `VideoMediaComponent`                    | `Video`      | Media component; use `HlsVideo` for HLS.              |
| `skin`         | `'default' \| 'neutral'`                 | `'default'`  | Packaged skin.                                        |
| `autoplay`     | `boolean`                                | `false`      | Request autoplay, subject to browser policy.          |
| `loop`         | `boolean`                                | `false`      | Repeat playback.                                      |
| `playsinline`  | `boolean`                                | `true`       | Request inline playback.                              |
| `preload`      | `'none' \| 'metadata' \| 'auto'`         | `'metadata'` | Media preload hint.                                   |
| `crossorigin`  | `'' \| 'anonymous' \| 'use-credentials'` | `undefined`  | Media CORS mode.                                      |
| `tracks`       | `readonly MediaTrack[]`                  | `undefined`  | Text tracks; see [MediaTrack](./media.md#mediatrack). |
| `volume`       | `number`                                 | `undefined`  | Optional volume setting, clamped to 0–1.              |
| `muted`        | `boolean`                                | `undefined`  | Optional mute setting.                                |
| `playbackRate` | `number`                                 | `undefined`  | Optional positive, finite playback rate.              |

`undefined` settings leave the media setting under player control. Bind `v-model:volume`, `v-model:muted`, or `v-model:playback-rate` to receive confirmed updates; see [two-way settings](../guide/getting-started.md#two-way-settings).

`VideoPlayer` forwards only the shared media props to its adapter. For HLS `source` configuration or additional media attributes, use [PlayerRoot with HlsVideo](../examples/hls.md#adapter-configuration).

## Events

Emits `ready(handle)`, `update:volume(number)`, `update:muted(boolean)`, `update:playbackRate(number)`, and the [forwarded media events](./events.md#media-events).

`ready` indicates that the store is available. It does not indicate that the video is buffered or its metadata has loaded.

## Slots

| Slot        | Content                                                            |
| ----------- | ------------------------------------------------------------------ |
| `poster`    | Custom poster content, assigned to the skin's `poster` slot.       |
| `thumbnail` | Custom thumbnail content, assigned to the skin's `thumbnail` slot. |

Named slot content is forwarded without slot props. `VideoPlayer` does not render a user-provided default slot or arbitrary controls/overlay slots. Use [composition](../guide/composition.md) for those layouts.

## Attributes and styling

Fallthrough attributes and listeners target the skin element, not the media or outer player element. Both skins default to `display: block`, `width: 100%`, and `aspect-ratio: 16 / 9`. Supplied styles can override these defaults.

See [skins and styling](../guide/styling.md) for examples.

## Exposed ref

The component exposes a [PlayerHandle](./composables.md#playerhandle): player actions and live `element`, `store`, and `media` getters. These getters return `null` while the player is unavailable or inactive.

---
description: Shared media props, native Video, optional HlsVideo configuration, and text track types.
---

# Media adapters

Media adapters connect a media element to the nearest player root: `VideoPlayerRoot`, `AudioPlayerRoot`, or `LiveVideoPlayerRoot`. Each root must contain exactly one adapter.

## Video

```ts
import { Video } from 'videojs-vue'
```

Renders a native `<video>` element. Accepts the [shared media props](./video-player.md#props): `src`, `poster`, `autoplay`, `loop`, `playsinline`, `preload`, `crossorigin`, `tracks`, `volume`, `muted`, and `playbackRate`, with the same defaults as `VideoPlayer`.

`title`, `media`, and `skin` are not media props. Additional attributes and listeners target the media element.

## HlsVideo

Install the optional dependency before importing this entry:

```sh
pnpm add @videojs/hlsjs-video@10.0.1
```

```ts
import { HlsVideo } from 'videojs-vue/media/hls'
import type { HlsSource, HlsEngineConfig } from 'videojs-vue/media/hls'
```

Renders the upstream `hlsjs-video` element. Accepts the same shared media props as `Video`, plus:

| Prop     | Type        | Default     | Description                                                |
| -------- | ----------- | ----------- | ---------------------------------------------------------- |
| `source` | `HlsSource` | `undefined` | Source URL, playback preference, and engine configuration. |

The wrapper assigns `source` as a DOM property. Replace the source object when updating configuration. Avoid specifying both `src` and `source.src`.

Use `:media="HlsVideo"` on `VideoPlayer` for a URL-only source. Use composition for `source` options; see the [HLS example](../examples/hls.md).

## Slots, events, and refs

Both adapters render `tracks` first, followed by their default slot. The slot can contain native media children such as `<track>` elements. Do not duplicate the same track through both mechanisms.

Both emit the original [media events](./events.md#media-events). `ready` and `update:*` setting events belong to `VideoPlayerRoot` and `VideoPlayer`, not the media components.

A media component ref exposes an `element` getter for its underlying media element. Use the root's `VideoPlayerHandle` for store access, actions, and active lifecycle state.

## MediaTrack

```ts
import type { MediaTrack } from 'videojs-vue'
```

| Field     | Type                                                                      | Required | Description                                        |
| --------- | ------------------------------------------------------------------------- | -------- | -------------------------------------------------- |
| `src`     | `string`                                                                  | Yes      | Text track URL.                                    |
| `kind`    | `'subtitles' \| 'captions' \| 'descriptions' \| 'chapters' \| 'metadata'` | No       | Native track kind.                                 |
| `srclang` | `string`                                                                  | No       | Track language tag.                                |
| `label`   | `string`                                                                  | No       | User-visible track label.                          |
| `default` | `boolean`                                                                 | No       | Mark the track as the default selection candidate. |

Track keys combine `kind`, `src`, and `srclang`; replacing these fields replaces the native track node. Use WebVTT for caption files and see the [native video example](../examples/basic-video.md).

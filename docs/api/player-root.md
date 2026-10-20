---
description: VideoPlayerRoot context, props, slots, and packaged skin components for composed players.
---

See [bundle size and imports](../guide/bundle-size.md) for lightweight core/composable entries, fixed skins, and individual controls. Existing aggregate imports remain supported.

# VideoPlayerRoot and skins

Use these components to choose the media adapter and control layout explicitly.

```ts
import {
  VideoPlayerRoot,
  DefaultVideoSkin,
  NeutralVideoSkin,
} from 'videojs-vue'
```

## VideoPlayerRoot

Renders the upstream `video-player` element and provides the player context to descendants. Render exactly one `Video` or `HlsVideo` inside each root.

### Props

| Prop     | Type     | Default     | Description                                       |
| -------- | -------- | ----------- | ------------------------------------------------- |
| `title`  | `string` | `undefined` | Player metadata title, mapped to `content-title`. |
| `poster` | `string` | `undefined` | Poster URL for the player store.                  |

Media props such as `src`, `volume`, and `autoplay` belong on the media component.

### Slots and attributes

The default slot contains the skin or composed interface. There are no scoped slot props. Fallthrough attributes and listeners target `video-player`.

### Events and ref

Emits the same [player events](./events.md) as `VideoPlayer` and exposes the same [VideoPlayerHandle](./composables.md#videoplayerhandle).

Call composables without an explicit target only from a descendant component's setup. The component that renders `VideoPlayerRoot` must pass a ref target, because the root's provided context is not available to its parent.

## DefaultVideoSkin and NeutralVideoSkin

These components render `video-skin` and `video-neutral-skin`, respectively. Required custom element registration and packaged styles are included. They do not create their own player context.

| Slot        | Content                                            |
| ----------- | -------------------------------------------------- |
| `default`   | The media component.                               |
| `poster`    | Content assigned to the upstream `poster` slot.    |
| `thumbnail` | Content assigned to the upstream `thumbnail` slot. |

There are no declared Vue props or scoped slot props. Attributes and listeners target the skin element. Default styles are `display: block`, `width: 100%`, and `aspect-ratio: 16 / 9`.

```vue
<script setup lang="ts">
import { VideoPlayerRoot, NeutralVideoSkin, Video } from 'videojs-vue'
</script>

<template>
  <VideoPlayerRoot
    title="Lesson"
    poster="/poster.webp"
  >
    <NeutralVideoSkin>
      <Video
        src="/lesson.mp4"
        poster="/poster.webp"
      />
    </NeutralVideoSkin>
  </VideoPlayerRoot>
</template>
```

Continue with [composition](../guide/composition.md) for a custom interface or [skins and styling](../guide/styling.md) for sizing and poster slots.

## LegacyVideoSkin

Import `LegacyVideoSkin` from `videojs-vue/video/skins/legacy` and its stylesheet from `videojs-vue/video/skins/legacy.css`. It requires a surrounding `VideoPlayerRoot` and renders a fullscreen `media-container` with light-DOM controls. Attributes and listeners target that container, with the same default 16:9 sizing as the other skins.

The default slot contains one media component. The `poster` slot provides an overlay until playback starts; the `thumbnail` slot is not implemented. It accepts no additional Vue props. See [legacy mode](../guide/legacy.md) for the required polyfills, consumer build target, controls, and browser validation limits.

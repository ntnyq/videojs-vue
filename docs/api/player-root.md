---
description: PlayerRoot context, props, slots, and packaged skin components for composed players.
---

See [bundle size and imports](../guide/bundle-size.md) for lightweight core/composable entries, fixed skins, and individual controls. Existing aggregate imports remain supported.

# PlayerRoot and skins

Use these components to choose the media adapter and control layout explicitly.

```ts
import { PlayerRoot, DefaultVideoSkin, NeutralVideoSkin } from 'videojs-vue'
```

## PlayerRoot

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

Emits the same [player events](./events.md) as `VideoPlayer` and exposes the same [PlayerHandle](./composables.md#playerhandle).

Call composables without an explicit target only from a descendant component's setup. The component that renders `PlayerRoot` must pass a ref target, because the root's provided context is not available to its parent.

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
import { PlayerRoot, NeutralVideoSkin, Video } from 'videojs-vue'
</script>

<template>
  <PlayerRoot
    title="Lesson"
    poster="/poster.webp"
  >
    <NeutralVideoSkin>
      <Video
        src="/lesson.mp4"
        poster="/poster.webp"
      />
    </NeutralVideoSkin>
  </PlayerRoot>
</template>
```

Continue with [composition](../guide/composition.md) for a custom interface or [skins and styling](../guide/styling.md) for sizing and poster slots.

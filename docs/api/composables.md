---
description: Reactive player selectors, action methods, target resolution, and the exposed PlayerHandle.
---

See [bundle size and imports](../guide/bundle-size.md) for lightweight core/composable entries, fixed skins, and individual controls. Existing aggregate imports remain supported.

# Composables and handles

```ts
import { usePlayerState, usePlayerActions } from 'videojs-vue'
import type { PlayerHandle, PlayerTarget } from 'videojs-vue'
```

Call composables during component setup or within an active Vue effect scope so Vue can dispose their subscriptions.

## PlayerTarget

```ts
type PlayerTarget = MaybeRefOrGetter<PlayerHandle | null | undefined>
```

Both composables accept an optional target:

- Omit it to use context from the nearest ancestor `PlayerRoot`.
- Pass a component ref or reactive getter to follow a player outside that context.
- Pass a handle directly when the target does not change.

Omitting the target without an ancestor root throws a descriptive context error during setup. An explicit ref or getter may return `null` or `undefined` while the player is unavailable.

## usePlayerState

```ts
function usePlayerState<Selected>(
  selector: (state: PlayerState) => Selected,
  target?: PlayerTarget,
): ComputedRef<Selected | undefined>
```

Returns a readonly computed ref selecting a value from the upstream store snapshot. The value is `undefined` before readiness, during deactivation, or when no target exists.

The selector runs when the store updates. Consumers are notified only when `Object.is` detects a changed selection. Prefer primitive selections; object selections should preserve their reference when the selected fields have not changed. Do not mutate the upstream snapshot.

Subscriptions follow reactive target/store replacement. Old subscriptions are removed on replacement, deactivation, or scope disposal.

## usePlayerActions

```ts
function usePlayerActions(target?: PlayerTarget): PlayerActions
```

Returns actions that resolve the current store on every call. The same methods are exposed on `PlayerHandle`.

| Method                      | Return type       | Purpose                                    |
| --------------------------- | ----------------- | ------------------------------------------ |
| `play()`                    | `Promise<void>`   | Request playback.                          |
| `pause()`                   | `void`            | Pause playback.                            |
| `seek(seconds)`             | `Promise<number>` | Seek and resolve with the actual position. |
| `setVolume(volume)`         | `number`          | Set volume through the upstream store.     |
| `setMuted(muted)`           | `boolean`         | Set the mute state.                        |
| `setPlaybackRate(rate)`     | `void`            | Set playback speed.                        |
| `selectVideoRendition(id)`  | `void`            | Select a rendition ID or `"auto"` for ABR. |
| `selectAudioTrack(id)`      | `void`            | Select an alternate audio track by ID.     |
| `requestFullscreen()`       | `Promise<void>`   | Request fullscreen.                        |
| `exitFullscreen()`          | `Promise<void>`   | Exit fullscreen.                           |
| `requestPictureInPicture()` | `Promise<void>`   | Request picture-in-picture.                |
| `exitPictureInPicture()`    | `Promise<void>`   | Exit picture-in-picture.                   |

Commands are never queued. If the player is unavailable, asynchronous methods reject and synchronous methods throw. Upstream failures retain their original rejection reason or thrown error. Browser policy and capability checks still apply.

Actions delegate directly to Video.js. The shared media props' normalization rules are not an additional validation layer for action arguments. For example, the upstream volume action can unmute media; set mute explicitly when your application needs to preserve it.

For video quality and alternate audio, select `videoRenditionList`, `activeVideoRendition`, and `audioTrackList` with `usePlayerState`. Renditions use `selected` for manual selection; tracks use `enabled`. IDs are source-specific. Unknown IDs and unsupported capabilities follow upstream no-op behavior. See [quality and audio selection](../examples/media-selection.md) for complete examples.

## PlayerHandle

`VideoPlayer` and `PlayerRoot` expose a `PlayerHandle` through their component refs and `ready` event.

| Getter    | Type                    | Meaning                                            |
| --------- | ----------------------- | -------------------------------------------------- |
| `element` | `PlayerElement \| null` | Active upstream player element.                    |
| `store`   | `PlayerStore \| null`   | Video.js video preset store.                       |
| `media`   | `PlayerMedia \| null`   | Registered media element while the root is active. |

These are live getters. Access them when needed instead of storing a destructured value across lifecycle changes. They return `null` when inactive or unmounted. Use selectors for reactive UI and narrow `media` to an adapter element before accessing adapter-specific APIs.

See the [state and actions guide](../guide/state-and-actions.md) for a complete ref-based example and [lifecycle](../guide/lifecycle.md) for readiness and cleanup.

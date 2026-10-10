---
description: Player readiness, cleanup, KeepAlive behavior, server rendering, and error boundaries.
---

# Lifecycle and SSR

The wrapper owns Vue subscriptions and event forwarding. Video.js owns the player store and media capabilities. Use the exposed handle only while the player is active.

## Readiness

`ready` means the player element and its store are available. It does not mean media metadata or playable data has loaded. Listen for `loadedmetadata` or `canplay` for those milestones.

| Lifecycle state          | Handle getters                               | Selectors                      | Actions               |
| ------------------------ | -------------------------------------------- | ------------------------------ | --------------------- |
| Before ready             | `null` when a handle exists                  | `undefined`                    | Reject or throw.      |
| Active                   | Current element, store, and registered media | Current selected value         | Delegate to Video.js. |
| Deactivated or unmounted | `null`                                       | `undefined` for live selectors | Reject or throw.      |

Async commands reject when unavailable; synchronous commands throw. Commands are never queued. A later mount cannot replay an old play or fullscreen request. The wrapper preserves original command failures.

## Cleanup and KeepAlive

Unmounting pauses media, disconnects event listeners, releases Vue subscriptions, and lets upstream elements dispose their resources. Each root owns its own context.

KeepAlive deactivation pauses media and clears the available store, releasing selector subscriptions. Reactivation reconnects to the current upstream store and emits `ready` again. Playback does not resume automatically. The HLS adapter is retained across KeepAlive deactivation and released on actual unmount.

Player roots and controls, including those inside packaged skin shadow roots, are also retained while cached. They are disposed when the cache entry is evicted or its owner unmounts. Controls removed from an active player's tree are disposed independently.

Explicit refs and getter targets can change at runtime. Subscriptions follow the new store, and actions resolve their target on every call.

## Source and adapter changes

Changing `src` uses upstream loading and reset behavior. Switching the media component disconnects the old adapter. The wrapper does not keep a separate cache of playback position or duration.

Replace an HLS `source` object to update its configuration; see [HLS](../examples/hls.md#adapter-configuration).

## Server rendering

Imports are safe on the server through upstream registration guards. Vue renders player, skin, media, and track markup; custom elements upgrade in the browser. The library does not create a global player instance.

Access browser-only APIs after mounting or `ready`. Keep server and client props consistent for hydration. For translated controls, see [internationalization and SSR](./internationalization.md#server-rendering).

## Nuxt

Import the same components into Vue SFCs without custom compiler tag configuration. Nuxt's `ClientOnly` can be used when your application deliberately requires client-only rendering; it is not required for the wrapper's server import safety.

## Error boundaries

| Failure                                    | Where to handle it                                      |
| ------------------------------------------ | ------------------------------------------------------- |
| Media loading or decoding                  | The media `error` event; inspect `player.media?.error`. |
| Playback, seek, fullscreen, or PiP command | Catch the action's rejection or thrown error.           |
| Optional adapter module import             | The application's module-loading boundary.              |

Module import failures do not become media events. Actual codec support, HLS, captions, keyboard interaction, fullscreen, and PiP need browser verification; unit tests cannot establish media availability on every device.

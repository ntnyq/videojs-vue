# Lifecycle and SSR

Imports are safe on the server: upstream registration entries provide their SSR guards. Vue renders the player, skin, media and track markup on the server; custom elements upgrade in the browser. No global player instance is created by this library.

`ready` means the element and its store are available. It does not mean media metadata or playable data has loaded. Listen for `loadedmetadata` or `canplay` for those milestones.

Selectors return `undefined` before the target is ready. Async commands reject when unavailable, while synchronous commands throw. Commands are never queued, so a later mount cannot replay an old play or fullscreen request. Playback, seek, fullscreen and PiP keep the upstream promise and original rejection reason.

## Cleanup and KeepAlive

Unmounting pauses media, disconnects event listeners, releases Vue subscriptions, and lets the upstream elements dispose their resources. Each Root owns its own context.

KeepAlive deactivation pauses media and clears the available store, releasing selector subscriptions. Reactivation reconnects to the current upstream store and emits `ready` again. Playback does not resume automatically. Explicit component refs and getter targets can change at runtime; subscriptions follow the new store.

Changing `src` uses upstream media loading and reset behavior. Switching the media component disconnects the old adapter. The wrapper does not keep an extra cache of time or duration.

## Nuxt

The same components can be imported into Vue SFCs without custom compiler tag configuration. Access browser APIs only after `ready` or mounting. If your app deliberately uses client-only rendering, put the player in Nuxt's `ClientOnly`; it is not required for the wrapper's own server import safety.

## Error boundaries

- `error` forwards the original media event; inspect `player.media?.error` for details.
- Failed actions reject or throw their original cause; callers should handle them.
- Optional adapter module import failures happen at the application's module-loading boundary. Handle dynamic import failures there; the wrapper does not turn them into fake media events.

Use browser tests for actual codecs, HLS, captions, keyboard controls, fullscreen and PiP. Unit tests cannot guarantee browser media availability.

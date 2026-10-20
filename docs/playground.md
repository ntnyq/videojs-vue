---
description: Explore the hosted videojs-vue playground and its interactive playback scenarios.
---

# Playground

[Open the Playground](https://videojs-vue-playground.ntnyq.dev) to try the library without setting up a local project.

## What to try

| Scenario             | What it demonstrates                                                  |
| -------------------- | --------------------------------------------------------------------- |
| Native video         | Default and neutral skins, captions, and settings.                    |
| HLS                  | Playback through the optional `HlsVideo` adapter.                     |
| Internationalization | English and Simplified Chinese labels, including custom control text. |
| Composed controls    | Keyboard shortcuts, a seek slider, and an in-container overlay.       |
| Reactive settings    | Source, volume, mute, and speed updates alongside actual store state. |
| Lifecycle            | Play, pause, seek, unmount, and remount.                              |
| Events and failures  | Media events and command errors beside the player.                    |

Playback depends on the browser's media capabilities and the availability of demo URLs.

## Related documentation

- [Native video example](./examples/basic-video.md)
- [HLS example](./examples/hls.md)
- [Compose a player](./guide/composition.md)
- [State and actions](./guide/state-and-actions.md)

To run the playground locally or contribute a scenario, see [local development](./contributing.md#local-development).

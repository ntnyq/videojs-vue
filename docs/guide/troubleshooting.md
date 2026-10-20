---
description: Diagnose context errors, unavailable players, HLS setup, captions, styling, and locale overrides.
---

# Troubleshooting

Start by reproducing the issue in the [Playground](https://videojs-vue-playground.vercel.app), then compare your component structure and configuration with the examples.

## “Use this composable inside VideoPlayerRoot or pass a player ref”

The calling component has no injected player context. Move the composable into a descendant component, or pass a template ref as its target. The setup that renders `VideoPlayerRoot` cannot inject that root's context.

See [state and actions](./state-and-actions.md).

## “Player is not ready or is inactive”

An action ran before readiness, after unmount, or during KeepAlive deactivation. Disable action controls while a selector is `undefined`, or wait for `ready`. Commands are not queued for the next activation.

See [lifecycle](./lifecycle.md).

## Playback does not start

Check the media URL and network response, then inspect `player.media?.error`. Handle rejected `play()` calls separately. A mounted player can be ready before media data is available, and the browser can reject autoplay or unsupported media.

Try playback from a user-initiated button. See [events](../api/events.md) to distinguish store readiness from media readiness.

## HLS dependency or configuration errors

Install `@videojs/hlsjs-video@10.0.1`, then import `HlsVideo` from `videojs-vue/media/hls`. For a simple URL, pass it as `VideoPlayer`'s `media` prop. For engine options, place `HlsVideo :source="source"` inside `VideoPlayerRoot` and a skin.

A `source` attribute on `VideoPlayer` reaches the skin, not the media adapter. See the [HLS example](../examples/hls.md).

## Captions do not appear

Check that the WebVTT file loads, its language and label are correct, and the selected track contains cues for the current time. Cross-origin media and tracks need compatible server CORS headers; setting `crossorigin` alone does not grant access.

See the [native video example](../examples/basic-video.md#add-captions).

## Styles or overlays target the wrong element

`VideoPlayer` forwards attributes to its skin. Put media attributes on `Video` or `HlsVideo` in composition mode. To override the packaged aspect ratio, pass an inline `style`.

Place overlays inside `MediaContainer` to keep them within fullscreen. See [skins and styling](./styling.md).

## Partial translations disappear after a locale change

Import the full locale pack before calling `registerI18n` with overrides. Registering any translations for a locale prevents automatic loading of that pack. Also ensure teleported content remains inside the intended provider's DOM region.

See [register translations once](./internationalization.md#register-translations-once).

## Report an issue

Include your package versions, browser, source/adapter type, a minimal reproduction, and the original error or rejected action. Report Vue binding issues in [videojs-vue issues](https://github.com/ntnyq/videojs-vue/issues). The [contributing guide](../contributing.md) explains local development and validation.

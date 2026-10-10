---
description: Public package entries, components, composables, and types exported by videojs-vue.
---

See [bundle size and imports](../guide/bundle-size.md) for lightweight core/composable entries, fixed skins, and individual controls. Existing aggregate imports remain supported.

# API overview

Use the entries below as the public package interface. All components register their required upstream custom elements automatically.

## Package entries

| Import                  | Runtime exports                                                                                                                   | Reference                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `videojs-vue`           | `VideoPlayer`, `PlayerRoot`, `Video`, `DefaultVideoSkin`, `NeutralVideoSkin`, `usePlayerState`, `usePlayerActions`                | [Player](./video-player.md), [composition](./player-root.md), [media](./media.md), [composables](./composables.md) |
| `videojs-vue/audio`     | `AudioPlayer`, `AudioPlayerRoot`, `Audio`, `DefaultAudioSkin`, `NeutralAudioSkin`, `useAudioPlayerState`, `useAudioPlayerActions` | [Audio players](./audio.md)                                                                                        |
| `videojs-vue/media/hls` | `HlsVideo`                                                                                                                        | [Media adapters](./media.md#hlsvideo)                                                                              |
| `videojs-vue/ui`        | Layout, buttons, sliders, poster, hotkeys, and status announcer                                                                   | [UI controls](./ui.md)                                                                                             |
| `videojs-vue/i18n`      | `MediaI18n`, `MediaText`, and translation registry functions                                                                      | [Internationalization](./i18n.md)                                                                                  |

The base entry does not import hls.js. Install `@videojs/hlsjs-video@10.0.1` before importing the HLS entry.

## Components

Use [VideoPlayer](./video-player.md) for a complete player. Use [PlayerRoot and skins](./player-root.md) with a [media adapter](./media.md) when composing a player. Each root must contain exactly one media component.

## Events

[Player events](./events.md) documents `ready`, two-way setting updates, and the complete list of forwarded media events. UI controls pass listeners to their underlying custom elements.

## State and actions

[Composables and handles](./composables.md) documents selectors, action return types, player targets, and exposed refs. For a complete application example, see the [state and actions guide](../guide/state-and-actions.md).

## UI entry

[UI controls](./ui.md) lists every exported control and the properties supported by its Vue binding. See [composition](../guide/composition.md) for layout and styling.

## i18n entry

[Internationalization API](./i18n.md) covers provider and text props, slots, and registry exports. See the [internationalization guide](../guide/internationalization.md) for locale setup.

## Type exports

| Entry                   | Exported types                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `videojs-vue`           | `VideoMediaComponent`, `MediaEventName`, `MediaProps`, `MediaTrack`, `PlayerActions`, `PlayerHandle`, `PlayerElement`, `PlayerMedia`, `PlayerState`, `PlayerStore`, `PlayerTarget` |
| `videojs-vue/media/hls` | `HlsSource`, `HlsEngineConfig`                                                                                                                                                     |
| `videojs-vue/i18n`      | `Translations`, `FlatTranslations`, `Locale`                                                                                                                                       |

`PlayerStore` and `PlayerState` follow the upstream Video.js video preset. `PlayerMedia` describes the common native and adapter media surface; narrow the element type before using adapter-specific APIs.

Audio types are exported separately from `videojs-vue/audio`; see [audio types and handles](./audio.md#state-actions-and-types).

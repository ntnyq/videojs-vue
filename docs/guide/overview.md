---
description: Understand the player architecture, supported features, and documentation structure.
---

# Introduction

`videojs-vue` provides Vue 3 components and composables for Video.js 10. It connects Vue props, events, and reactivity to the upstream player store.

## Choose a starting point

| Goal                                 | Start here                                              |
| ------------------------------------ | ------------------------------------------------------- |
| Add a player with controls           | [Getting started](./getting-started.md)                 |
| Build a custom control layout        | [Compose a player](./composition.md)                    |
| Read playback state or call commands | [State and actions](./state-and-actions.md)             |
| Play an HLS stream                   | [HLS example](../examples/hls.md)                       |
| Translate player labels              | [Internationalization](./internationalization.md)       |
| Look up a prop, event, or export     | [API overview](../api/overview.md)                      |
| Try the library in a browser         | [Playground](https://videojs-vue-playground.vercel.app) |

## Player architecture

A player consists of three parts:

- **PlayerRoot** owns the Video.js video preset and provides Vue context.
- **Video** or **HlsVideo** loads the source and forwards media events.
- A **packaged skin** or **composed controls** presents the interface.

`VideoPlayer` assembles these parts for you. Use `PlayerRoot` directly when you need to control their layout. Each root contains exactly one media component and has its own store.

Read state with `usePlayerState` and change playback with `usePlayerActions`. Both use the same upstream store as the controls.

## Requirements and scope

The package requires Vue 3.5+ and includes `@videojs/html@10.0.1`. HLS support requires the optional `@videojs/hlsjs-video@10.0.1` peer dependency.

The current API covers on-demand native video and HLS, default and neutral skins, custom controls, captions, internationalization, and server rendering. Dedicated audio and live presets, YouTube/Mux adapters, persistence, and a plugin framework are outside the current API.

The former provider/controller API and experimental component entry points have been removed. Use the [documented package entries](../api/overview.md#package-entries), `VideoPlayer` or `PlayerRoot`, and the two player composables.

## About Video.js

Playback behavior, media capabilities, skins, and control semantics come from [Video.js](https://videojs.org). The Vue bindings are maintained in [ntnyq/videojs-vue](https://github.com/ntnyq/videojs-vue); the upstream project is [videojs/video.js](https://github.com/videojs/video.js).

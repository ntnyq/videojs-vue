# videojs-vue

[![CI](https://github.com/ntnyq/videojs-vue/workflows/CI/badge.svg)](https://github.com/ntnyq/videojs-vue/actions)
[![NPM VERSION](https://img.shields.io/npm/v/videojs-vue.svg)](https://www.npmjs.com/package/videojs-vue)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/videojs-vue.svg)](https://www.npmjs.com/package/videojs-vue)
[![LICENSE](https://img.shields.io/github/license/ntnyq/videojs-vue.svg)](https://github.com/ntnyq/videojs-vue/blob/main/LICENSE)

A Vue-first wrapper around the Video.js v10 player primitives.

> [!NOTE]
> Status: **Beta**

## Install

```shell
pnpm add videojs-vue
```

```shell
npm install videojs-vue
```

```shell
yarn add videojs-vue
```

## Usage

The API follows the upstream `@videojs/react` player factory:

```ts
import { createPlayer } from 'videojs-vue'
import { Video, videoFeatures } from 'videojs-vue/video'

const Player = createPlayer({
  features: videoFeatures,
  displayName: 'VideoPlayer',
})
```

Render it with Vue's `h()` API or JSX:

```ts
import { defineComponent, h } from 'vue'

export default defineComponent({
  setup() {
    const paused = Player.usePlayer(state => state.paused)
    const store = Player.usePlayer()

    return () =>
      h(Player.Provider, () =>
        h(Player.Container, { class: 'player-shell' }, () => [
          h(Video, {
            src: 'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4',
            playsInline: true,
          }),
          h(
            'button',
            {
              type: 'button',
              onClick: () => (paused.value ? store.play() : store.pause()),
            },
            paused.value ? 'Play' : 'Pause',
          ),
        ]),
      )
  },
})
```

## API

### Root exports

- `createPlayer(config)` returns:
  - `Provider`
  - `Container`
  - `usePlayer()`
  - `useMedia()`
- `usePlayer(selector)` returns a readonly `ref`, which is the Vue equivalent of the React hook's reactive selected value.
- `useOptionalPlayer()`, `useContainer()`, `useMediaAttach()` and `useContainerAttach()` are also exported for lower-level integrations.

### Preset entry points

- `videojs-vue/video`
  - `Video`
  - `videoFeatures`
- `videojs-vue/audio`
  - `Audio`
  - `audioFeatures`
- `videojs-vue/background`
  - `BackgroundVideo`
  - `backgroundFeatures`

## Notes

- `Provider` owns the Video.js store instance and reattaches it whenever the media element or container changes.
- `Container` keeps the same focus behavior as the React implementation: on pointer release it focuses itself when nothing inside already has focus, so keyboard shortcuts can work reliably.
- Media components use native `<video>` / `<audio>` elements and register themselves automatically through provide/inject.

## License

[MIT](./LICENSE) License © 2026-PRESENT [ntnyq](https://github.com/ntnyq)

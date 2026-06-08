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
- `createPlayer({ plugins })` supports runtime extension hooks:
  - `onProviderSetup(context)`
  - `onAttach(context)`
  - `onDetach(context)`
  - `onProviderDestroy(context)`
- `usePlayer(selector)` returns a readonly `ref`, which is the Vue equivalent of the React hook's reactive selected value.
- `useOptionalPlayer()`, `useContainer()`, `useMediaAttach()` and `useContainerAttach()` are also exported for lower-level integrations.
- Utility exports:
  - `mergeProps(...props)`
  - `renderElement(tag, componentProps, params)`

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
- `videojs-vue/live-video`
  - `Video`
  - `liveVideoFeatures`
- `videojs-vue/live-audio`
  - `Audio`
  - `liveAudioFeatures`

### UI entry points

- `videojs-vue/full-screen-button` (or `videojs-vue/fullscreen-button`)
  - `FullscreenButton`
- `videojs-vue/playback-rate-button`
  - `PlaybackRateButton`
- `videojs-vue/poster`
  - `Poster`
- `videojs-vue/time`
  - `Time.Group`
  - `Time.Separator`
  - `Time.Value`
- `videojs-vue/play-button`
  - `PlayButton`
- `videojs-vue/mute-button`
  - `MuteButton`
- `videojs-vue/pip-button`
  - `PiPButton`
- `videojs-vue/seek-button`
  - `SeekButton`
- `videojs-vue/volume-slider`
  - `VolumeSlider.Root`
  - `VolumeSlider.Track`
  - `VolumeSlider.Fill`
  - `VolumeSlider.Thumb`
  - `VolumeSlider.Value`
  - `VolumeSlider.Preview`
- `videojs-vue/time-slider`
  - `TimeSlider.Root`
  - `TimeSlider.Track`
  - `TimeSlider.Buffer`
  - `TimeSlider.Fill`
  - `TimeSlider.Thumb`
  - `TimeSlider.Value`
  - `TimeSlider.Preview`
- `videojs-vue/controls`
  - `Controls.Root`
  - `Controls.Group`
- `videojs-vue/tooltip`
  - `Tooltip.Provider`
  - `Tooltip.Root`
  - `Tooltip.Trigger`
  - `Tooltip.Popup`
  - `Tooltip.Arrow`
- `videojs-vue/popover`
  - `Popover.Root`
  - `Popover.Trigger`
  - `Popover.Popup`
  - `Popover.Arrow`
- `videojs-vue/captions-button`
  - `CaptionsButton`
- `videojs-vue/cast-button`
  - `CastButton`
- `videojs-vue/buffering-indicator`
  - `BufferingIndicator`
- `videojs-vue/alert-dialog`
  - `AlertDialog.Root`
  - `AlertDialog.Popup`
  - `AlertDialog.Title`
  - `AlertDialog.Description`
  - `AlertDialog.Close`
- `videojs-vue/error-dialog`
  - `ErrorDialog.Root`
  - `ErrorDialog.Popup`
  - `ErrorDialog.Title`
  - `ErrorDialog.Description`
  - `ErrorDialog.Close`
- `videojs-vue/hotkey`
  - `Hotkey`
- `videojs-vue/gesture`
  - `Gesture`
- `videojs-vue/thumbnail`
  - `Thumbnail`
- `videojs-vue/slider`
  - `Slider.Root`
  - `Slider.Track`
  - `Slider.Buffer`
  - `Slider.Fill`
  - `Slider.Thumb`
  - `Slider.Value`
  - `Slider.Preview`
  - `Slider.Thumbnail`

## Notes

- `Provider` owns the Video.js store instance and reattaches it whenever the media element or container changes.
- `Container` keeps the same focus behavior as the React implementation: on pointer release it focuses itself when nothing inside already has focus, so keyboard shortcuts can work reliably.
- Media components use native `<video>` / `<audio>` elements, register themselves automatically through provide/inject, and reactively sync key media props (`src`, `poster`, `autoplay`, `controls`, `loop`, `muted`, `playsInline`, `preload`, `crossOrigin`, `volume`, `playbackRate`).
- Captions button now uses reactive track state and auto-disables when no caption/subtitle tracks are available.

## Migration (Current Beta)

- UI button primitives now use unified internal prop-merging behavior (`mergeProps`) instead of per-component manual click chaining.
- External event handlers still run before internal handlers and can cancel internal behavior via `event.preventDefault()`.
- Prefer `playsInline` over lowercase `playsinline` in JSX/templates.

## License

[MIT](./LICENSE) License © 2026-PRESENT [ntnyq](https://github.com/ntnyq)

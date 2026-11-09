---
description: Exported layout components, buttons, sliders, hotkeys, and accessibility helpers.
---

# UI controls

Import UI components from `videojs-vue/ui` and render them inside `VideoPlayerRoot`.

```ts
import { MediaContainer, PlayButton, TimeSlider } from 'videojs-vue/ui'
```

These are unstyled bindings to upstream custom elements. Their default slots, attributes, and event listeners are passed to the underlying elements. Declared props are synchronized as DOM properties; removing a prop restores the element's captured constructor default.

Server rendering includes string and number props and enabled Boolean attributes so initial options such as `defaultOpen` apply before hydration. Function and object props are assigned as DOM properties during hydration.

## Layout and display

| Component              | Declared props | Purpose                                          |
| ---------------------- | -------------- | ------------------------------------------------ |
| `MediaContainer`       | None           | Media and fullscreen container.                  |
| `MediaControls`        | `visibility`   | Control visibility behavior.                     |
| `MediaControlsContent` | None           | Content inside the controls layer.               |
| `MediaControlsGroup`   | None           | Group controls in a layout.                      |
| `Poster`               | None           | Display the player poster.                       |
| `StatusAnnouncer`      | None           | Announce player status for assistive technology. |

`visibility` uses the upstream `ControlsElement['visibility']` type. For example, `visibility="always"` keeps the controls visible.

## Buttons

All buttons accept optional `disabled: boolean` and `label: string` props.

| Component            | Additional props     | Action                                      |
| -------------------- | -------------------- | ------------------------------------------- |
| `PlayButton`         | None                 | Toggle playback.                            |
| `MuteButton`         | None                 | Toggle mute.                                |
| `FullscreenButton`   | None                 | Toggle fullscreen.                          |
| `PiPButton`          | None                 | Toggle picture-in-picture.                  |
| `CaptionsButton`     | None                 | Toggle captions.                            |
| `PlaybackRateButton` | `commandfor: string` | Cycle playback speed, or open a speed menu. |
| `SeekButton`         | `seconds: number`    | Seek by the specified offset.               |

Provide visible content through the default slot. Built-in accessible labels follow player state; an explicit `label` overrides that label. Translate explicit labels in your application when needed.

## Quality and audio menus

Render `QualityRadioGroup` or `AudioTrackRadioGroup` inside `MediaMenuContent`, as a direct child of `MediaMenu`. Open a menu using a native `<button :commandfor="menuId">`. Both groups generate their radio items and synchronize selection with the upstream store; their individual entries register generated item dependencies.

| Component              | Optional props                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `QualityRadioGroup`    | `disabled`, `label`, `formatRendition: QualityRadioGroupElement['formatRendition']`        |
| `AudioTrackRadioGroup` | `disabled`, `label`, `formatTrack: AudioTrackRadioGroupElement['formatTrack']`             |
| `MediaMenu`            | `open`, `defaultOpen`, `side`, `align`, `closeOnEscape`, `closeOnOutsideClick`, `boundary` |
| `MediaMenuContent`     | `open`, `defaultOpen`                                                                      |

Placement and boundary types follow upstream `MenuElement`. These wrappers pass slots, attributes and custom events unchanged, including `@open-change` on menus and `@value-change` on option groups. Selection remains store-owned; call `selectVideoRendition(id)` or `selectAudioTrack(id)` for programmatic selection. Use `"auto"` to restore adaptive quality.

See [quality and audio selection](../examples/media-selection.md) for menu composition, styles, state selectors, and source limitations.

## Captions and playback speed

`CaptionsRadioGroup` generates an Off item and one item per captions or subtitles track. It accepts optional `disabled`, `label`, and `formatTrack: CaptionsRadioGroupElement['formatTrack']` props. Provide tracks through the media component's `tracks` prop or native `<track>` children. The group and its menu trigger hide when no caption or subtitle tracks are available.

`PlaybackRateRadioGroup` generates the speeds from the upstream store's `playbackRates`. It accepts optional `disabled` and `formatRate: PlaybackRateRadioGroupElement['formatRate']` props. Use the `aria-label` attribute to customize its accessible name. `PlaybackRateButton` cycles through those speeds when `commandfor` is omitted; with `commandfor`, it opens the linked menu without cycling. Its visible content comes from the default slot.

The **Custom controls** and **Captions & tracks** examples in the [Playground](https://videojs-vue-playground.ntnyq.dev) use a frosted capsule control bar, separate captions and speed menus, visible current speed, and selected-option checkmarks. Default and Neutral skins retain their upstream settings menus. The Vue bindings do not add CSS or replace the store’s available speed list.

Both groups belong inside `MediaMenuContent`, as a direct child of `MediaMenu`, and forward `@value-change` custom events unchanged. Selection stays in the upstream store and follows changes made by other controls. These are unstyled controls; apply the menu and generated item styles shown in [media selection](../examples/media-selection.md).

```vue
<script setup lang="ts">
import {
  CaptionsRadioGroup,
  MediaContainer,
  MediaMenu,
  MediaMenuContent,
  PlaybackRateButton,
  PlaybackRateRadioGroup,
} from 'videojs-vue/ui'
import { Video, VideoPlayerRoot } from 'videojs-vue/video/core'
import { useId } from 'vue'

const captionsId = useId()
const speedId = useId()
</script>

<template>
  <VideoPlayerRoot>
    <MediaContainer>
      <Video src="/video.mp4">
        <track
          kind="subtitles"
          src="/en.vtt"
          srclang="en"
          label="English"
        />
        <track
          kind="subtitles"
          src="/zh.vtt"
          srclang="zh"
          label="中文"
        />
      </Video>
      <button
        type="button"
        :commandfor="captionsId"
      >
        Subtitles
      </button>
      <MediaMenu :id="captionsId">
        <MediaMenuContent>
          <CaptionsRadioGroup label="Subtitle language" />
        </MediaMenuContent>
      </MediaMenu>
      <PlaybackRateButton :commandfor="speedId">Speed</PlaybackRateButton>
      <MediaMenu :id="speedId">
        <MediaMenuContent>
          <PlaybackRateRadioGroup
            aria-label="Playback speed"
            :format-rate="rate => `${rate}×`"
          />
        </MediaMenuContent>
      </MediaMenu>
    </MediaContainer>
  </VideoPlayerRoot>
</template>
```

## Time

| Prop           | Type                           |
| -------------- | ------------------------------ |
| `type`         | Upstream `TimeElement['type']` |
| `toggle`       | `boolean`                      |
| `negativeSign` | `string`                       |
| `label`        | `string`                       |

All props are optional and retain upstream defaults when omitted.

## Sliders

`TimeSlider` and `VolumeSlider` accept these optional props:

| Prop          | Type                                        |
| ------------- | ------------------------------------------- |
| `disabled`    | `boolean`                                   |
| `label`       | `string`                                    |
| `step`        | `number`                                    |
| `largeStep`   | `number`                                    |
| `orientation` | Upstream `TimeSliderElement['orientation']` |

`TimeSlider` additionally accepts `pauseOnDrag: boolean` and `changeThrottle: number`.

Build slider visuals with `SliderTrack`, `SliderBuffer`, `SliderFill`, and `SliderThumb`. These parts have no declared Vue props. Supply their layout and appearance with CSS.

Listeners such as `@drag-start` and `@drag-end` receive the upstream custom events unchanged.

## Hotkey

| Prop       | Type                               |
| ---------- | ---------------------------------- |
| `keys`     | `string`                           |
| `action`   | Upstream `HotkeyElement['action']` |
| `value`    | `number`                           |
| `disabled` | `boolean`                          |
| `target`   | Upstream `HotkeyElement['target']` |

All props are optional. Accepted action and target values follow the installed upstream types.

## Styling and accessibility

The wrappers preserve upstream keyboard behavior, accessible labels, and state attributes. Keep visible focus styles, give custom controls understandable text, and include `StatusAnnouncer` when assembling a complete interface.

See the [composition guide](../guide/composition.md) for a working layout, the [Playground](https://videojs-vue-playground.ntnyq.dev) for a composed slider, and the [Video.js UI guide](https://videojs.org/docs/framework/html/guides/ui-components) for upstream state attributes and styling.

## Individual entries

Each entry registers only its own control and upstream dependencies. Use these paths when selecting a subset; the `videojs-vue/ui` aggregate still registers all controls.

| Component                | Import path                                |
| ------------------------ | ------------------------------------------ |
| `CaptionsButton`         | `videojs-vue/ui/captions-button`           |
| `CaptionsRadioGroup`     | `videojs-vue/ui/captions-radio-group`      |
| `PlaybackRateButton`     | `videojs-vue/ui/playback-rate-button`      |
| `PlaybackRateRadioGroup` | `videojs-vue/ui/playback-rate-radio-group` |
| `AudioTrackRadioGroup`   | `videojs-vue/ui/audio-track-radio-group`   |
| `QualityRadioGroup`      | `videojs-vue/ui/quality-radio-group`       |
| `MediaMenu`              | `videojs-vue/ui/menu`                      |
| `MediaMenuContent`       | `videojs-vue/ui/menu-content`              |
| `FullscreenButton`       | `videojs-vue/ui/fullscreen-button`         |
| `Hotkey`                 | `videojs-vue/ui/hotkey`                    |
| `MediaContainer`         | `videojs-vue/ui/container`                 |
| `MediaControls`          | `videojs-vue/ui/controls`                  |
| `MediaControlsContent`   | `videojs-vue/ui/controls-content`          |
| `MediaControlsGroup`     | `videojs-vue/ui/controls-group`            |
| `MuteButton`             | `videojs-vue/ui/mute-button`               |
| `PiPButton`              | `videojs-vue/ui/pip-button`                |
| `PlayButton`             | `videojs-vue/ui/play-button`               |
| `Poster`                 | `videojs-vue/ui/poster`                    |
| `SeekButton`             | `videojs-vue/ui/seek-button`               |
| `SliderBuffer`           | `videojs-vue/ui/slider-buffer`             |
| `SliderFill`             | `videojs-vue/ui/slider-fill`               |
| `SliderThumb`            | `videojs-vue/ui/slider-thumb`              |
| `SliderTrack`            | `videojs-vue/ui/slider-track`              |
| `StatusAnnouncer`        | `videojs-vue/ui/status-announcer`          |
| `Time`                   | `videojs-vue/ui/time`                      |
| `TimeSlider`             | `videojs-vue/ui/time-slider`               |
| `VolumeSlider`           | `videojs-vue/ui/volume-slider`             |

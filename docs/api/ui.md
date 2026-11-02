---
description: All 72 upstream UI entries with Vue bindings, typed properties, and granular imports.
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

All buttons accept optional `disabled: boolean` and `label: PlayButtonElement['label']` props (plain text or an upstream translation descriptor). `AirPlayButton` and `CastButton` use the upstream remote playback capability; availability depends on the browser and media adapter. The Cast button does not install or configure a Cast provider.

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

`CaptionsButton` additionally accepts `commandfor: string` and `menuFor: string`. `menuFor` enables the upstream adaptive captions trigger behavior when multiple tracks are available; use a native button with `commandfor` for a menu-only trigger.

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

`TimeSlider` additionally accepts `pauseOnDrag: boolean` and `changeThrottle: number`. Both sliders accept `thumbAlignment: 'center' | 'edge'`; `VolumeSlider` also accepts `wheelStep: number`. `MediaSlider` is the generic slider with these shared props plus `value`, `min`, and `max` numeric properties. It forwards `@value-change` without translating it into Vue `v-model`.

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

## Compound components

Every official `@videojs/html@10.0.1` UI entry has a corresponding Vue binding. These components share the same default-slot, DOM-property, attribute, event, and default-restoration contract described above. Event payloads remain upstream `CustomEvent` objects; read `event.detail` and update controlled props explicitly.

| Components                                                                                             | Optional declared props                                                                                                                   |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `MediaControlsBackdrop`, `MediaTitle`, `TimeGroup`, `TimeSeparator`                                    | None                                                                                                                                      |
| `MediaPopover`, `VolumePopover`                                                                        | `open`, `defaultOpen`, `side`, `align`, `boundary`, `modal`, `closeOnEscape`, `closeOnOutsideClick`, `openOnHover`, `delay`, `closeDelay` |
| `Tooltip`                                                                                              | `open`, `defaultOpen`, `side`, `align`, `boundary`, `delay`, `closeDelay`, `disableHoverablePopup`, `disabled`, `sticky`, `trigger`       |
| `TooltipGroup`                                                                                         | `delay`, `closeDelay`, `timeout`                                                                                                          |
| `TooltipLabel`, `TooltipShortcut`                                                                      | None                                                                                                                                      |
| `SliderPreview`                                                                                        | `overflow: SliderPreviewElement['overflow']`                                                                                              |
| `SliderValue`                                                                                          | `type: 'current' \| 'pointer'`                                                                                                            |
| `Thumbnail`, `SliderThumbnail`                                                                         | `time`, `thumbnails: ThumbnailElement['thumbnails']`, `crossOrigin`, `loading`, `fetchPriority`                                           |
| `TimeSliderChapters`, `TimeSliderChapterTitle`                                                         | None                                                                                                                                      |
| `BufferingIndicator`                                                                                   | `delay`                                                                                                                                   |
| `SeekIndicator`, `VolumeIndicator`                                                                     | `closeDelay`                                                                                                                              |
| `StatusIndicator`                                                                                      | `actions`, `closeDelay`, `deriveCustomStatus: StatusIndicatorElement['deriveCustomStatus']`                                               |
| `SeekIndicatorValue`, `StatusIndicatorValue`, `VolumeIndicatorFill`, `VolumeIndicatorValue`            | None                                                                                                                                      |
| `MediaGesture`                                                                                         | `type`, `action`, `value`, `pointer`, `region`, `disabled` (types follow `GestureElement`)                                                |
| `MediaMenuItem`                                                                                        | `disabled`, `commandfor`                                                                                                                  |
| `MediaMenuCheckboxItem`                                                                                | `checked`, `disabled`                                                                                                                     |
| `MediaMenuRadioGroup`                                                                                  | `value`                                                                                                                                   |
| `MediaMenuRadioItem`                                                                                   | `value`, `disabled`                                                                                                                       |
| `MediaMenuItemIndicator`                                                                               | `checked`, `forceMount`                                                                                                                   |
| `MediaMenuGroup`, `MediaMenuGroupLabel`, `MediaMenuSeparator`                                          | None                                                                                                                                      |
| `MediaDialog`, `AlertDialog`                                                                           | `open`, `defaultOpen`, `closeOnEscape`                                                                                                    |
| `MediaDialogClose`                                                                                     | `disabled`                                                                                                                                |
| `ErrorDialog`, `MediaDialogBackdrop`, `MediaDialogPopup`, `MediaDialogTitle`, `MediaDialogDescription` | None                                                                                                                                      |

Placement types follow upstream `PopoverElement`. Boolean props are optional; omitting them preserves upstream defaults, including defaults that are `true`. Numeric delay values are milliseconds. Thumbnail image policies and gesture actions use their upstream indexed types.

### Composition requirements

- Put popovers, menus, tooltips, gestures, and feedback inside the player, preferably inside `MediaContainer` so they participate in fullscreen and activity tracking.
- Place `Tooltip` after its trigger or set `trigger` to the trigger's ID. `TooltipGroup` shares hover timing. An empty tooltip generates its label and shortcut from an official button; its granular entry registers those generated parts. Author `TooltipLabel` and `TooltipShortcut` to style them explicitly.
- Put `SliderPreview` inside a slider and `SliderValue type="pointer"` inside the preview. `SliderThumbnail` follows slider pointer time; `Thumbnail` displays a supplied `time`. Provide thumbnail metadata through a thumbnails text track or the `thumbnails` array. Style preview visibility with `data-pointing` and `data-dragging`.
- `TimeSliderChapters` uses a child `<template>` for each generated chapter segment. `TimeSliderChapterTitle` belongs inside a time slider and displays the chapter at its current pointer or keyboard position. Supply a chapters text track. In Vue, populate the native template with trusted static markup via `<template v-html="chapterMarkup" />`; the template must contain exactly one HTML root element. Ordinary Vue children of a template are not its inert `content`.
- Compose `SeekIndicatorValue` inside `SeekIndicator`, `StatusIndicatorValue` inside `StatusIndicator`, and `VolumeIndicatorFill` / `VolumeIndicatorValue` inside `VolumeIndicator`. These read upstream action feedback; they do not add gestures or hotkeys themselves. `BufferingIndicator` uses `data-visible` for delayed buffering feedback.
- Use `MediaMenuGroup` with `MediaMenuGroupLabel` for automatically linked accessible group names. Radio items belong inside `MediaMenuRadioGroup`, nested within `MediaMenuContent`. Selection fires `@value-change`; checkbox items fire `@checked-change` and leave the menu open. `MediaMenuItemIndicator` takes explicit `checked` state.
- Compose dialog parts inside `MediaDialog`, `AlertDialog`, or `ErrorDialog`. `MediaDialogPopup` owns the dialog surface; title and description register accessible names, and `MediaDialogClose` closes the dialog. `ErrorDialog` follows the player's error state; it needs authored dialog parts and styles. Empty title, description, and close parts receive upstream translated error copy.

```vue
<TimeSlider>
  <SliderTrack><SliderBuffer /><SliderFill /></SliderTrack>
  <SliderThumb />
  <SliderPreview>
    <SliderThumbnail />
    <SliderValue type="pointer" />
    <TimeSliderChapterTitle />
  </SliderPreview>
</TimeSlider>

<ErrorDialog>
  <MediaDialogBackdrop />
  <MediaDialogPopup>
    <MediaDialogTitle />
    <MediaDialogDescription />
    <MediaDialogClose />
  </MediaDialogPopup>
</ErrorDialog>
```

Import every part rendered in these snippets, then add CSS for their layout and state-based visibility. An empty binding does not provide a styled widget. See the [official UI anatomy](https://videojs.org/docs/framework/html/guides/ui-components) for each compound component.

### Playground component catalog

Choose **UI components** in the Playground navigation to explore all 44 additions. Select a component, filter by category, search its name or entry, or use Previous / Next to step through the list. Related parts share nine interactive recipes with controls, reset, exact source, and original custom events in the event log.

The recipes include local chapter and diagnostic thumbnail fixtures, keyboard and gesture feedback, native media error/recovery, and real remote playback availability. Expand the source view for the recipe and its shared player, styles, types, and fixtures. Thumbnail images are labeled test illustrations rather than frames of the demo video; casting requires compatible devices and a provider.

### Existing interface choices

The playground's custom controls use official buffering feedback, slider preview/value, and accessible menu groups. Legacy uses official playback controls and time grouping; its native playback-speed select stays native to preserve the Chrome 90 path without popover dependencies. External playground settings and action panels retain their application form controls and explicitly targeted player commands.

## Styling and accessibility

The wrappers preserve upstream keyboard behavior, accessible labels, and state attributes. Keep visible focus styles, give custom controls understandable text, and include `StatusAnnouncer` when assembling a complete interface.

See the [composition guide](../guide/composition.md) for a working layout, the [Playground](https://videojs-vue-playground.ntnyq.dev) for a composed slider, and the [Video.js UI guide](https://videojs.org/docs/framework/html/guides/ui-components) for upstream state attributes and styling.

## Individual entries

Each entry registers only its own control and upstream dependencies. Use these paths when selecting a subset; the `videojs-vue/ui` aggregate still registers all controls.

| Component                | Import path                                |
| ------------------------ | ------------------------------------------ |
| `AirPlayButton`          | `videojs-vue/ui/airplay-button`            |
| `AlertDialog`            | `videojs-vue/ui/alert-dialog`              |
| `AudioTrackRadioGroup`   | `videojs-vue/ui/audio-track-radio-group`   |
| `BufferingIndicator`     | `videojs-vue/ui/buffering-indicator`       |
| `CaptionsButton`         | `videojs-vue/ui/captions-button`           |
| `CaptionsRadioGroup`     | `videojs-vue/ui/captions-radio-group`      |
| `CastButton`             | `videojs-vue/ui/cast-button`               |
| `MediaContainer`         | `videojs-vue/ui/container`                 |
| `MediaControls`          | `videojs-vue/ui/controls`                  |
| `MediaControlsBackdrop`  | `videojs-vue/ui/controls-backdrop`         |
| `MediaControlsContent`   | `videojs-vue/ui/controls-content`          |
| `MediaControlsGroup`     | `videojs-vue/ui/controls-group`            |
| `MediaDialog`            | `videojs-vue/ui/dialog`                    |
| `MediaDialogBackdrop`    | `videojs-vue/ui/dialog-backdrop`           |
| `MediaDialogClose`       | `videojs-vue/ui/dialog-close`              |
| `MediaDialogDescription` | `videojs-vue/ui/dialog-description`        |
| `MediaDialogPopup`       | `videojs-vue/ui/dialog-popup`              |
| `MediaDialogTitle`       | `videojs-vue/ui/dialog-title`              |
| `ErrorDialog`            | `videojs-vue/ui/error-dialog`              |
| `FullscreenButton`       | `videojs-vue/ui/fullscreen-button`         |
| `MediaGesture`           | `videojs-vue/ui/gesture`                   |
| `Hotkey`                 | `videojs-vue/ui/hotkey`                    |
| `LiveButton`             | `videojs-vue/ui/live-button`               |
| `MediaMenu`              | `videojs-vue/ui/menu`                      |
| `MediaMenuCheckboxItem`  | `videojs-vue/ui/menu-checkbox-item`        |
| `MediaMenuContent`       | `videojs-vue/ui/menu-content`              |
| `MediaMenuGroup`         | `videojs-vue/ui/menu-group`                |
| `MediaMenuGroupLabel`    | `videojs-vue/ui/menu-group-label`          |
| `MediaMenuItem`          | `videojs-vue/ui/menu-item`                 |
| `MediaMenuItemIndicator` | `videojs-vue/ui/menu-item-indicator`       |
| `MediaMenuRadioGroup`    | `videojs-vue/ui/menu-radio-group`          |
| `MediaMenuRadioItem`     | `videojs-vue/ui/menu-radio-item`           |
| `MediaMenuSeparator`     | `videojs-vue/ui/menu-separator`            |
| `MuteButton`             | `videojs-vue/ui/mute-button`               |
| `PiPButton`              | `videojs-vue/ui/pip-button`                |
| `PlayButton`             | `videojs-vue/ui/play-button`               |
| `PlaybackRateButton`     | `videojs-vue/ui/playback-rate-button`      |
| `PlaybackRateRadioGroup` | `videojs-vue/ui/playback-rate-radio-group` |
| `MediaPopover`           | `videojs-vue/ui/popover`                   |
| `Poster`                 | `videojs-vue/ui/poster`                    |
| `QualityRadioGroup`      | `videojs-vue/ui/quality-radio-group`       |
| `SeekButton`             | `videojs-vue/ui/seek-button`               |
| `SeekIndicator`          | `videojs-vue/ui/seek-indicator`            |
| `SeekIndicatorValue`     | `videojs-vue/ui/seek-indicator-value`      |
| `MediaSlider`            | `videojs-vue/ui/slider`                    |
| `SliderBuffer`           | `videojs-vue/ui/slider-buffer`             |
| `SliderFill`             | `videojs-vue/ui/slider-fill`               |
| `SliderPreview`          | `videojs-vue/ui/slider-preview`            |
| `SliderThumb`            | `videojs-vue/ui/slider-thumb`              |
| `SliderThumbnail`        | `videojs-vue/ui/slider-thumbnail`          |
| `SliderTrack`            | `videojs-vue/ui/slider-track`              |
| `SliderValue`            | `videojs-vue/ui/slider-value`              |
| `StatusAnnouncer`        | `videojs-vue/ui/status-announcer`          |
| `StatusIndicator`        | `videojs-vue/ui/status-indicator`          |
| `StatusIndicatorValue`   | `videojs-vue/ui/status-indicator-value`    |
| `Thumbnail`              | `videojs-vue/ui/thumbnail`                 |
| `Time`                   | `videojs-vue/ui/time`                      |
| `TimeGroup`              | `videojs-vue/ui/time-group`                |
| `TimeSeparator`          | `videojs-vue/ui/time-separator`            |
| `TimeSlider`             | `videojs-vue/ui/time-slider`               |
| `TimeSliderChapterTitle` | `videojs-vue/ui/time-slider-chapter-title` |
| `TimeSliderChapters`     | `videojs-vue/ui/time-slider-chapters`      |
| `MediaTitle`             | `videojs-vue/ui/title`                     |
| `Tooltip`                | `videojs-vue/ui/tooltip`                   |
| `TooltipGroup`           | `videojs-vue/ui/tooltip-group`             |
| `TooltipLabel`           | `videojs-vue/ui/tooltip-label`             |
| `TooltipShortcut`        | `videojs-vue/ui/tooltip-shortcut`          |
| `VolumeIndicator`        | `videojs-vue/ui/volume-indicator`          |
| `VolumeIndicatorFill`    | `videojs-vue/ui/volume-indicator-fill`     |
| `VolumeIndicatorValue`   | `videojs-vue/ui/volume-indicator-value`    |
| `VolumePopover`          | `videojs-vue/ui/volume-popover`            |
| `VolumeSlider`           | `videojs-vue/ui/volume-slider`             |

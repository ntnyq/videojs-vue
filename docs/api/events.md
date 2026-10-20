---
description: Player readiness, confirmed setting updates, and forwarded native media events.
---

# Events

## Player events

`VideoPlayer` and `VideoPlayerRoot` emit these events:

| Event                 | Payload             | When emitted                                            |
| --------------------- | ------------------- | ------------------------------------------------------- |
| `ready`               | `VideoPlayerHandle` | The mounted or reactivated root has acquired its store. |
| `update:volume`       | `number`            | Media confirmation reports a changed volume.            |
| `update:muted`        | `boolean`           | Media confirmation reports a changed mute setting.      |
| `update:playbackRate` | `number`            | Media confirmation reports a changed playback rate.     |

Setting confirmation runs after `volumechange` or `ratechange`, batches updates until Vue's next tick, and suppresses unchanged values. These events report the actual media settings; they are not a guaranteed initial snapshot on `ready`.

Use `v-model:volume`, `v-model:muted`, and `v-model:playback-rate` on `VideoPlayer`. In composition mode, bind settings to the media component and listen for confirmations on `VideoPlayerRoot`.

## Media events

`Video`, `HlsVideo`, `VideoPlayerRoot`, and `VideoPlayer` forward the original `Event` object for every event listed below. Handlers can use the event's media target or a player handle to inspect the media element.

| Category           | Events                                                                     |
| ------------------ | -------------------------------------------------------------------------- |
| Loading            | `loadstart`, `progress`, `suspend`, `abort`, `emptied`, `stalled`, `error` |
| Readiness          | `loadedmetadata`, `loadeddata`, `canplay`, `canplaythrough`                |
| Playback           | `play`, `playing`, `pause`, `waiting`, `ended`                             |
| Timeline           | `durationchange`, `timeupdate`, `seeking`, `seeked`                        |
| Settings           | `volumechange`, `ratechange`                                               |
| Picture-in-picture | `enterpictureinpicture`, `leavepictureinpicture`                           |

There is no whole-state change event. Use [useVideoPlayerState](./composables.md#usevideoplayerstate) for reactive state rather than duplicating playback state in event handlers.

## Readiness milestones

| Signal           | Meaning                                                  |
| ---------------- | -------------------------------------------------------- |
| `ready`          | The player store is available for actions and selectors. |
| `loadedmetadata` | Media metadata has loaded.                               |
| `canplay`        | The media element reports that playback can start.       |
| `playing`        | Playback has started or resumed after waiting.           |

`ready` alone does not mean duration is known or video data is buffered. The browser controls media event timing.

## Handle errors

The `error` event reports a media failure. Read `player.media?.error` for details. Command failures, such as a rejected `play()`, must be caught separately; they do not become synthetic media events.

See [state and actions](../guide/state-and-actions.md) for error handling and [troubleshooting](../guide/troubleshooting.md) for common causes.
